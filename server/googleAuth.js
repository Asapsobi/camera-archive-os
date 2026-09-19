// User OAuth 2.0 (not a service account) — the backend acts as your own
// Google account, authorized once via scripts/google-oauth-setup.js, using
// a long-lived refresh token from then on. googleapis handles exchanging it
// for fresh access tokens automatically; nothing here ever needs you to log
// in again.

import { google } from "googleapis";

export const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"];

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set.`);
  return v;
}

// redirectUri only matters for the one-time authorization exchange (the
// setup script overrides it to the real http://localhost:<port> it's
// listening on) — it's irrelevant once we're just using a refresh token.
export function createOAuthClient(redirectUri = "http://localhost") {
  return new google.auth.OAuth2(
    requireEnv("GOOGLE_OAUTH_CLIENT_ID"),
    requireEnv("GOOGLE_OAUTH_CLIENT_SECRET"),
    redirectUri
  );
}

let _client;
export function getAuthClient() {
  if (!_client) {
    _client = createOAuthClient();
    _client.setCredentials({ refresh_token: requireEnv("GOOGLE_OAUTH_REFRESH_TOKEN") });
  }
  return _client;
}
