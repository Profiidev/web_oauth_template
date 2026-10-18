//! Full-stack tests against a real postgres (testcontainers) instead of sqlite.
//!
//! Booting the app covers centaurus `init_db` on postgres (including every
//! migration), and the flows below hit the user and group handlers.
mod common;

use common::{TestServer, unique};
use reqwest::StatusCode;
use serde_json::{Value, json};
use uuid::Uuid;

#[tokio::test]
async fn pg_boot_setup_and_login() {
  let (server, admin) = TestServer::with_admin(TestServer::start_pg().await).await;

  server.clear_cookies();
  let resp = server.login("admin@example.com", "hunter2pass").await;
  assert_eq!(resp.status(), StatusCode::OK);

  let info: Value = server.get("/user/info").await.json().await.unwrap();
  assert_eq!(info["uuid"].as_str().unwrap(), admin.to_string());
}

#[tokio::test]
async fn pg_user_and_group_flow() {
  let (server, _) = TestServer::with_admin(TestServer::start_pg().await).await;

  let email = format!("{}@example.com", unique("member"));
  let password = server.encrypt_password("memberpass1").await;
  let resp = server
    .post(
      "/user/management",
      json!({ "name": "Member", "email": email, "password": password }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::OK);
  let user: Uuid = resp.json::<Value>().await.unwrap()["uuid"]
    .as_str()
    .unwrap()
    .parse()
    .unwrap();

  // duplicate email hits the postgres unique constraint
  let password = server.encrypt_password("memberpass1").await;
  let resp = server
    .post(
      "/user/management",
      json!({ "name": "Other", "email": email, "password": password }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::CONFLICT);

  let name = unique("editors");
  let resp = server.post("/group", json!({ "name": name })).await;
  assert_eq!(resp.status(), StatusCode::OK);
  let group: Uuid = resp.json::<Value>().await.unwrap()["uuid"]
    .as_str()
    .unwrap()
    .parse()
    .unwrap();

  let resp = server
    .put(
      "/group",
      json!({ "uuid": group, "name": name, "permissions": ["group:view"], "users": [user] }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::OK);

  // the new member can log in on postgres too
  server.clear_cookies();
  assert_eq!(
    server.login(&email, "memberpass1").await.status(),
    StatusCode::OK
  );
  let info: Value = server.get("/user/info").await.json().await.unwrap();
  assert_eq!(info["uuid"].as_str().unwrap(), user.to_string());

  // deleting the user cascades its group membership
  server.clear_cookies();
  server.login("admin@example.com", "hunter2pass").await;
  let resp = server
    .delete("/user/management", json!({ "uuid": user }))
    .await;
  assert_eq!(resp.status(), StatusCode::OK);
  let resp = server.delete("/group", json!({ "uuid": group })).await;
  assert_eq!(resp.status(), StatusCode::OK);
}
