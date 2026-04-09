use aide::{
  OperationIo,
  axum::{ApiRouter, routing::get_with},
};
use axum::{Extension, extract::FromRequestParts};
use centaurus::error::Result;

use crate::auth::jwt_auth::JwtAuth;

pub fn router() -> ApiRouter {
  ApiRouter::new().api_route("/test", get_with(test, |op| op.id("test")))
}

pub fn state(router: ApiRouter) -> ApiRouter {
  router.layer(Extension(TestState::default()))
}

async fn test(auth: JwtAuth, test: TestState) -> Result<String> {
  Ok(format!("{} - {}", test.test, auth.user_id))
}

#[derive(Clone, FromRequestParts, OperationIo)]
#[from_request(via(Extension))]
struct TestState {
  test: String,
}

impl Default for TestState {
  fn default() -> Self {
    Self {
      test: "test".to_string(),
    }
  }
}
