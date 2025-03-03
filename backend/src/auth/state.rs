use std::collections::{HashMap, HashSet};

use jsonwebtoken::{
  jwk::{AlgorithmParameters, JwkSet},
  DecodingKey, Validation,
};
use reqwest::{multipart::Form, redirect::Policy, Client, StatusCode, Url};
use rocket::tokio::sync::Mutex;
use serde::Deserialize;
use uuid::Uuid;

use crate::error::{Error, Result};

pub struct OIDCState {
  client_id: String,
  client_secret: String,
  auth_url: Url,
  token_url: Url,
  user_url: Url,
  jwk_set: JwkSet,
  issuer: String,
  client: Client,
  pending_codes: Mutex<HashSet<Uuid>>,
  pending_tokens: Mutex<HashSet<Uuid>>,
  pub frontend_url: String,
}

#[derive(Deserialize, Debug)]
struct OIDCConfiguration {
  issuer: String,
  authorization_endpoint: String,
  token_endpoint: String,
  userinfo_endpoint: String,
  jwks_uri: String,
}

#[derive(Deserialize)]
struct TokenRes {
  access_token: String,
}

#[derive(Deserialize)]
pub struct AuthInfo {
  pub sub: Uuid,
  pub exp: i64,
  pub preferred_username: String,
}

impl OIDCState {
  pub async fn new() -> Self {
    let client_id = std::env::var("OIDC_ID").expect("Failed to read OIDC_ID");
    let client_secret = std::env::var("OIDC_SECRET").expect("Failed to read OIDC_SECRET");
    let config_url = std::env::var("OIDC_CONFIG_URL").expect("Failed to read OIDC_CONFIG_URL");
    let frontend_url = std::env::var("FRONTEND_URL").expect("Failed to read FRONTEND_URL");

    let config: OIDCConfiguration = reqwest::get(config_url)
      .await
      .expect("Failed to retrieve OIDC config")
      .json()
      .await
      .expect("Failed to parse OIDC config");

    let auth_url = config
      .authorization_endpoint
      .parse()
      .expect("Failed to parse auth_url");
    let token_url = config
      .token_endpoint
      .parse()
      .expect("Failed to parse token_url");
    let user_url = config
      .userinfo_endpoint
      .parse()
      .expect("Failed to parse user_url");
    let issuer = config.issuer;

    let jwk_set: JwkSet = reqwest::get(config.jwks_uri)
      .await
      .expect("Failed to retrieve OIDC JWK keys")
      .json()
      .await
      .expect("Failed to parse OIDC JWK keys");

    let client = Client::builder()
      .redirect(Policy::none())
      .build()
      .expect("Failed to create HTTP client");

    Self {
      client_id,
      client_secret,
      auth_url,
      token_url,
      user_url,
      jwk_set,
      issuer,
      client,
      pending_codes: Mutex::new(HashSet::new()),
      pending_tokens: Mutex::new(HashSet::new()),
      frontend_url,
    }
  }

  pub async fn start_auth(&self) -> Result<String> {
    let nonce = Uuid::new_v4();
    let state = Uuid::new_v4();
    let form = Form::new()
      .text("response_type", "code")
      .text("client_id", self.client_id.clone())
      .text("state", state.to_string())
      .text("nonce", nonce.to_string());

    let req = self
      .client
      .post(self.auth_url.clone())
      .multipart(form)
      .build()?;

    let res = self.client.execute(req).await?;

    if res.status() != StatusCode::FOUND {
      return Err(Error::InternalServerError);
    }
    let Some(Ok(location)) = res.headers().get("Location").map(|h| h.to_str()) else {
      return Err(Error::InternalServerError);
    };

    self.pending_codes.lock().await.insert(state);
    self.pending_tokens.lock().await.insert(nonce);

    Ok(location.to_string())
  }

  pub async fn finish_auth(&self, code: &str, state: &str) -> Result<AuthInfo> {
    let Ok(state) = state.parse() else {
      return Err(Error::InternalServerError);
    };
    if !self.pending_codes.lock().await.remove(&state) {
      return Err(Error::InternalServerError);
    }

    let form = Form::new()
      .text("grant_type", "authorization_code")
      .text("code", code.to_string());

    let req = self
      .client
      .post(self.token_url.clone())
      .basic_auth(&self.client_id, Some(&self.client_secret))
      .multipart(form)
      .build()?;

    let res: TokenRes = self.client.execute(req).await?.json().await?;
    self.validate_jwk(&res.access_token).await?;

    let req = self
      .client
      .get(self.user_url.clone())
      .bearer_auth(res.access_token)
      .build()?;
    let res: AuthInfo = self.client.execute(req).await?.json().await?;

    Ok(res)
  }

  async fn validate_jwk(&self, token: &str) -> Result<()> {
    let header = jsonwebtoken::decode_header(token)?;

    let Some(kid) = header.kid else {
      return Err(Error::InternalServerError);
    };

    let Some(jwk) = self.jwk_set.find(&kid) else {
      return Err(Error::InternalServerError);
    };

    let decoding_key = match &jwk.algorithm {
      AlgorithmParameters::RSA(rsa) => DecodingKey::from_rsa_components(&rsa.n, &rsa.e)?,
      _ => return Err(Error::InternalServerError),
    };

    let validation = {
      let mut validation = Validation::new(header.alg);
      validation.set_audience(&[self.client_id.to_string()]);
      validation.set_issuer(&[&self.issuer]);
      validation.validate_exp = false;
      validation
    };

    let data = jsonwebtoken::decode::<HashMap<String, serde_json::Value>>(
      token,
      &decoding_key,
      &validation,
    )?;

    let Some(Some(Ok(nonce))) = data
      .claims
      .get("nonce")
      .map(|nonce| nonce.as_str().map(|nonce| nonce.parse()))
    else {
      return Err(Error::InternalServerError);
    };
    if !self.pending_tokens.lock().await.remove(&nonce) {
      return Err(Error::InternalServerError);
    }

    Ok(())
  }
}
