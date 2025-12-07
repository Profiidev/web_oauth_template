use axum::{Extension, Router};
use centaurus::{db::init::Connection, router_extension};

use crate::{
  auth::{
    jwt_state::{JwtInvalidState, JwtState},
    oidc::OidcState,
  },
  config::Config,
};

pub mod jwt_auth;
mod jwt_state;
mod logout;
mod oidc;
mod res;
mod test_token;

pub fn router() -> Router {
  test_token::router()
    .merge(logout::router())
    .merge(oidc::router())
}

router_extension!(
  async fn auth(self, config: &Config, db: &Connection) -> Self {
    self
      .layer(Extension(JwtState::init(config, db).await))
      .layer(Extension(JwtInvalidState::default()))
      .layer(Extension(
        OidcState::new(config)
          .await
          .expect("Failed to initialize OIDC state"),
      ))
  }
);
