use aide::axum::ApiRouter;
use axum::{Extension, Router};
use centaurus::{
  backend::{
    auth,
    endpoints::{self, group, mail, setup, user, websocket},
    init::{listener_setup, run_app_connect_info},
    middleware::rate_limiter::RateLimiter,
    router::build_router,
  },
  db::init::init_db,
  logging::init_logging,
  version_header,
};
use tokio::net::TcpListener;
use tracing::info;

use crate::{config::Config, utils::UpdateMessage};

mod config;
mod db;
mod dummy;
mod settings;
mod utils;

pub async fn serve() {
  let config = Config::parse();
  init_logging(config.base.log_level);

  App::from_config(config).await.run().await;
}

pub struct App {
  app: Router,
  listener: TcpListener,
}

impl App {
  pub async fn new() -> App {
    App::from_config(Config::parse()).await
  }

  pub async fn from_config(config: Config) -> App {
    let listener = listener_setup(config.base.port).await;
    let mut app = build_router(api_router, state, config).await;
    version_header!(app);

    App { app, listener }
  }

  pub fn port(&self) -> u16 {
    self
      .listener
      .local_addr()
      .expect("Failed to read listener address")
      .port()
  }

  pub async fn run(self) {
    info!("Starting application...");
    run_app_connect_info(self.listener, self.app).await;
  }
}

fn api_router(rate_limiter: &mut RateLimiter) -> ApiRouter {
  ApiRouter::new()
    .nest("/ws", websocket::router::<UpdateMessage>())
    .nest("/setup", setup::router())
    .nest("/auth", auth::router::<UpdateMessage>(rate_limiter))
    .nest("/user", user::router::<UpdateMessage>(rate_limiter))
    .nest("/settings", settings::router())
    .nest("/mail", mail::router(rate_limiter))
    .nest("/group", group::router::<UpdateMessage>())
    .nest("/dummy", dummy::router())
}

async fn state(mut router: ApiRouter, config: Config) -> ApiRouter {
  let db = init_db::<migration::Migrator>(&config.db, &config.db_url).await;
  centaurus::backend::endpoints::setup::create_admin_group(
    &db,
    utils::permissions(),
    Some(config.admin_group.clone()),
  )
  .await
  .expect("Failed to create admin group");

  router = endpoints::user::state(router);
  router = auth::state(router, &config, &db).await;
  router = mail::state(router, &db, &config).await;
  router = dummy::state(router);
  router = websocket::state::<UpdateMessage>(router).await;

  router.layer(Extension(db))
}

#[cfg(test)]
mod test {
  use super::*;
  use centaurus::backend::middleware::rate_limiter::RateLimiter;

  #[test]
  fn api_router_builds_all_module_routers() {
    // Exercises every module's `router()` builder (including the rate-limited
    // `auth`/`user`/`mail` ones) plus the top-level `api_router` wiring.
    let mut rate_limiter = RateLimiter::default();
    let _ = api_router(&mut rate_limiter);
  }
}
