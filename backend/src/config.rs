use axum::{Extension, extract::FromRequestParts};
use centaurus::{
  config::{BaseConfig, MetricsConfig},
  db::config::DBConfig,
};
use figment::{
  Figment,
  providers::{Env, Serialized},
};
use serde::{Deserialize, Serialize};
use tracing::instrument;
use url::Url;

#[derive(Deserialize, Serialize, Clone, Debug, FromRequestParts)]
#[from_request(via(Extension))]
pub struct Config {
  #[serde(flatten)]
  pub base: BaseConfig,
  #[serde(flatten)]
  pub db: DBConfig,
  #[serde(flatten)]
  pub metrics: MetricsConfig,

  pub db_url: String,

  pub jwt_iss: String,
  pub jwt_exp: i64,

  pub oidc_url: Option<String>,
  pub oidc_client_id: Option<String>,
  pub oidc_client_secret: Option<String>,
  pub oidc_scope: Option<String>,

  pub base_url: Url,
}

impl Default for Config {
  fn default() -> Self {
    Self {
      base: BaseConfig::default(),
      db: DBConfig::default(),
      db_url: "".to_string(),
      metrics: MetricsConfig {
        metrics_name: "{{project-name}}".to_string(),
        ..Default::default()
      },
      jwt_iss: "{{project-name}}".to_string(),
      jwt_exp: 604800,
      oidc_url: None,
      oidc_client_id: None,
      oidc_client_secret: None,
      oidc_scope: None,
      base_url: Url::parse("http://localhost:5173").unwrap(),
    }
  }
}

impl Config {
  #[instrument]
  pub fn parse() -> Self {
    let config = Figment::new()
      .merge(Serialized::defaults(Self::default()))
      .merge(Env::raw().global());

    let config: Self = config.extract().expect("Failed to parse configuration");

    if config.db_url.is_empty() {
      panic!("Database URL is not set");
    }

    config
  }
}
