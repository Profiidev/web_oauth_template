use std::collections::HashMap;

use cors::cors;
use db::DB;
#[cfg(debug_assertions)]
use dotenv::dotenv;
use rocket::{
  fairing::{self, AdHoc},
  launch, Build, Config, Rocket, Route,
};
use sea_orm_rocket::Database;

mod cors;
mod db;
mod dummy;
mod error;

#[launch]
async fn rocket() -> _ {
  #[cfg(debug_assertions)]
  dotenv().ok();

  let url = std::env::var("LOKI_URL").expect("Failed to load LOKI_URL");
  let level = std::env::var("RUST_LOG")
    .unwrap_or("warn".into())
    .parse()
    .expect("Failed to parse RUST_LOG");
  let application = std::env::var("LOKI_APP").expect("Failed to load LOKI_APP");
  let environment = std::env::var("LOKI_ENV").expect("Failed to load LOKI_ENV");
  let log_labels = HashMap::from_iter([
    ("application".into(), application),
    ("environment".into(), environment),
  ]);
  loki_logger::init_with_labels(url, level, log_labels).expect("Failed to init logger");

  let cors = cors();

  let url = std::env::var("DB_URL").expect("Failed to load DB_URL");
  let sqlx_logging = std::env::var("DB_LOGGING")
    .map(|s| s.parse::<bool>().unwrap_or(false))
    .unwrap_or(false);

  let figment = Config::figment()
    .merge(("address", "0.0.0.0"))
    .merge(("log_level", "normal"))
    .merge((
      "databases.sea_orm",
      sea_orm_rocket::Config {
        url,
        min_connections: None,
        max_connections: 1024,
        connect_timeout: 5,
        idle_timeout: None,
        sqlx_logging,
      },
    ));

  let server = rocket::custom(figment)
    .attach(cors)
    .manage(rocket_cors::catch_all_options_routes())
    .mount("/", routes());

  let server = state(server);
  DB::attach(server).attach(AdHoc::try_on_ignite("DB States init", init_state_with_db))
}

fn routes() -> Vec<Route> {
  dummy::routes().into_iter().collect()
}

fn state(server: Rocket<Build>) -> Rocket<Build> {
  //init state
  dummy::state(server)
}

async fn init_state_with_db(server: Rocket<Build>) -> fairing::Result {
  let db = &DB::fetch(&server).unwrap().conn;

  //init state using db

  Ok(server)
}
