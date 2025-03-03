use jwt::{JwtInvalidState, JwtState};
use rocket::{Build, Rocket, Route};
use sea_orm::DatabaseConnection;
use state::OIDCState;

mod endpoint;
mod jwt;
mod oidc;
mod state;

pub fn routes() -> Vec<Route> {
  oidc::routes()
    .into_iter()
    .chain(endpoint::routes())
    .flat_map(|route| route.map_base(|base| format!("{}{}", "/auth", base)))
    .collect()
}

pub fn state(server: Rocket<Build>) -> Rocket<Build> {
  server.manage(JwtInvalidState::default())
}

pub struct AsyncAuthStates {
  jwt: JwtState,
  oidc: OIDCState,
}

impl AsyncAuthStates {
  pub async fn new(db: &DatabaseConnection) -> Self {
    Self {
      jwt: JwtState::init(db).await,
      oidc: OIDCState::new().await,
    }
  }

  pub async fn add(self, server: Rocket<Build>) -> Rocket<Build> {
    server.manage(self.jwt).manage(self.oidc)
  }
}
