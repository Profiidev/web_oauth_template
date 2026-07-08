mod common;

use common::{TestServer, unique};
use reqwest::StatusCode;
use serde_json::Value;
use uuid::Uuid;

#[tokio::test]
async fn list_users_includes_admin() {
  let (server, admin_id) = TestServer::start_with_admin().await;

  let resp = server.get("/user/management").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let users: Value = resp.json().await.unwrap();
  assert!(users.to_string().contains(&admin_id.to_string()));
}

#[tokio::test]
async fn create_edit_delete_user_flow() {
  let (server, _) = TestServer::start_with_admin().await;

  let email = format!("{}@example.com", unique("member"));
  let password = server.encrypt_password("memberpass1").await;
  let resp = server
    .post(
      "/user/management",
      serde_json::json!({
        "name": "Member",
        "email": email,
        "password": password,
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::OK);
  let created: Value = resp.json().await.unwrap();
  let user_id = Uuid::parse_str(created["uuid"].as_str().unwrap()).unwrap();

  // Its details are retrievable.
  let resp = server.get(&format!("/user/management/{user_id}")).await;
  assert_eq!(resp.status(), StatusCode::OK);

  // Delete the user.
  let resp = server
    .delete("/user/management", serde_json::json!({ "uuid": user_id }))
    .await;
  assert_eq!(resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn create_user_with_duplicate_email_conflicts() {
  let (server, _) = TestServer::start_with_admin().await;

  let password = server.encrypt_password("memberpass1").await;
  let resp = server
    .post(
      "/user/management",
      serde_json::json!({
        "name": "Admin Dup",
        "email": "admin@example.com",
        "password": password,
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn create_user_without_password_is_bad_request() {
  let (server, _) = TestServer::start_with_admin().await;

  // No mailer configured, so a password is mandatory.
  let resp = server
    .post(
      "/user/management",
      serde_json::json!({
        "name": "No Password",
        "email": "nopass@example.com",
        "password": Value::Null,
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn list_groups_simple_and_mail_active() {
  let (server, _) = TestServer::start_with_admin().await;

  let resp = server.get("/user/management/groups").await;
  assert_eq!(resp.status(), StatusCode::OK);

  let resp = server.get("/user/management/mail").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let body: Value = resp.json().await.unwrap();
  // Without SMTP configured the mail service is inactive.
  assert_eq!(body["active"], false);
}

#[tokio::test]
async fn management_requires_auth() {
  let server = TestServer::start().await;
  assert!(!server.get("/user/management").await.status().is_success());
}
