import express from "express";
import { pool } from "../db.js";
import { requireAdmin } from "../auth.js";
import { requestPayment, verifyPayment } from "../payment/zarinpal.js";

export const router = express.Router();

function publicBaseUrl(req) {
  return process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
}

// ---- checkout (public) ----

router.post("/checkout", async (req, res) => {
  const { items, customer } = req.body || {};
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "Cart is empty." });
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    let subtotal = 0;
    const lines = [];
    for (const item of items) {
      const { rows } = await client.query(
        `SELECT id_num, id, brand, model, price, status, stock, disabled FROM products WHERE id = $1 FOR UPDATE`,
        [item.productId]
      );
      const product = rows[0];
      const qty = Math.max(1, Number(item.qty) || 1);
      if (!product || product.disabled || product.status !== "AVAILABLE") {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: `${item.productId} is no longer available.` });
      }
      if (product.price == null) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: `${item.productId} is not priced yet.` });
      }
      if (product.stock < qty) {
        await client.query("ROLLBACK");
        return res.status(409).json({ error: `Only ${product.stock} left of ${product.brand} ${product.model}.` });
      }
      subtotal += Number(product.price) * qty;
      lines.push({ ...product, qty });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (customer_name, email, address, city, postal_code, country, subtotal, currency)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'EUR')
       RETURNING id_num, code`,
      [
        customer?.name || null,
        customer?.email || null,
        customer?.address || null,
        customer?.city || null,
        customer?.postalCode || null,
        customer?.country || null,
        subtotal,
      ]
    );
    const order = orderRows[0];

    for (const line of lines) {
      await client.query(
        `INSERT INTO order_items (order_id_num, product_id_num, brand, model, unit_price, qty)
         VALUES ($1,$2,$3,$4,$5,$6)`,
        [order.id_num, line.id_num, line.brand, line.model, line.price, line.qty]
      );
    }

    let redirectUrl;
    try {
      const payment = await requestPayment({
        amountEur: subtotal,
        description: `ARCHIVE.SYS order ${order.code}`,
        callbackUrl: `${publicBaseUrl(req)}/api/payment/callback?order=${order.id_num}`,
        email: customer?.email,
      });
      await client.query(
        `UPDATE orders SET payment_gateway = 'zarinpal', payment_authority = $1, payment_amount_rial = $2 WHERE id_num = $3`,
        [payment.authority, payment.amountRial, order.id_num]
      );
      redirectUrl = payment.payUrl;
    } catch (err) {
      console.error("[checkout] payment request failed:", err.message);
      await client.query(`UPDATE orders SET status = 'failed' WHERE id_num = $1`, [order.id_num]);
      await client.query("COMMIT");
      return res.status(502).json({ error: "Could not start payment. Please try again shortly." });
    }

    await client.query("COMMIT");
    res.json({ orderCode: order.code, redirectUrl });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ error: "Checkout failed." });
  } finally {
    client.release();
  }
});

// ---- payment gateway return (public, hit by ZarinPal) ----

router.get("/payment/callback", async (req, res) => {
  const orderIdNum = req.query.order;
  const authority = req.query.Authority;
  const status = req.query.Status;
  const base = publicBaseUrl(req);

  const { rows } = await pool.query(
    `SELECT id_num, code, status, payment_authority, payment_amount_rial FROM orders WHERE id_num = $1`,
    [orderIdNum]
  );
  const order = rows[0];
  if (!order || order.payment_authority !== authority) {
    return res.redirect(`${base}/?order=unknown&payment=failed`);
  }
  if (order.status === "paid") {
    return res.redirect(`${base}/?order=${order.code}&payment=success`);
  }
  if (status !== "OK") {
    await pool.query(`UPDATE orders SET status = 'failed' WHERE id_num = $1`, [order.id_num]);
    return res.redirect(`${base}/?order=${order.code}&payment=failed`);
  }

  try {
    const result = await verifyPayment({ authority, amountRial: order.payment_amount_rial });
    if (!result.ok) {
      await pool.query(`UPDATE orders SET status = 'failed' WHERE id_num = $1`, [order.id_num]);
      return res.redirect(`${base}/?order=${order.code}&payment=failed`);
    }
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        `UPDATE orders SET status = 'paid', paid_at = now(), payment_ref = $1 WHERE id_num = $2`,
        [result.refId, order.id_num]
      );
      await client.query(
        `UPDATE products p SET stock = stock - oi.qty
         FROM order_items oi WHERE oi.order_id_num = $1 AND oi.product_id_num = p.id_num`,
        [order.id_num]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
    res.redirect(`${base}/?order=${order.code}&payment=success`);
  } catch (err) {
    console.error("[payment callback]", err);
    res.redirect(`${base}/?order=${order.code}&payment=failed`);
  }
});

// ---- admin ----

router.get("/admin/orders", requireAdmin, async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT o.*, COALESCE(json_agg(
        json_build_object('brand', oi.brand, 'model', oi.model, 'unitPrice', oi.unit_price, 'qty', oi.qty)
      ) FILTER (WHERE oi.id IS NOT NULL), '[]') AS items
      FROM orders o
      LEFT JOIN order_items oi ON oi.order_id_num = o.id_num
      GROUP BY o.id_num
      ORDER BY o.id_num DESC
    `);
    res.json(
      rows.map((r) => ({
        code: r.code,
        status: r.status,
        customerName: r.customer_name,
        email: r.email,
        address: r.address,
        city: r.city,
        postalCode: r.postal_code,
        country: r.country,
        subtotal: Number(r.subtotal),
        currency: r.currency,
        paymentGateway: r.payment_gateway,
        paymentRef: r.payment_ref,
        paidAt: r.paid_at,
        createdAt: r.created_at,
        items: r.items,
      }))
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load orders." });
  }
});

router.patch("/admin/orders/:code", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "status is required." });
  try {
    const { rows } = await pool.query(`UPDATE orders SET status = $1 WHERE code = $2 RETURNING code`, [
      status,
      req.params.code,
    ]);
    if (!rows[0]) return res.status(404).json({ error: "Not found." });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update order." });
  }
});
