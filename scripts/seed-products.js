// Reads <drops-dir>/<Product Name>/details.txt + photos and creates each
// one as a real product via the admin API (so it goes through the exact
// same validated path the admin panel uses, straight into Postgres).
//
// Usage:
//   ADMIN_PASSWORD=... npm run seed-products -- /path/to/drops/folder
//   API_BASE_URL=https://your-deployed-app ADMIN_PASSWORD=... npm run seed-products -- /path/to/drops

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DROPS_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "product-drops");
const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png"]);
const HEIC_EXT = new Set([".heic", ".heif"]);
const PASSTHROUGH_EXT = new Set([".webp"]);
const MAX_DIMENSION = 1600;
const DETAILS_FILENAMES = ["details.txt", "info.txt"];

function hasSips() {
  try {
    execFileSync("sips", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const SIPS_AVAILABLE = process.platform === "darwin" && hasSips();

function parseDetails(text) {
  const fields = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase().replace(/\s+/g, " ");
    fields[key] = line.slice(idx + 1).trim();
  }
  return fields;
}

// Returns a Buffer + mime type, converting HEIC and downsizing large photos
// via a scratch temp file (sips can only write to a real file).
function loadImage(srcPath) {
  const ext = path.extname(srcPath).toLowerCase();
  if (HEIC_EXT.has(ext)) {
    if (!SIPS_AVAILABLE) return null;
    const tmp = path.join(os.tmpdir(), `seed-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`);
    execFileSync("sips", ["-s", "format", "jpeg", "-Z", String(MAX_DIMENSION), srcPath, "--out", tmp], { stdio: "ignore" });
    const buf = fs.readFileSync(tmp);
    fs.unlinkSync(tmp);
    return { buffer: buf, mime: "image/jpeg", ext: ".jpg" };
  }
  if (RASTER_EXT.has(ext)) {
    let buf = fs.readFileSync(srcPath);
    if (SIPS_AVAILABLE) {
      const tmp = path.join(os.tmpdir(), `seed-${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
      fs.writeFileSync(tmp, buf);
      try {
        execFileSync("sips", ["-Z", String(MAX_DIMENSION), tmp], { stdio: "ignore" });
        buf = fs.readFileSync(tmp);
      } catch {
        // resize is a nice-to-have
      }
      fs.unlinkSync(tmp);
    }
    return { buffer: buf, mime: ext === ".png" ? "image/png" : "image/jpeg", ext };
  }
  if (PASSTHROUGH_EXT.has(ext)) {
    return { buffer: fs.readFileSync(srcPath), mime: "image/webp", ext };
  }
  return null;
}

async function login() {
  const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ password: ADMIN_PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: HTTP ${res.status}`);
  const cookie = res.headers.get("set-cookie");
  if (!cookie) throw new Error("Login succeeded but no session cookie was returned.");
  return cookie.split(";")[0];
}

async function createProduct(cookie, fields, images) {
  const form = new FormData();
  const put = (key, value) => {
    if (value != null && value !== "") form.append(key, String(value));
  };
  put("brand", fields.brand);
  put("series", fields.series);
  put("model", fields.model);
  put("year", fields.year);
  put("price", fields.price);
  put("megapixels", fields.megapixels);
  put("opticalZoom", fields["optical zoom"]);
  put("digitalZoom", fields["digital zoom"]);
  put("storage", fields.storage);
  put("battery", fields.battery);
  put("displayInches", fields["display inches"]);
  put("video", fields.video);
  put("weightGrams", fields["weight grams"]);
  put("colorway", (fields.colorway || "silver").toLowerCase());
  put("bodyStyle", (fields["body style"] || "compact").toLowerCase());
  put("conditionBody", fields["condition body"]);
  put("conditionLens", fields["condition lens"]);
  put("conditionLcd", fields["condition lcd"]);
  put("conditionOverall", fields["condition overall"]);
  put("status", (fields.status || "AVAILABLE").toUpperCase());
  put("stock", fields.stock ?? "1");
  put("notes", fields.notes);
  put("serial", fields.serial);
  if (fields.accessories) form.append("accessories", fields.accessories);

  for (const img of images) {
    form.append("images", new Blob([img.buffer], { type: img.mime }), `photo${img.ext}`);
  }

  const res = await fetch(`${API_BASE_URL}/api/admin/products`, {
    method: "POST",
    headers: { Cookie: cookie },
    body: form,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `HTTP ${res.status}`);
  }
  return res.json();
}

async function main() {
  if (!ADMIN_PASSWORD) {
    console.error("Set ADMIN_PASSWORD in the environment before running this script.");
    process.exit(1);
  }
  if (!fs.existsSync(DROPS_DIR)) {
    console.log(`No drops folder found at ${DROPS_DIR} — nothing to import.`);
    return;
  }

  const cookie = await login();
  console.log(`Logged in to ${API_BASE_URL} as admin.\n`);

  const entries = fs
    .readdirSync(DROPS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));

  for (const entry of entries) {
    const dir = path.join(DROPS_DIR, entry.name);
    const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
    const detailsFile = files.find((f) => DETAILS_FILENAMES.includes(f.toLowerCase()));
    if (!detailsFile) {
      console.warn(`Skipping "${entry.name}" — no details.txt found.`);
      continue;
    }
    const fields = parseDetails(fs.readFileSync(path.join(dir, detailsFile), "utf8"));
    if (!fields.brand || !fields.model) {
      console.warn(`Skipping "${entry.name}" — needs at least Brand and Model in details.txt.`);
      continue;
    }

    const imageFiles = files
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return RASTER_EXT.has(ext) || HEIC_EXT.has(ext) || PASSTHROUGH_EXT.has(ext);
      })
      .sort((a, b) => a.localeCompare(b));
    const images = imageFiles.map((f) => loadImage(path.join(dir, f))).filter(Boolean);

    try {
      const product = await createProduct(cookie, fields, images);
      console.log(`✓ ${product.brand} ${product.model} → ${product.id} (${images.length} photo${images.length === 1 ? "" : "s"})`);
    } catch (err) {
      console.error(`✗ ${entry.name}: ${err.message}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
