import express from "express";
import multer from "multer";
import {
  TABLES,
  readAll,
  appendRow,
  updateRow,
  deleteRow,
  nextId,
  uploadImage,
  deleteImageByUrl,
} from "../sheets.js";
import { requireAdmin } from "../auth.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });
export const router = express.Router();

function splitList(s) {
  return s ? String(s).split(",").map((x) => x.trim()).filter(Boolean) : [];
}

function serialize(row) {
  const images = splitList(row.images);
  return {
    id: row.id,
    brand: row.brand,
    series: row.series || "",
    model: row.model,
    year: row.year,
    price: row.price,
    megapixels: row.megapixels ?? 0,
    opticalZoom: row.opticalZoom ?? 0,
    digitalZoom: row.digitalZoom ?? 0,
    storage: row.storage || "Unknown",
    battery: row.battery || "Unknown",
    displayInches: row.displayInches ?? 0,
    video: row.video || "None",
    weightGrams: row.weightGrams,
    colorway: row.colorway || "silver",
    bodyStyle: row.bodyStyle || "compact",
    condition: {
      body: row.conditionBody || "GOOD",
      lens: row.conditionLens || "GOOD",
      lcd: row.conditionLcd || "GOOD",
      overall: row.conditionOverall,
    },
    status: row.status || "AVAILABLE",
    stock: row.stock ?? 0,
    accessories: splitList(row.accessories),
    notes: row.notes,
    serial: row.serial,
    mystery: row.mysteryClueId ? { clueId: row.mysteryClueId } : null,
    disabled: !!row.disabled,
    image: images[0] || null,
    images,
  };
}

function fieldsFromBody(body, { brand, model, id }) {
  const status = (body.status || "AVAILABLE").toUpperCase();
  return {
    brand,
    series: body.series || "",
    model,
    year: body.year || null,
    price: body.price === "" || body.price == null ? null : body.price,
    megapixels: body.megapixels || null,
    opticalZoom: body.opticalZoom || null,
    digitalZoom: body.digitalZoom || null,
    storage: body.storage || "Unknown",
    battery: body.battery || "Unknown",
    displayInches: body.displayInches || null,
    video: body.video || "None",
    weightGrams: body.weightGrams || null,
    colorway: (body.colorway || "silver").toLowerCase(),
    bodyStyle: (body.bodyStyle || "compact").toLowerCase(),
    conditionBody: body.conditionBody || "GOOD",
    conditionLens: body.conditionLens || "GOOD",
    conditionLcd: body.conditionLcd || "GOOD",
    conditionOverall: body.conditionOverall || null,
    status,
    stock: status === "AVAILABLE" ? body.stock || 0 : 0,
    accessories: body.accessories || "",
    notes: body.notes || null,
    serial: body.serial || `${brand.slice(0, 2).toUpperCase()}-${model.replace(/\s+/g, "").toUpperCase()}-${id}`,
    mysteryClueId: body.mysteryClueId || null,
  };
}

// ---- public ----

router.get("/products", async (req, res) => {
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    res.json(rows.filter((r) => !r.disabled).map(serialize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load products." });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    const row = rows.find((r) => r.id === req.params.id && !r.disabled);
    if (!row) return res.status(404).json({ error: "Not found." });
    res.json(serialize(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load product." });
  }
});

// ---- admin ----

router.get("/admin/products", requireAdmin, async (req, res) => {
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    res.json(rows.map(serialize));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load products." });
  }
});

router.post("/admin/products", requireAdmin, upload.array("images", 8), async (req, res) => {
  const body = req.body;
  if (!body.brand || !body.model) {
    return res.status(400).json({ error: "Brand and model are required." });
  }
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    const id = nextId(rows, "id", "CAM", 4);
    const files = req.files || [];
    const images = [];
    for (let i = 0; i < files.length; i++) {
      images.push(await uploadImage(files[i].buffer, files[i].mimetype, `${id}-${i}`));
    }
    const row = {
      id,
      ...fieldsFromBody(body, { brand: body.brand, model: body.model, id }),
      images: images.join(", "),
      createdAt: new Date().toISOString(),
    };
    await appendRow(TABLES.PRODUCTS, row);
    res.status(201).json(serialize(row));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create product." });
  }
});

router.patch("/admin/products/:id", requireAdmin, upload.array("images", 8), async (req, res) => {
  const body = req.body;
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    const existing = rows.find((r) => r.id === req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found." });

    const files = req.files || [];
    let images = existing.images || "";
    if (files.length) {
      for (const url of splitList(existing.images)) await deleteImageByUrl(url);
      const uploaded = [];
      for (let i = 0; i < files.length; i++) {
        uploaded.push(await uploadImage(files[i].buffer, files[i].mimetype, `${existing.id}-${i}`));
      }
      images = uploaded.join(", ");
    }

    const brand = body.brand || existing.brand;
    const model = body.model || existing.model;
    const merged = {
      ...existing,
      ...fieldsFromBody({ ...existing, ...body }, { brand, model, id: existing.id }),
      images,
    };
    delete merged._row;
    await updateRow(TABLES.PRODUCTS, existing._row, merged);
    res.json(serialize(merged));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update product." });
  }
});

router.post("/admin/products/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    const existing = rows.find((r) => r.id === req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found." });
    const merged = { ...existing, disabled: !existing.disabled };
    delete merged._row;
    await updateRow(TABLES.PRODUCTS, existing._row, merged);
    res.json(serialize(merged));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update product." });
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const rows = await readAll(TABLES.PRODUCTS);
    const existing = rows.find((r) => r.id === req.params.id);
    if (!existing) return res.status(404).json({ error: "Not found." });
    for (const url of splitList(existing.images)) await deleteImageByUrl(url);
    await deleteRow(TABLES.PRODUCTS, existing._row);
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete product." });
  }
});
