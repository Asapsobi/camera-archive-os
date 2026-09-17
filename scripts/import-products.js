// Reads <drops-dir>/<Product Name>/details.txt + photos and turns them
// into src/data/realProducts.generated.js, converting/resizing photos and
// copying them into public/products/<slug>/ along the way.
//
// Usage:
//   npm run import-products
//   npm run import-products -- /path/to/some/other/drops/folder

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const DROPS_DIR = process.argv[2] ? path.resolve(process.argv[2]) : path.join(ROOT, "product-drops");
const PUBLIC_DIR = path.join(ROOT, "public", "products");
const OUT_FILE = path.join(ROOT, "src", "data", "realProducts.generated.js");

const RASTER_EXT = new Set([".jpg", ".jpeg", ".png"]);
const HEIC_EXT = new Set([".heic", ".heif"]);
const PASSTHROUGH_EXT = new Set([".webp"]);
const MAX_DIMENSION = 1600;

const DETAILS_FILENAMES = ["details.txt", "info.txt"];

const STATUS_MAP = {
  available: "AVAILABLE",
  "on hold": "ON HOLD",
  sold: "SOLD",
  deleted: "DELETED",
  classified: "CLASSIFIED",
};

function hasSips() {
  try {
    execFileSync("sips", ["--version"], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
const SIPS_AVAILABLE = process.platform === "darwin" && hasSips();

function slugify(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseNumber(v) {
  if (v == null || v === "") return undefined;
  const n = Number(String(v).replace(/[^\d.-]/g, ""));
  return Number.isNaN(n) ? undefined : n;
}

function parseDetails(text) {
  const fields = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const idx = line.indexOf(":");
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim().toLowerCase().replace(/\s+/g, " ");
    const value = line.slice(idx + 1).trim();
    fields[key] = value;
  }
  return fields;
}

function buildCondition(fields) {
  return {
    body: fields["condition body"]?.toUpperCase() || "GOOD",
    lens: fields["condition lens"]?.toUpperCase() || "GOOD",
    lcd: fields["condition lcd"]?.toUpperCase() || "GOOD",
    overall: parseNumber(fields["condition overall"]) ?? null,
  };
}

// Converts/resizes one source photo into destDir, returning the file name
// it was written as (or null if the format can't be handled on this
// machine). HEIC/HEIF (the default iPhone photo format) gets converted to
// JPEG; JPEG/PNG get downsized so a phone photo doesn't ship multi-MB.
function processImage(srcPath, destDir, index) {
  const ext = path.extname(srcPath).toLowerCase();

  if (HEIC_EXT.has(ext)) {
    if (!SIPS_AVAILABLE) {
      console.warn(`  ! can't convert ${path.basename(srcPath)} (HEIC) — "sips" is only available on macOS.`);
      return null;
    }
    const destName = `${index}.jpg`;
    execFileSync("sips", ["-s", "format", "jpeg", "-Z", String(MAX_DIMENSION), srcPath, "--out", path.join(destDir, destName)], {
      stdio: "ignore",
    });
    return destName;
  }

  if (RASTER_EXT.has(ext)) {
    const destName = `${index}${ext}`;
    const destPath = path.join(destDir, destName);
    fs.copyFileSync(srcPath, destPath);
    if (SIPS_AVAILABLE) {
      try {
        execFileSync("sips", ["-Z", String(MAX_DIMENSION), destPath], { stdio: "ignore" });
      } catch {
        // resize is a nice-to-have; keep the full-size copy if it fails
      }
    }
    return destName;
  }

  if (PASSTHROUGH_EXT.has(ext)) {
    const destName = `${index}${ext}`;
    fs.copyFileSync(srcPath, path.join(destDir, destName));
    return destName;
  }

  return null;
}

function main() {
  if (!fs.existsSync(DROPS_DIR)) {
    console.log(`No drops folder found at ${DROPS_DIR} — nothing to import.`);
    return;
  }
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });

  const entries = fs
    .readdirSync(DROPS_DIR, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith("_") && !e.name.startsWith("."))
    .sort((a, b) => a.name.localeCompare(b.name));

  const products = [];
  let counter = 0;

  for (const entry of entries) {
    const dir = path.join(DROPS_DIR, entry.name);
    const files = fs.readdirSync(dir).filter((f) => !f.startsWith("."));
    const detailsFile = files.find((f) => DETAILS_FILENAMES.includes(f.toLowerCase()));
    if (!detailsFile) {
      console.warn(`Skipping "${entry.name}" — no details.txt found.`);
      continue;
    }

    const fields = parseDetails(fs.readFileSync(path.join(dir, detailsFile), "utf8"));
    const brand = fields.brand;
    const model = fields.model;
    if (!brand || !model) {
      console.warn(`Skipping "${entry.name}" — needs at least Brand and Model in details.txt.`);
      continue;
    }

    const slug = slugify(entry.name);
    const imageFiles = files
      .filter((f) => {
        const ext = path.extname(f).toLowerCase();
        return RASTER_EXT.has(ext) || HEIC_EXT.has(ext) || PASSTHROUGH_EXT.has(ext);
      })
      .sort((a, b) => a.localeCompare(b));

    const destDir = path.join(PUBLIC_DIR, slug);
    fs.mkdirSync(destDir, { recursive: true });
    const images = [];
    imageFiles.forEach((file) => {
      const destName = processImage(path.join(dir, file), destDir, images.length);
      if (destName) images.push(`/products/${slug}/${destName}`);
    });

    counter += 1;
    const id = `CAM-R${String(counter).padStart(4, "0")}`;
    const status = STATUS_MAP[(fields.status || "available").toLowerCase()] || "AVAILABLE";

    products.push({
      id,
      brand,
      series: fields.series || "",
      model,
      year: parseNumber(fields.year) ?? new Date().getFullYear(),
      price: fields.price ? parseNumber(fields.price) ?? null : null,
      megapixels: parseNumber(fields.megapixels) ?? 0,
      opticalZoom: parseNumber(fields["optical zoom"]) ?? 0,
      digitalZoom: parseNumber(fields["digital zoom"]) ?? 0,
      storage: fields.storage || "Unknown",
      battery: fields.battery || "Unknown",
      displayInches: parseNumber(fields["display inches"]) ?? 0,
      video: fields.video || "None",
      weightGrams: parseNumber(fields["weight grams"]) ?? 0,
      colorway: (fields.colorway || "silver").toLowerCase(),
      bodyStyle: (fields["body style"] || "compact").toLowerCase(),
      condition: buildCondition(fields),
      status,
      stock: status === "AVAILABLE" ? parseNumber(fields.stock) ?? 1 : 0,
      accessories: fields.accessories
        ? fields.accessories.split(",").map((s) => s.trim()).filter(Boolean)
        : [],
      notes: fields.notes || null,
      serial: fields.serial || `${brand.slice(0, 2).toUpperCase()}${String(counter).padStart(2, "0")}-${model.replace(/\s+/g, "").toUpperCase()}-${id.slice(-4)}`,
      mystery: null,
      image: images[0] || null,
      images,
    });

    console.log(`✓ ${brand} ${model} (${images.length} photo${images.length === 1 ? "" : "s"})`);
  }

  const header = `// AUTO-GENERATED by scripts/import-products.js — do not edit by hand.
// Edit files in product-drops/ instead, then run: npm run import-products

`;
  const body = `export const realProducts = ${JSON.stringify(products, null, 2)};\n`;
  fs.writeFileSync(OUT_FILE, header + body);
  console.log(`\nWrote ${products.length} product(s) to ${path.relative(ROOT, OUT_FILE)}`);
}

main();
