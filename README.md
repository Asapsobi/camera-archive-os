# ARCHIVE.SYS — camera-archive-os

A Windows XP/Vista-styled desktop e-commerce storefront for vintage digital cameras, backed by a Google Sheet (as the database), Google Drive (for photos), an admin panel, and ZarinPal checkout.

## Stack

- **Frontend**: React + Vite, built to `build/`
- **Backend**: Express (`server/`), serves the built frontend + a JSON API
- **Database**: a Google Sheet — three tabs (`Products`, `Orders`, `OrderItems`), created automatically on boot if missing (`server/sheets.js`)
- **Photo storage**: Google Drive folder, uploaded photos are made link-viewable automatically
- **Payments**: ZarinPal (defaults to their public sandbox until a real merchant ID is set)

## One-time Google Cloud setup

1. In [Google Cloud Console](https://console.cloud.google.com), create a project (or reuse one), then enable the **Google Sheets API** and **Google Drive API** for it.
2. Under **IAM & Admin → Service Accounts**, create a service account (no project-level roles needed — access is granted by sharing specific resources with it, below).
3. Open the service account → **Keys** → **Add key** → **Create new key** → JSON. Download it.
4. Create a Google Sheet for the data, and a Drive folder for photos.
5. Share **both** the Sheet and the folder with the service account's email (found in the JSON as `client_email`), as **Editor**.
6. Grab the Sheet ID and folder ID from their URLs:
   - Sheet: `docs.google.com/spreadsheets/d/`**`<SHEET_ID>`**`/edit`
   - Folder: `drive.google.com/drive/folders/`**`<FOLDER_ID>`**

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | no (default 3000) | Port the server listens on |
| `GOOGLE_SERVICE_ACCOUNT_JSON` | **yes** (one of these two) | The entire downloaded service-account JSON key, pasted as one env var value |
| `GOOGLE_SERVICE_ACCOUNT_KEY_FILE` | | Alternative to the above for local dev: a file path to the downloaded JSON key |
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
