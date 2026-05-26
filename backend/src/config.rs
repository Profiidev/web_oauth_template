use aide::OperationIo;
use axum::{Extension, extract::FromRequestParts};
use centaurus::{
  Config,
  backend::{
    auth::settings::{AuthConfig, UserSettings},
    config::{BaseConfig, MetricsConfig, SiteConfig},
  },
  db::config::DBConfig,
  mail::MailSettings,
};
use figment::{
  Figment,
  providers::{Env, Serialized},
};
use serde::{Deserialize, Serialize};
use tracing::instrument;

#[derive(Deserialize, Serialize, Clone, FromRequestParts, Config, OperationIo)]
#[from_request(via(Extension))]
pub struct Config {
  #[base]
  #[serde(flatten)]
  pub base: BaseConfig,
  #[serde(flatten)]
  pub db: DBConfig,
  #[metrics]
  #[serde(flatten)]
  pub metrics: MetricsConfig,
  #[site]
  #[serde(flatten)]
  pub site: SiteConfig,
  #[auth]
  #[serde(flatten)]
  pub auth: AuthConfig,
  #[mail]
  #[serde(flatten)]
  pub mail: MailSettings,
  #[oidc]
  #[serde(flatten)]
  pub oidc: UserSettings,

  pub db_url: String,
}

impl Default for Config {
  fn default() -> Self {
    Self {
      base: BaseConfig::default(),
      db: DBConfig::default(),
      site: SiteConfig::default(),
      mail: MailSettings::default(),
      oidc: UserSettings::default(),
      db_url: "".to_string(),
      metrics: MetricsConfig {
        metrics_name: "{{project-name}}".to_string(),
        ..Default::default()
      },
      auth: AuthConfig {
        auth_pepper: "__{{project-name}}_PEPPER__".to_string(),
        ..Default::default()
      },
    }
  }
}

impl Config {
  #[instrument]
  pub fn parse() -> Self {
    let config = Figment::new()
      .merge(Serialized::defaults(Self::default()))
      .merge(Env::raw().global());

    let mut config: Self = config.extract().expect("Failed to parse configuration");

    if config.db_url.is_empty() {
      panic!("Database URL is not set");
    }

    if config.db_url.starts_with("sqlite") {
      config.db.validate_sqlite();
    }

    config
  }
}
