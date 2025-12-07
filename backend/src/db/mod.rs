use centaurus::db::init::Connection;

use crate::db::{invalid_jwt::InvalidJwtTable, key::KeyTable};

pub mod invalid_jwt;
pub mod key;

pub trait DBTrait {
  fn invalid_jwt(&self) -> InvalidJwtTable<'_>;
  fn key(&self) -> KeyTable<'_>;
}

impl DBTrait for Connection {
  fn invalid_jwt(&self) -> InvalidJwtTable<'_> {
    InvalidJwtTable::new(self)
  }

  fn key(&self) -> KeyTable<'_> {
    KeyTable::new(self)
  }
}
