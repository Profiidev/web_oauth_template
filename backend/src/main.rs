use aide::axum::ApiRouter;
use axum::Extension;
use centaurus::{
  backend::{
    auth, group,
    init::{listener_setup, run_app_connect_info},
    mail,
    middleware::rate_limiter::RateLimiter,
    router::build_router,
    setup, user, websocket,
  },
  db::init::init_db,
  logging::init_logging,
  version_header,
};
#[cfg(debug_assertions)]
use dotenvy::dotenv;
use tracing::info;

use crate::{config::Config, utils::UpdateMessage};

mod config;
mod db;
mod dummy;
mod settings;
mod utils;

#[tokio::main]
async fn main() {
  #[cfg(debug_assertions)]
  dotenv().ok();

  let config = Config::parse();
  init_logging(config.base.log_level);

  let listener = listener_setup(config.base.port).await;
  let mut app = build_router(api_router, state, config).await;
  version_header!(app);

  info!("Starting application");
  run_app_connect_info(listener, app).await;
}

fn api_router(rate_limiter: &mut RateLimiter) -> ApiRouter {
  ApiRouter::new()
    .nest("/ws", websocket::router::<UpdateMessage>())
    .nest("/setup", setup::router())
    .nest("/auth", auth::router(rate_limiter))
    .nest("/user", user::router::<UpdateMessage>(rate_limiter))
    .nest("/settings", settings::router())
    .nest("/mail", mail::router(rate_limiter))
    .nest("/group", group::router::<UpdateMessage>())
    .nest("/dummy", dummy::router())
}

async fn state(router: ApiRouter, config: Config) -> ApiRouter {
  let db = init_db::<migration::Migrator>(&config.db, &config.db_url).await;
  centaurus::backend::setup::create_admin_group(&db, utils::permissions())
    .await
    .expect("Failed to create admin group");

  let mut router = websocket::state::<UpdateMessage>(router).await;
  router = auth::state(router, &config.auth, &db).await;
  router = mail::state(router, &db).await;
  router = dummy::state(router);

  router.layer(Extension(db))
}
