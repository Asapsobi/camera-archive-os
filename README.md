# ARCHIVE.SYS — camera-archive-os

A Windows XP/Vista-styled desktop e-commerce storefront for vintage digital cameras, backed by a real Postgres database, an admin panel, and ZarinPal checkout.

## Stack

- **Frontend**: React + Vite, built to `build/`
- **Backend**: Express (`server/`), serves the built frontend + a JSON API
- **Database**: PostgreSQL (`server/schema.sql`, migrated automatically on boot)
- **Payments**: ZarinPal (defaults to their public sandbox until a real merchant ID is set)

## Environment variables

| Variable | Required | Purpose |
| --- | --- | --- |
| `PORT` | no (default 3000) | Port the server listens on |
| `DATABASE_URL` | one of these two | Full Postgres connection string |
| `PGHOST` / `PGPORT` / `PGUSER` / `PGPASSWORD` / `PGDATABASE` | | Individual Postgres connection fields (what ParsPack's DB panel gives you) |
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

## Managing products

Products live in Postgres — either edit them at `/admin` (add, edit, disable, delete, upload photos), or bulk-import from folders:

1. Copy `product-drops/_TEMPLATE`, rename it to the camera's name, drop photos in, fill in `details.txt`.
2. Run:
   ```bash
   ADMIN_PASSWORD=... npm run seed-products -- /path/to/product-drops
   ```
   Add `API_BASE_URL=https://your-deployed-app` to seed a live deployment instead of localhost.

## Orders

Every checkout creates a `pending` order, redirects to ZarinPal, and only gets marked `paid` (with stock decremented) once the payment is verified server-side via ZarinPal's callback. View and update order status at `/admin`.
