use centaurus::{
  UpdateMessage,
  backend::{auth::permission, endpoints::websocket},
};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

#[allow(unused)]
pub type Updater = websocket::state::Updater<UpdateMessage>;

#[derive(Serialize, Deserialize, Clone, Copy, Debug, UpdateMessage)]
#[serde(tag = "type")]
pub enum UpdateMessage {
  #[update_message(settings)]
  Settings,
  #[update_message(user)]
  User { uuid: Uuid },
  #[update_message(user_permissions)]
  UserPermissions,
  #[update_message(group)]
  Group { uuid: Uuid },
}

pub fn permissions() -> Vec<&'static str> {
  permission::permissions()
}
