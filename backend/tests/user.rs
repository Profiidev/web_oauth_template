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
  assert_eq!(body["totp_enabled"], false);
  assert!(!body["permissions"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn account_settings_round_trip() {
  let (server, _) = TestServer::start_with_admin().await;

  // The default settings are returned for a fresh user...
  let resp = server.get("/settings/account").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let settings: Value = resp.json().await.unwrap();

  // ...and saving them back is accepted.
  let resp = server.post("/settings/account", settings.clone()).await;
  assert_eq!(resp.status(), StatusCode::OK);

  let resp = server.get("/settings/account").await;
  let after: Value = resp.json().await.unwrap();
  assert_eq!(after, settings);
}

#[tokio::test]
async fn account_settings_requires_auth() {
  let server = TestServer::start().await;
  let resp = server.get("/settings/account").await;
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

  // Password change requires a "special access" (re-auth) token.
  let resp = server.special_access("hunter2pass").await;
  assert_eq!(resp.status(), StatusCode::OK);

  let new_pw = server.encrypt_password("brandnewpass").await;
  let resp = server
    .post(
      "/auth/password/change",
      serde_json::json!({ "password": new_pw, "password_confirm": new_pw }),
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
async fn password_change_mismatch_conflicts() {
  let (server, _) = TestServer::start_with_admin().await;
  server.special_access("hunter2pass").await;

  let a = server.encrypt_password("passwordone").await;
  let b = server.encrypt_password("passwordtwo").await;
  let resp = server
    .post(
      "/auth/password/change",
      serde_json::json!({ "password": a, "password_confirm": b }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn special_access_with_wrong_password_is_unauthorized() {
  let (server, _) = TestServer::start_with_admin().await;
  let resp = server.special_access("notmypassword").await;
  assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}
