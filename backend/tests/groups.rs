mod common;

use common::{TestServer, unique};
use reqwest::StatusCode;
use serde_json::Value;
use uuid::Uuid;

#[tokio::test]
async fn group_crud_flow() {
  let (server, admin_id) = TestServer::start_with_admin().await;

  // The admin group already exists from setup.
  let resp = server.get("/group").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let initial: Value = resp.json().await.unwrap();
  let initial_len = initial["groups"].as_array().unwrap().len();
  assert!(initial_len >= 1);

  // Create a group.
  let name = unique("editors");
  let resp = server
    .post("/group", serde_json::json!({ "name": name }))
    .await;
  assert_eq!(resp.status(), StatusCode::OK);
  let created: Value = resp.json().await.unwrap();
  let group_id = Uuid::parse_str(created["uuid"].as_str().unwrap()).unwrap();

  // It shows up in the list.
  let resp = server.get("/group").await;
  let listed: Value = resp.json().await.unwrap();
  assert_eq!(listed["groups"].as_array().unwrap().len(), initial_len + 1);

  // Fetch its details.
  let resp = server.get(&format!("/group/{group_id}")).await;
  assert_eq!(resp.status(), StatusCode::OK);

  // Edit it: give it a permission and add the admin user.
  let resp = server
    .put(
      "/group",
      serde_json::json!({
        "uuid": group_id,
        "name": name,
        "permissions": ["apod:list"],
        "users": [admin_id],
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::OK);

  // Delete it.
  let resp = server
    .delete("/group", serde_json::json!({ "uuid": group_id }))
    .await;
  assert_eq!(resp.status(), StatusCode::OK);

  let resp = server.get("/group").await;
  let after: Value = resp.json().await.unwrap();
  assert_eq!(after["groups"].as_array().unwrap().len(), initial_len);
}

#[tokio::test]
async fn group_users_lists_admin() {
  let (server, admin_id) = TestServer::start_with_admin().await;

  let resp = server.get("/group/users").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let users: Value = resp.json().await.unwrap();
  // The admin id appears somewhere in the serialized user list.
  assert!(users.to_string().contains(&admin_id.to_string()));
}

#[tokio::test]
async fn group_endpoints_require_auth() {
  let server = TestServer::start().await;
  assert!(!server.get("/group").await.status().is_success());
}
