// Google Sheets (as the database) + Google Drive (as photo storage), behind
// a small table-shaped API so the routes don't need to know either of those
// are involved. Auth is your own Google account via OAuth (see
// server/googleAuth.js) — the backend acts as you, so no sharing step is
// needed on the sheet/folder.

import { Readable } from "node:stream";
import { google } from "googleapis";
import { getAuthClient } from "./googleAuth.js";

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
  META: {
    key: "meta",
    name: "Meta",
    columns: ["key", "value"],
    numeric: ["value"],
    boolean: [],
  },
};

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`${name} is not set.`);
  return v;
}

let _sheets;
function sheetsApi() {
  if (!_sheets) _sheets = google.sheets({ version: "v4", auth: getAuthClient() });
  return _sheets;
}

let _drive;
function driveApi() {
  if (!_drive) _drive = google.drive({ version: "v3", auth: getAuthClient() });
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

// Self-healing rather than trusting ensureSheets() already ran in this
// process — fetches and caches the tab's internal gid on demand if it's
// missing, instead of silently sending an undefined/wrong sheetId.
async function getSheetId(sheets, id, tableName) {
  if (sheetIdCache.has(tableName)) return sheetIdCache.get(tableName);
  const meta = await sheets.spreadsheets.get({ spreadsheetId: id });
  const found = (meta.data.sheets || []).find((s) => s.properties.title === tableName);
  if (!found) throw new Error(`Sheet tab "${tableName}" not found.`);
  sheetIdCache.set(tableName, found.properties.sheetId);
  return found.properties.sheetId;
}

export async function deleteRow(table, rowNumber) {
  const sheets = sheetsApi();
  const id = spreadsheetId();
  const sheetId = await getSheetId(sheets, id, table.name);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: id,
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

// Next `${prefix}NNNN`-style id, from a counter that lives in the Meta tab
// rather than being derived from currently-present rows — so a deleted
// product's id (and its cached image URLs, see serialize() in
// routes/products.js) never gets handed to a new one. Mirrors a real DB
// sequence: it only ever goes up, regardless of what's since been deleted.
//
// The first time a given counterKey is used, there's no Meta row for it
// yet — seed it from the highest id already present in existingRows (e.g.
// products seeded before this counter existed) instead of starting at 0,
// which would immediately collide with real data.
export async function nextCounter(counterKey, prefix, padLength, existingRows = [], field = "id") {
  const metaRows = await readAll(TABLES.META);
  const row = metaRows.find((r) => r.key === counterKey);
  let current = row?.value;
  if (current == null) {
    current = 0;
    for (const r of existingRows) {
      const m = new RegExp(`^${prefix}-(\\d+)$`).exec(r[field] || "");
      if (m) current = Math.max(current, Number(m[1]));
    }
  }
  const next = current + 1;
  if (row) {
    await updateRow(TABLES.META, row._row, { key: counterKey, value: next });
  } else {
    await appendRow(TABLES.META, { key: counterKey, value: next });
  }
  return `${prefix}-${String(next).padStart(padLength, "0")}`;
}

// Drive's public "anyone with the link" URLs turn out to be unreliable for
// real <img> requests (they behave differently for a browser than for a
// bare curl, likely something in how Drive treats the Referer/UA on that
// legacy endpoint) — so files stay private, and server/routes/products.js
// proxies image bytes through our own authenticated Drive access instead
// via streamDriveFile() below. More reliable, and arguably more sensible
// than making every photo public on Drive anyway.
export async function uploadImage(buffer, mimeType, filename) {
  const drive = driveApi();
  const folderId = requireEnv("GOOGLE_DRIVE_FOLDER_ID");
  const res = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: Readable.from(buffer) },
    fields: "id",
  });
  return `https://drive.google.com/uc?export=view&id=${res.data.id}`;
}

export function extractDriveFileId(url) {
  const m = /[?&]id=([^&]+)/.exec(url || "");
  return m ? m[1] : null;
}

export async function deleteImageByUrl(url) {
  const fileId = extractDriveFileId(url);
  if (!fileId) return;
  const drive = driveApi();
  try {
    await drive.files.delete({ fileId });
  } catch (err) {
    // A failed cleanup shouldn't block deleting the product itself, but it
    // should be visible instead of vanishing — an orphaned Drive file is a
    // much smaller problem than a silently-growing one.
    console.error(`[sheets] could not delete Drive file ${fileId}:`, err.message);
  }
}

export async function streamDriveFile(fileId, res) {
  const drive = driveApi();
  const meta = await drive.files.get({ fileId, fields: "mimeType" });
  const stream = await drive.files.get({ fileId, alt: "media" }, { responseType: "stream" });
  res.setHeader("Content-Type", meta.data.mimeType || "image/jpeg");
  res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
  stream.data.pipe(res);
}

// Cheap reachability check for /api/health — reads the Products header row.
export async function healthCheck() {
  const sheets = sheetsApi();
  await sheets.spreadsheets.values.get({
    spreadsheetId: spreadsheetId(),
    range: `${TABLES.PRODUCTS.name}!A1:A1`,
  });
}
