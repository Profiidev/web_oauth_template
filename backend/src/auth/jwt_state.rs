use std::sync::Arc;

use axum::{Extension, extract::FromRequestParts};
use axum_extra::extract::cookie::{Cookie, SameSite};
use centaurus::{
  db::init::Connection,
  error::{ErrorReportStatusExt, Result},
};
use chrono::{Duration, Utc};
use http::StatusCode;
use jsonwebtoken::{Algorithm, DecodingKey, EncodingKey, Header, Validation, decode, encode};
use rsa::{
  RsaPrivateKey, RsaPublicKey,
  pkcs1::{DecodeRsaPrivateKey, EncodeRsaPrivateKey, EncodeRsaPublicKey},
  pkcs8::LineEnding,
  rand_core::OsRng,
};
use serde::{Deserialize, Serialize};
use tokio::sync::Mutex;
use tracing::{info, instrument};
use uuid::Uuid;

use crate::{auth::jwt_auth::COOKIE_NAME, config::Config, db::DBTrait};

const JWT_KEY_NAME: &str = "jwt";
#[cfg(not(any(test, feature = "test")))]
pub const KEY_SIZE: usize = 4096;
#[cfg(any(test, feature = "test"))]
pub const KEY_SIZE: usize = 512;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct JwtClaims {
  pub exp: i64,
  pub iss: String,
  pub sub: String,
  pub r#type: AuthType,
  pub email: String,
  pub name: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq, Eq)]
pub enum AuthType {
  Oidc,
  Internal,
}

#[derive(Clone, FromRequestParts)]
#[from_request(via(Extension))]
pub struct JwtState {
  header: Header,
  encoding_key: EncodingKey,
  decoding_key: DecodingKey,
  validation: Validation,
  iss: String,
  exp: i64,
}

impl JwtState {
  #[instrument(skip(self))]
  pub fn create_token<'c>(
    &self,
    uuid: String,
    r#type: AuthType,
    name: String,
    email: String,
  ) -> Result<Cookie<'c>> {
    let exp = Utc::now()
      .checked_add_signed(Duration::seconds(self.exp))
      .status_context(StatusCode::INTERNAL_SERVER_ERROR, "invalid timestamp")?
      .timestamp();

    let claims = JwtClaims {
      exp,
      iss: self.iss.clone(),
      sub: uuid,
      r#type,
      name,
      email,
    };

    let token = encode(&self.header, &claims, &self.encoding_key)
      .status(StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(self.create_cookie(COOKIE_NAME, token))
  }

  #[instrument(skip(self))]
  pub fn create_cookie<'c>(&self, key: &'c str, token: String) -> Cookie<'c> {
    Cookie::build((key, token))
      .http_only(true)
      .max_age(time::Duration::seconds(self.exp))
      .same_site(SameSite::Lax)
      .secure(true)
      .path("/")
      .build()
  }

  #[instrument(skip(self))]
  pub fn validate_token(&self, token: &str) -> Result<JwtClaims> {
    let token_data = decode::<JwtClaims>(token, &self.decoding_key, &self.validation)?;

    Ok(token_data.claims)
  }

  #[instrument(skip(config, db))]
  pub async fn init(config: &Config, db: &Connection) -> Self {
    let (key, kid) = if let Ok(key) = db.key().get_key_by_name(JWT_KEY_NAME.into()).await {
      (key.private_key, key.id.to_string())
    } else {
      info!("Generating new RSA key for JWT with key size {KEY_SIZE}, this may take a while...");
      let mut rng = OsRng {};
      let private_key = RsaPrivateKey::new(&mut rng, KEY_SIZE).expect("Failed to create Rsa key");
      let key = private_key
        .to_pkcs1_pem(LineEnding::CRLF)
        .expect("Failed to export private key")
        .to_string();

      let uuid = Uuid::new_v4();

      db.key()
        .create_key(JWT_KEY_NAME.into(), key.clone(), uuid)
        .await
        .expect("Failed to save key");

      (key, uuid.to_string())
    };

    let private_key = RsaPrivateKey::from_pkcs1_pem(&key).expect("Failed to load public key");
    let public_key = RsaPublicKey::from(private_key);
    let public_key_pem = public_key
      .to_pkcs1_pem(LineEnding::CRLF)
      .expect("Failed to export public key");

    let mut header = Header::new(Algorithm::RS256);
    header.kid = Some(kid.clone());

    let encoding_key =
      EncodingKey::from_rsa_pem(key.as_bytes()).expect("Failed to create encoding key");
    let decoding_key =
      DecodingKey::from_rsa_pem(public_key_pem.as_bytes()).expect("Failed to create decoding key");

    let mut validation = Validation::new(Algorithm::RS256);
    validation.validate_aud = false;

    Self {
      header,
      encoding_key,
      decoding_key,
      validation,
      exp: config.jwt_exp,
      iss: config.jwt_iss.clone(),
    }
  }
}

#[derive(FromRequestParts, Clone, Default)]
#[from_request(via(Extension))]
pub struct JwtInvalidState {
  pub count: Arc<Mutex<i32>>,
}
