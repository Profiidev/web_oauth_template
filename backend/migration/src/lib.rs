pub use sea_orm_migration::prelude::*;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
  fn migrations() -> Vec<Box<dyn MigrationTrait>> {
    vec![
      Box::new(centaurus::db::migrations::key::Migration),
      Box::new(centaurus::db::migrations::invalid_jwt::Migration),
      Box::new(centaurus::db::migrations::settings::Migration),
      Box::new(centaurus::db::migrations::user::Migration),
      Box::new(centaurus::db::migrations::groups::Migration),
      Box::new(centaurus::db::migrations::setup::Migration),
    ]
  }
}
