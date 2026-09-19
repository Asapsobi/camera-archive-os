// Google Sheets (as the database) + Google Drive (as photo storage), behind
// a small table-shaped API so the routes don't need to know either of those
// are involved. Auth is a service account — no user OAuth flow needed since
// the sheet/folder are just shared with the service account's email once.

import fs from "node:fs";
import { Readable } from "node:stream";
import { google } from "googleapis";

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"];

export const TABLES = {
  PRODUCTS: {
    key: "products",
    name: "Products",
    columns: [
      "id", "brand", "series", "model", "year", "price", "megapixels", "opticalZoom", "digitalZoom",
      "storage", "battery", "displayInches", "video", "weightGrams", "colorway", "bodyStyle",
      "conditionBody", "conditionLens", "conditionLcd", "conditionOverall", "status", "stock",
      "accessories", "notes", "serial", "disabled", "images", "mysteryClueId", "createdAt",
    ],
    numeric: ["year", "price", "megapixels", "opticalZoom", "digitalZoom", "displayInches", "weightGrams", "conditionOverall", "stock"],
    boolean: ["disabled"],
  },
  ORDERS: {
    key: "orders",
    name: "Orders",
    columns: [
      "code", "status", "customerName", "email", "address", "city", "postalCode", "country",
      "subtotal", "currency", "paymentGateway", "paymentAuthority", "paymentAmountRial",
      "paymentRef", "paidAt", "createdAt",
    ],
    numeric: ["subtotal", "paymentAmountRial"],
    boolean: [],
  },
  ORDER_ITEMS: {
    key: "orderItems",
    name: "OrderItems",
    columns: ["orderCode", "productId", "brand", "model", "unitPrice", "qty"],
    numeric: ["unitPrice", "qty"],
    boolean: [],
  },
};

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set.`);
  return v;
}

function loadCredentials() {
  if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE) {
    return JSON.parse(fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE, "utf8"));
  }
  const raw = requireEnv("GOOGLE_SERVICE_ACCOUNT_JSON");
  return JSON.parse(raw);
}

let _auth;
function getAuth() {
  if (!_auth) {
    const creds = loadCredentials();
    _auth = new google.auth.JWT(creds.client_email, null, creds.private_key, SCOPES);
  }
  return _auth;
}

let _sheets;
function sheetsApi() {
  if (!_sheets) _sheets = google.sheets({ version: "v4", auth: getAuth() });
  return _sheets;
}

let _drive;
function driveApi() {
  if (!_drive) _drive = google.drive({ version: "v3", auth: getAuth() });
  return _drive;
}

function spreadsheetId() {
  return requireEnv("GOOGLE_SHEET_ID");
}

function colLetter(n) {
  let s = "";
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

const sheetIdCache = new Map();

// Creates any missing tabs + header rows. Safe to call every boot — never
// touches a tab that already has a header row.
export async function ensureSheets() {
  const sheets = sheetsApi();
  const id = spreadsheetId();
  const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
  const existing = new Map((meta.data.sheets || []).map((s) => [s.properties.title, s.properties.sheetId]));

  for (const table of Object.values(TABLES)) {
    if (!existing.has(table.name)) {
      const res = await sheets.spreadsheets.batchUpdate({
        spreadsheetId: id,
        requestBody: { requests: [{ addSheet: { properties: { title: table.name } } }] },
      });
      existing.set(table.name, res.data.replies[0].addSheet.properties.sheetId);
    }
    sheetIdCache.set(table.name, existing.get(table.name));

    const headerRange = `${table.name}!A1:${colLetter(table.columns.length)}1`;
    const headerRes = await sheets.spreadsheets.values.get({ spreadsheetId: id, range: headerRange });
    if (!headerRes.data.values || headerRes.data.values.length === 0) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: id,
        range: headerRange,
        valueInputOption: "RAW",
        requestBody: { values: [table.columns] },
      });
    }
  }
}

function rowToObject(table, row) {
  const padded = [...row, ...Array(Math.max(0, table.columns.length - row.length)).fill("")];
  const obj = {};
  table.columns.forEach((col, i) => {
    let v = padded[i];
    if (table.numeric.includes(col)) {
      obj[col] = v === "" || v == null ? null : Number(v);
    } else if (table.boolean.includes(col)) {
      obj[col] = v === true || String(v).toUpperCase() === "TRUE";
    } else {
      obj[col] = v === "" || v == null ? null : String(v);
    }
  });
  return obj;
}

function objectToRow(table, obj) {
  return table.columns.map((col) => {
    const v = obj[col];
    if (v == null) return "";
    if (table.boolean.includes(col)) return v ? true : false;
    if (table.numeric.includes(col)) return v === "" ? "" : Number(v);
    return v;
  });
}

// Returns every row as an object plus its absolute sheet row number (`_row`)
// so callers can update/delete that exact row without a second lookup.
export async function readAll(table) {
  const sheets = sheetsApi();
  const range = `${table.name}!A2:${colLetter(table.columns.length)}`;
  const res = await sheets.spreadsheets.values.get({ spreadsheetId: spreadsheetId(), range });
  const rows = res.data.values || [];
  return rows.map((row, i) => ({ ...rowToObject(table, row), _row: i + 2 }));
}

// Returns the new row's absolute row number (parsed from the append
// response) so callers that need to immediately update the row they just
// created (checkout does) don't have to re-read the whole sheet to find it.
export async function appendRow(table, obj) {
  const sheets = sheetsApi();
  const res = await sheets.spreadsheets.values.append({
    spreadsheetId: spreadsheetId(),
    range: `${table.name}!A:A`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [objectToRow(table, obj)] },
  });
  const m = /![A-Z]+(\d+)/.exec(res.data.updates?.updatedRange || "");
  return m ? Number(m[1]) : null;
}

export async function updateRow(table, rowNumber, obj) {
  const sheets = sheetsApi();
  const range = `${table.name}!A${rowNumber}:${colLetter(table.columns.length)}${rowNumber}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId: spreadsheetId(),
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [objectToRow(table, obj)] },
  });
}

export async function deleteRow(table, rowNumber) {
  const sheets = sheetsApi();
  const sheetId = sheetIdCache.get(table.name);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: spreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: { sheetId, dimension: "ROWS", startIndex: rowNumber - 1, endIndex: rowNumber },
          },
        },
      ],
    },
  });
}

// Next `${prefix}NNNN`-style id, based on the highest existing numeric
// suffix in `field` across `rows` — mirrors what a DB auto-increment would
// have given us.
export function nextId(rows, field, prefix, padLength) {
  let max = 0;
  for (const r of rows) {
    const m = new RegExp(`^${prefix}-?(\\d+)$`).exec(r[field] || "");
    if (m) max = Math.max(max, Number(m[1]));
  }
  return `${prefix}-${String(max + 1).padStart(padLength, "0")}`;
}

export async function uploadImage(buffer, mimeType, filename) {
  const drive = driveApi();
  const folderId = requireEnv("GOOGLE_DRIVE_FOLDER_ID");
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id",
  });
  const fileId = res.data.id;
  await drive.permissions.create({
    fileId,
    requestBody: { role: "reader", type: "anyone" },
  });
  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}

export function extractDriveFileId(url) {
  const m = /[?&]id=([^&]+)/.exec(url || "");
  return m ? m[1] : null;
}

export async function deleteImageByUrl(url) {
  const fileId = extractDriveFileId(url);
  if (!fileId) return;
  const drive = driveApi();
  await drive.files.delete({ fileId }).catch(() => {});
}

// Cheap reachability check for /api/health — reads the Products header row.
export async function healthCheck() {
  const sheets = sheetsApi();
  await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${TABLES.PRODUCTS.name}!A1:A1`,
  });
}
