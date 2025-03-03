use std::io::Cursor;

use chrono::{Duration, Utc};
use jsonwebtoken::{
  decode, encode,
  errors::{Error, ErrorKind},
  Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use rocket::{
  async_trait,
  http::{Cookie, SameSite, Status},
  request::{FromRequest, Outcome, Request},
  response::Responder,
  serde::json,
  tokio::sync::Mutex,
  Response, State,
};
use rsa::{
  pkcs1::{DecodeRsaPrivateKey, EncodeRsaPrivateKey, EncodeRsaPublicKey},
  pkcs8::LineEnding,
  rand_core::OsRng,
  RsaPrivateKey, RsaPublicKey,
};
use sea_orm::DatabaseConnection;
use sea_orm_rocket::Connection;
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use uuid::Uuid;

use crate::db::{DBTrait, DB};

static COOKIE_NAME: &str = "token";

#[derive(Serialize, Deserialize)]
pub struct JwtClaims {
  pub exp: i64,
  pub iss: String,
  pub sub: Uuid,
}

#[derive(Default)]
pub struct TokenRes<T: Serialize = ()> {
  pub body: T,
}

#[derive(Default)]
pub struct JwtInvalidState {
  pub count: Mutex<i32>,
}

pub struct JwtState {
  header: Header,
  encoding_key: EncodingKey,
  decoding_key: DecodingKey,
  validation: Validation,
  pub iss: String,
  exp: i64,
}

impl JwtState {
  pub fn create_token<'c>(&self, uuid: Uuid) -> Result<Cookie<'c>, Error> {
    let exp = Utc::now()
      .checked_add_signed(Duration::seconds(self.exp))
      .ok_or(Error::from(ErrorKind::ExpiredSignature))?
      .timestamp();

    let claims = JwtClaims {
      exp,
      iss: self.iss.clone(),
      sub: uuid,
    };

    let token = encode(&self.header, &claims, &self.encoding_key)?;

    Ok(self.create_cookie(token, true))
  }

  pub fn create_cookie<'c>(&self, value: String, http: bool) -> Cookie<'c> {
    Cookie::build((COOKIE_NAME, value))
      .http_only(http)
      .max_age(rocket::time::Duration::seconds(self.exp))
      .same_site(SameSite::Lax)
      .secure(true)
      .build()
  }

  pub fn validate_token<C: DeserializeOwned>(&self, token: &str) -> Result<C, Error> {
    Ok(decode::<C>(token, &self.decoding_key, &self.validation)?.claims)
  }

  pub async fn init(db: &DatabaseConnection) -> Self {
    let iss = std::env::var("AUTH_ISSUER").expect("Failed to load JwtIssuer");
    let exp = std::env::var("AUTH_JWT_EXPIRATION")
      .expect("Failed to load JwtExpiration")
      .parse()
      .expect("Failed to parse JwtExpiration");

    let (key, kid) = if let Ok(key) = db.tables().key().get_key_by_name("jwt".into()).await {
      (key.private_key, key.id.to_string())
    } else {
      let mut rng = OsRng {};
      let private_key = RsaPrivateKey::new(&mut rng, 4096).expect("Failed to create Rsa key");
      let key = private_key
        .to_pkcs1_pem(LineEnding::CRLF)
        .expect("Failed to export private key")
        .to_string();

      let uuid = Uuid::new_v4();

      db.tables()
        .key()
        .create_key("jwt".into(), key.clone(), uuid)
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
    validation.set_issuer(&[iss.as_str()]);
    validation.validate_aud = false;

    Self {
      header,
      encoding_key,
      decoding_key,
      validation,
      iss,
      exp,
    }
  }
}

#[async_trait]
impl<'r> FromRequest<'r> for JwtClaims {
  type Error = ();

  async fn from_request(req: &'r Request<'_>) -> Outcome<Self, Self::Error> {
    jwt_from_request::<JwtClaims>(req).await
  }
}

#[async_trait]
impl<'r, 'o: 'r, T: Serialize> Responder<'r, 'o> for TokenRes<T> {
  fn respond_to(self, _request: &'r rocket::Request<'_>) -> rocket::response::Result<'o> {
    let body = json::to_string(&self.body).map_err(|_| Status::InternalServerError)?;

    let response = Response::build()
      .header(rocket::http::Header::new("Cache-Control", "no-store"))
      .header(rocket::http::Header::new("Pragma", "no-cache"))
      .header(rocket::http::Header::new(
        "Content-Type",
        "application/json",
      ))
      .sized_body(body.len(), Cursor::new(body))
      .finalize();
    Ok(response)
  }
}

pub async fn jwt_from_request<C: DeserializeOwned>(req: &Request<'_>) -> Outcome<C, ()> {
  let mut token = match req.headers().get_one("Authorization") {
    Some(token) => token,
    None => match req.cookies().get(COOKIE_NAME) {
      Some(token) => token.value(),
      None => {
        let Some(Ok(token)) = req.query_value::<&str>("token") else {
          return Outcome::Error((Status::BadRequest, ()));
        };

        token
      }
    },
  };

  if let Some(stripped) = token.strip_prefix("Bearer ") {
    token = stripped;
  }

  let Some(jwt) = req.guard::<&State<JwtState>>().await.succeeded() else {
    return Outcome::Error((Status::InternalServerError, ()));
  };
  let Some(conn) = req.guard::<Connection<'_, DB>>().await.succeeded() else {
    return Outcome::Error((Status::InternalServerError, ()));
  };
  let db = conn.into_inner();

  let Ok(valid) = db
    .tables()
    .invalid_jwt()
    .is_token_valid(token.to_string())
    .await
  else {
    return Outcome::Error((Status::InternalServerError, ()));
  };
  if !valid {
    return Outcome::Error((Status::Unauthorized, ()));
  }

  let Ok(claims) = jwt.validate_token(token) else {
    return Outcome::Error((Status::Unauthorized, ()));
  };

  Outcome::Success(claims)
}
