//! First-run setup + password auth flows.
//!
//! Ported from the positron backend suite and adapted to the centaurus
//! endpoints this template exposes (`/setup`, `/auth/password`,
//! `/auth/logout`, `/auth/test_token`).

mod common;

use common::{JWT_COOKIE_NAME, TestServer, extract_jwt_cookie};
use reqwest::StatusCode;
use serde_json::{Value, json};

#[tokio::test]
async fn is_setup_reports_false_then_true() {
  let server = TestServer::start().await;

  let resp = server.get("/setup").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let body: Value = resp.json().await.unwrap();
  assert_eq!(body["is_setup"], false);
  assert_eq!(body["db_backend"], "SQLite");

  server
    .setup_admin("admin", "admin@example.com", "hunter2pass")
    .await;

  let body: Value = server.get("/setup").await.json().await.unwrap();
  assert_eq!(body["is_setup"], true);
}

#[tokio::test]
async fn setup_sets_auth_cookie_and_grants_access() {
  let (server, admin_id) = TestServer::start_with_admin().await;

  assert!(server.has_cookie(JWT_COOKIE_NAME));

  let resp = server.get("/user/info").await;
  assert_eq!(resp.status(), StatusCode::OK);
  let body: Value = resp.json().await.unwrap();
  assert_eq!(body["uuid"], admin_id.to_string());
  assert_eq!(body["name"], "admin");
  assert!(!body["permissions"].as_array().unwrap().is_empty());
}

#[tokio::test]
async fn setup_twice_conflicts() {
  let (server, _) = TestServer::start_with_admin().await;

  let encrypted = server.encrypt_password("anotherpass").await;
  let resp = server
    .post(
      "/setup",
      json!({
        "admin_username": "admin2",
        "admin_email": "admin2@example.com",
        "admin_password": encrypted,
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn setup_rejects_empty_username() {
  let server = TestServer::start().await;
  let encrypted = server.encrypt_password("hunter2pass").await;

  let resp = server
    .post(
      "/setup",
      json!({
        "admin_username": "   ",
        "admin_email": "admin@example.com",
        "admin_password": encrypted,
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn setup_rejects_empty_email() {
  let server = TestServer::start().await;
  let encrypted = server.encrypt_password("hunter2pass").await;

  let resp = server
    .post(
      "/setup",
      json!({
        "admin_username": "admin",
        "admin_email": "   ",
        "admin_password": encrypted,
      }),
    )
    .await;
  assert_eq!(resp.status(), StatusCode::BAD_REQUEST);
}

#[tokio::test]
async fn login_with_correct_password_succeeds() {
  let (server, admin_id) = TestServer::start_with_admin().await;
  server.clear_cookies();

  let resp = server.login("admin@example.com", "hunter2pass").await;
  assert_eq!(resp.status(), StatusCode::OK);
  assert!(extract_jwt_cookie(&resp).is_some());
  let body: Value = resp.json().await.unwrap();
  assert_eq!(body["user"], admin_id.to_string());
}

#[tokio::test]
async fn login_with_wrong_password_is_unauthorized() {
  let (server, _) = TestServer::start_with_admin().await;
  server.clear_cookies();

  let resp = server.login("admin@example.com", "wrongpass").await;
  assert_eq!(resp.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_token_valid_then_invalid_after_logout() {
  let (server, _) = TestServer::start_with_admin().await;

  let body: Value = server.get("/auth/test_token").await.json().await.unwrap();
  assert_eq!(body["valid"], true);

  server.clear_cookies();
  let body: Value = server.get("/auth/test_token").await.json().await.unwrap();
  assert_eq!(body["valid"], false);
}

#[tokio::test]
async fn logout_clears_session() {
  let (server, _) = TestServer::start_with_admin().await;

  let resp = server.post("/auth/logout", Value::Null).await;
  assert_eq!(resp.status(), StatusCode::OK);
  assert!(!server.has_cookie(JWT_COOKIE_NAME));

  let resp = server.get("/user/info").await;
  assert!(!resp.status().is_success());
}
