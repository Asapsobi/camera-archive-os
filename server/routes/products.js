import express from "express";
import multer from "multer";
import { pool } from "../db.js";
import { serializeProduct } from "../serialize.js";
import { requireAdmin } from "../auth.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 12 * 1024 * 1024 } });

export const router = express.Router();

const LIST_SQL = `
  SELECT p.*, COUNT(pi.id) AS image_count
  FROM products p
  LEFT JOIN product_images pi ON pi.product_id_num = p.id_num
  {WHERE}
  GROUP BY p.id_num
  ORDER BY p.sort_order, p.id_num
`;

async function fetchList({ includeDisabled }) {
  const sql = LIST_SQL.replace("{WHERE}", includeDisabled ? "" : "WHERE p.disabled = false");
  const { rows } = await pool.query(sql);
  return rows.map((r) => serializeProduct(r, Number(r.image_count)));
}

async function fetchOne(id, { includeDisabled }) {
  const sql = `
    SELECT p.*, COUNT(pi.id) AS image_count
    FROM products p
    LEFT JOIN product_images pi ON pi.product_id_num = p.id_num
    WHERE p.id = $1 ${includeDisabled ? "" : "AND p.disabled = false"}
    GROUP BY p.id_num
  `;
  const { rows } = await pool.query(sql, [id]);
  if (!rows[0]) return null;
  return serializeProduct(rows[0], Number(rows[0].image_count));
}

// ---- public ----

router.get("/products", async (req, res) => {
  try {
    res.json(await fetchList({ includeDisabled: false }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load products." });
  }
});

router.get("/products/:id", async (req, res) => {
  try {
    const product = await fetchOne(req.params.id, { includeDisabled: false });
    if (!product) return res.status(404).json({ error: "Not found." });
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load product." });
  }
});

router.get("/products/:id/image/:pos", async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT mime_type, data FROM product_images
       WHERE position = $2 AND product_id_num = (SELECT id_num FROM products WHERE id = $1)`,
      [req.params.id, req.params.pos]
    );
    const img = rows[0];
    if (!img) return res.status(404).end();
    res.setHeader("Content-Type", img.mime_type);
    res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
    res.send(img.data);
  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// ---- admin ----

const FIELD_MAP = {
  brand: "brand",
  series: "series",
  model: "model",
  year: "year",
  price: "price",
  megapixels: "megapixels",
  opticalZoom: "optical_zoom",
  digitalZoom: "digital_zoom",
  storage: "storage",
  battery: "battery",
  displayInches: "display_inches",
  video: "video",
  weightGrams: "weight_grams",
  colorway: "colorway",
  bodyStyle: "body_style",
  conditionBody: "condition_body",
  conditionLens: "condition_lens",
  conditionLcd: "condition_lcd",
  conditionOverall: "condition_overall",
  status: "status",
  stock: "stock",
  notes: "notes",
  serial: "serial",
  sortOrder: "sort_order",
};

function parseAccessories(raw) {
  if (raw == null || raw === "") return [];
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fall through to comma-split
  }
  return String(raw)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

router.get("/admin/products", requireAdmin, async (req, res) => {
  try {
    res.json(await fetchList({ includeDisabled: true }));
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
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const { rows } = await client.query(
      `INSERT INTO products
        (brand, series, model, year, price, megapixels, optical_zoom, digital_zoom, storage, battery,
         display_inches, video, weight_grams, colorway, body_style, condition_body, condition_lens,
         condition_lcd, condition_overall, status, stock, accessories, notes, serial, sort_order)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)
       RETURNING id, id_num`,
      [
        body.brand,
        body.series || "",
        body.model,
        body.year || null,
        body.price === "" || body.price == null ? null : body.price,
        body.megapixels || null,
        body.opticalZoom || null,
        body.digitalZoom || null,
        body.storage || "Unknown",
        body.battery || "Unknown",
        body.displayInches || null,
        body.video || "None",
        body.weightGrams || null,
        body.colorway || "silver",
        body.bodyStyle || "compact",
        body.conditionBody || "GOOD",
        body.conditionLens || "GOOD",
        body.conditionLcd || "GOOD",
        body.conditionOverall || null,
        body.status || "AVAILABLE",
        body.stock || 0,
        parseAccessories(body.accessories),
        body.notes || null,
        body.serial || null,
        body.sortOrder || 0,
      ]
    );
    const { id, id_num } = rows[0];

    if (!body.serial) {
      const auto = `${body.brand.slice(0, 2).toUpperCase()}-${body.model.replace(/\s+/g, "").toUpperCase()}-${id}`;
      await client.query(`UPDATE products SET serial = $1 WHERE id_num = $2`, [auto, id_num]);
    }

    const files = req.files || [];
    for (let i = 0; i < files.length; i++) {
      await client.query(
        `INSERT INTO product_images (product_id_num, position, mime_type, data) VALUES ($1,$2,$3,$4)`,
        [id_num, i, files[i].mimetype, files[i].buffer]
      );
    }
    await client.query("COMMIT");
    res.status(201).json(await fetchOne(id, { includeDisabled: true }));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not create product." });
  } finally {
    client.release();
  }
});

router.patch("/admin/products/:id", requireAdmin, upload.array("images", 8), async (req, res) => {
  const body = req.body;
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const sets = [];
    const values = [];
    let i = 1;
    for (const [key, column] of Object.entries(FIELD_MAP)) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        sets.push(`${column} = $${i++}`);
        values.push(body[key] === "" ? null : body[key]);
      }
    }
    if (Object.prototype.hasOwnProperty.call(body, "accessories")) {
      sets.push(`accessories = $${i++}`);
      values.push(parseAccessories(body.accessories));
    }
    if (Object.prototype.hasOwnProperty.call(body, "disabled")) {
      sets.push(`disabled = $${i++}`);
      values.push(body.disabled === "true" || body.disabled === true);
    }

    let idNum;
    if (sets.length) {
      values.push(req.params.id);
      const { rows } = await client.query(
        `UPDATE products SET ${sets.join(", ")} WHERE id = $${i} RETURNING id_num`,
        values
      );
      if (!rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Not found." });
      }
      idNum = rows[0].id_num;
    } else {
      const { rows } = await client.query(`SELECT id_num FROM products WHERE id = $1`, [req.params.id]);
      if (!rows[0]) {
        await client.query("ROLLBACK");
        return res.status(404).json({ error: "Not found." });
      }
      idNum = rows[0].id_num;
    }

    const files = req.files || [];
    if (files.length) {
      await client.query(`DELETE FROM product_images WHERE product_id_num = $1`, [idNum]);
      for (let pos = 0; pos < files.length; pos++) {
        await client.query(
          `INSERT INTO product_images (product_id_num, position, mime_type, data) VALUES ($1,$2,$3,$4)`,
          [idNum, pos, files[pos].mimetype, files[pos].buffer]
        );
      }
    }

    await client.query("COMMIT");
    res.json(await fetchOne(req.params.id, { includeDisabled: true }));
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Could not update product." });
  } finally {
    client.release();
  }
});

router.post("/admin/products/:id/toggle", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(
      `UPDATE products SET disabled = NOT disabled WHERE id = $1 RETURNING id`,
      [req.params.id]
    );
    if (!rows[0]) return res.status(404).json({ error: "Not found." });
    res.json(await fetchOne(req.params.id, { includeDisabled: true }));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update product." });
  }
});

router.delete("/admin/products/:id", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [req.params.id]);
    if (!rows[0]) return res.status(404).json({ error: "Not found." });
    res.status(204).end();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not delete product." });
  }
});
