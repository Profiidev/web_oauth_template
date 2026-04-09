use aide::axum::ApiRouter;
use aide::axum::routing::get_with;
use axum::Json;
use centaurus::backend::{auth::jwt_auth::JwtAuth, settings};
use centaurus::error::Result;
use schemars::JsonSchema;
use serde::Serialize;
use url::Url;

use crate::config::Config;
use crate::utils::UpdateMessage;

pub fn router() -> ApiRouter {
  ApiRouter::new()
    .api_route(
      "/general",
      get_with(general_settings, |op| op.id("getGeneralSettings")),
    )
    .merge(settings::router::<UpdateMessage>())
}

#[derive(Serialize, JsonSchema)]
struct GeneralSettings {
  site_url: Url,
}

async fn general_settings(_auth: JwtAuth, config: Config) -> Result<Json<GeneralSettings>> {
  Ok(Json(GeneralSettings {
    site_url: config.site.site_url,
  }))
}
