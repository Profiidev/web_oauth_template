use rocket::{get, http::CookieJar, response::Redirect, Route, State};

use crate::error::Result;

use super::{jwt::JwtState, state::OIDCState};

pub fn routes() -> Vec<Route> {
  rocket::routes![start_auth, finish_auth]
    .into_iter()
    .flat_map(|route| route.map_base(|base| format!("{}{}", "/oidc", base)))
    .collect()
}

#[get("/start_auth")]
async fn start_auth(state: &State<OIDCState>) -> Result<String> {
  state.start_auth().await
}

#[get("/finish_auth?<code>&<state>")]
async fn finish_auth(
  code: &str,
  state: &str,
  app_state: &State<OIDCState>,
  jwt: &State<JwtState>,
  jar: &CookieJar<'_>,
) -> Redirect {
  if let Ok(info) = app_state.finish_auth(code, state).await {
    if let Ok(cookie) = jwt.create_token(info.sub) {
      jar.add(cookie);
      return Redirect::found(format!("{}/admin", app_state.frontend_url));
    }
  }

  Redirect::found(format!("{}/error", app_state.frontend_url))
}
