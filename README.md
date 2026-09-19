# ARCHIVE.SYS — camera-archive-os

A Windows XP/Vista-styled desktop e-commerce storefront for vintage digital cameras, backed by a Google Sheet (as the database), Google Drive (for photos), an admin panel, and ZarinPal checkout.

## Stack

- **Frontend**: React + Vite, built to `build/`
- **Backend**: Express (`server/`), serves the built frontend + a JSON API
- **Database**: a Google Sheet — three tabs (`Products`, `Orders`, `OrderItems`), created automatically on boot if missing (`server/sheets.js`)
- **Photo storage**: Google Drive folder, uploaded photos are made link-viewable automatically
- **Payments**: ZarinPal (defaults to their public sandbox until a real merchant ID is set)

## One-time Google Cloud setup

This authorizes the backend to act as **your own Google account** (OAuth), not a separate service account — so there's no sharing step; you already own everything.

1. In [Google Cloud Console](https://console.cloud.google.com), create a project (or reuse one), then enable the **Google Sheets API** and **Google Drive API** for it.
2. **APIs & Services → OAuth consent screen**: User type **External**, fill in the required fields, and add your own Google account under **Test users**. Leave it in "Testing" — no Google verification needed for personal use.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → Application type **Desktop app**. Note the **Client ID** and **Client Secret** shown.
4. Create a Google Sheet for the data, and a Drive folder for photos. Grab their IDs from the URLs:
   - Sheet: `docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`
   - Folder: `drive.google.com/drive/folders/`**`<FOLDER_ID>`**
5. Set `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` (below) locally, then run:
   ```bash
   npm run google-oauth-setup
   ```
   It prints a URL — open it, sign in with the Google account you want the app to use, click Allow. The script catches the redirect itself and saves the resulting refresh token straight into your local `.env` as `GOOGLE_OAUTH_REFRESH_TOKEN` (never printed in full, never committed). Copy that value from `.env` into your PaaS panel's env vars for deployment.

This is genuinely one-time — the refresh token doesn't expire from use, so the backend never needs you to log in again unless you revoke its access yourself at [myaccount.google.com/permissions](https://myaccount.google.com/permissions).

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | no (default 3000) | Port the server listens on |
| `GOOGLE_OAUTH_CLIENT_ID` | **yes** | From the OAuth client created in Cloud Console |
| `GOOGLE_OAUTH_CLIENT_SECRET` | **yes** | From the same OAuth client — a credential, keep it a secret |
| `GOOGLE_OAUTH_REFRESH_TOKEN` | **yes** | Produced once by `npm run google-oauth-setup` — a credential, keep it a secret |
| `GOOGLE_SHEET_ID` | **yes** | The spreadsheet's ID (from its URL) |
| `GOOGLE_DRIVE_FOLDER_ID` | **yes** | The Drive folder's ID (from its URL) — where product photos get uploaded |
| `ADMIN_PASSWORD` | **yes** | Password for `/admin` — admin login is disabled without it |
| `ADMIN_JWT_SECRET` | yes (prod) | Signs admin session cookies — set a real random value before going live |
| `ZARINPAL_MERCHANT_ID` | no | Your real ZarinPal merchant ID. Omitted = ZarinPal sandbox, no real charges |
| `ZARINPAL_SANDBOX` | no | Set to `false` once you have a real merchant ID |
| `EUR_TO_IRR_RATE` | no (default 700000) | Conversion rate used only at the moment of charging — the catalog stays priced in EUR |
| `PUBLIC_BASE_URL` | no | Absolute base URL for payment callbacks; auto-detected from the request if unset |

Copy these into a local `.env` file for `npm run dev:server`, or into your PaaS dashboard's env var / secret panel for deployment — never commit real secrets.

## Local development

```bash
npm install
npm run dev:server   # Express API on :3000, auto-restarts on change
npm run dev           # Vite dev server on :5173, proxies /api to :3000
```

Or run against the production build:

```bash
npm run build
npm start             # serves build/ + the API on one port
```

Check `GET /api/health` any time to see whether the Sheets/Drive connection is actually up — it reports the real error (bad key, sheet not shared, wrong ID, etc.) instead of failing silently.

## Managing products

Products live in the `Products` sheet tab — either edit them at `/admin` (add, edit, disable, delete, upload photos), or bulk-import from folders:

1. Copy `product-drops/_TEMPLATE`, rename it to the camera's name, drop photos in, fill in `details.txt`.
2. Run:
   ```bash
   ADMIN_PASSWORD=... npm run seed-products -- /path/to/product-drops
   ```
   Add `API_BASE_URL=https://your-deployed-app` to seed a live deployment instead of localhost.

You can also open the Sheet directly to glance at inventory — just don't hand-edit a row while the app might be writing to it at the same moment (e.g. mid-checkout).

## Orders

Every checkout creates a `pending` row in `Orders`, redirects to ZarinPal, and only gets marked `paid` (with stock decremented in `Products`) once the payment is verified server-side via ZarinPal's callback. View and update order status at `/admin`.

**Known limitation of using a spreadsheet instead of a real database**: there's no transaction support, so two people checking out the last unit of something at the exact same moment could theoretically both succeed. Not a concern at small scale, but worth knowing.
