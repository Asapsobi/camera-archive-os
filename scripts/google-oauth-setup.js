// One-time authorization: opens a Google consent screen, captures the
// redirect on a local server, exchanges the code for a refresh token, and
// saves it straight into .env (never printed in full, never committed —
// .env is gitignored). Run this once; after that the backend never needs
// you to log in again.
//
// Requires GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET already set
// (in .env or the shell environment) from your OAuth client in Google Cloud
// Console (Credentials → Create Credentials → OAuth client ID → Desktop app).
//
// Usage: npm run google-oauth-setup

import "dotenv/config";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createOAuthClient, SCOPES } from "../server/googleAuth.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ENV_PATH = path.join(__dirname, "..", ".env");
const PORT = 8991;
const redirectUri = `http://localhost:${PORT}`;

function upsertEnvVar(name, value) {
  let content = fs.existsSync(ENV_PATH) ? fs.readFileSync(ENV_PATH, "utf8") : "";
  const line = `${name}=${value}`;
  const pattern = new RegExp(`^${name}=.*$`, "m");
  content = pattern.test(content) ? content.replace(pattern, line) : content.trimEnd() + `\n${line}\n`;
  fs.writeFileSync(ENV_PATH, content);
}

function mask(secret) {
  return secret.length > 12 ? `${secret.slice(0, 8)}...${secret.slice(-4)}` : "***";
}

const client = createOAuthClient(redirectUri);
const authUrl = client.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });

console.log("\nOpen this URL, sign in with the Google account you want the app to use, and click Allow:\n");
console.log(authUrl);
console.log("\nWaiting for the redirect back to this script...\n");

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    res.end("Authorization failed — check the terminal.");
    console.error(`\nGoogle returned an error: ${error}\n`);
    server.close();
    process.exit(1);
  }
  if (!code) {
    res.end("Waiting for authorization...");
    return;
  }

  res.end("Authorized — you can close this tab and go back to the terminal.");

  try {
    const { tokens } = await client.getToken(code);
    if (!tokens.refresh_token) {
      console.log(
        "\nNo refresh token came back — Google only issues one the first time this app is " +
          "authorized (or after access is revoked). Go to https://myaccount.google.com/permissions, " +
          "remove this app's access, then run this again.\n"
      );
    } else {
      upsertEnvVar("GOOGLE_OAUTH_REFRESH_TOKEN", tokens.refresh_token);
      console.log(`\n✓ Authorized. Saved to .env as GOOGLE_OAUTH_REFRESH_TOKEN (${mask(tokens.refresh_token)}).`);
      console.log(
        "For deployment, copy the value from your local .env into your PaaS panel's env vars " +
          "— it's a credential, so paste it directly, don't post it anywhere else.\n"
      );
    }
  } catch (err) {
    console.error("\nCould not exchange the code for tokens:", err.message);
  } finally {
    server.close();
    process.exit(0);
  }
});

server.listen(PORT);
