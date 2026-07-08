mod common;

use common::TestServer;
use reqwest::StatusCode;
use serde_json::Value;

#[tokio::test]
async fn info_requires_authentication() {
  let server = TestServer::start().await;
  let resp = server.get("/user/info").await;
  assert!(!resp.status().is_success());
}

#[tokio::test]
async fn info_returns_admin_profile() {
  let (server, admin_id) = TestServer::start_with_admin().await;

  let resp = server.get("/user/info").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let body: Value = resp.json().await.unwrap();
  assert_eq!(body["uuid"], admin_id.to_string());
  assert_eq!(body["email"], "admin@example.com");
  assert_eq!(body["oidc_user"], false);
  assert!(!body["permissions"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn account_settings_round_trip() {
  let (server, _) = TestServer::start_with_admin().await;

  // The default settings are returned for a fresh user...
  let resp = server.get("/settings/user").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let body: Value = resp.json().await.unwrap();

  // ...and saving the inner settings back is accepted.
  let resp = server.post("/settings/user", body["settings"].clone()).await;
  assert_eq!(resp.status(), StatusCode::OK);

  let resp = server.get("/settings/user").await;
  let after: Value = resp.json().await.unwrap();
  assert_eq!(after, body);
}

#[tokio::test]
async fn account_settings_requires_auth() {
  let server = TestServer::start().await;
  let resp = server.get("/settings/user").await;
  assert!(!resp.status().is_success());
}

#[tokio::test]
async fn mail_settings_readable_by_admin() {
  let (server, _) = TestServer::start_with_admin().await;
  let resp = server.get("/settings/mail").await;
  assert_eq!(resp.status(), StatusCode::OK);
}

#[tokio::test]
async fn password_change_flow() {
  let (server, _) = TestServer::start_with_admin().await;

  let old_pw = server.encrypt_password("hunter2pass").await;
  let new_pw = server.encrypt_password("brandnewpass").await;
  let resp = server
    .post(
      "/user/account/password",
      serde_json::json!({ "old_password": old_pw, "new_password": new_pw }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::OK);

  // The new password now logs in; the old one does not.
  server.clear_cookies();
  let resp = server.login("admin@example.com", "brandnewpass").await;
  assert_eq!(resp.status(), StatusCode::OK);

  server.clear_cookies();
  let resp = server.login("admin@example.com", "hunter2pass").await;
  assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn password_change_wrong_old_password_forbidden() {
  let (server, _) = TestServer::start_with_admin().await;

  let wrong_old = server.encrypt_password("notmypassword").await;
  let new_pw = server.encrypt_password("brandnewpass").await;
  let resp = server
    .post(
      "/user/account/password",
      serde_json::json!({ "old_password": wrong_old, "new_password": new_pw }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::FORBIDDEN);
}
