use axum::{Json, Router, routing::get};
use axum_extra::extract::CookieJar;
use tracing::instrument;

use crate::auth::{
  jwt_auth::{COOKIE_NAME, JwtAuth},
  jwt_state::JwtState,
};

pub fn router() -> Router {
  Router::new().route("/test_token", get(test_token))
}

#[instrument(skip(cookies, jwt))]
async fn test_token(
  auth: Option<JwtAuth>,
  mut cookies: CookieJar,
  jwt: JwtState,
) -> (CookieJar, Json<bool>) {
  if auth.is_none() {
    cookies = cookies.remove(jwt.create_cookie(COOKIE_NAME, String::new()));

    (cookies, Json(false))
  } else {
    (cookies, Json(true))
  }
}
