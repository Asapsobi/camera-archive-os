import express from "express";
import { TABLES, readAll, appendRow, updateRow, nextId } from "../sheets.js";
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

  try {
    const products = await readAll(TABLES.PRODUCTS);

    let subtotal = 0;
    const lines = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      const qty = Math.max(1, Number(item.qty) || 1);
      if (!product || product.disabled || product.status !== "AVAILABLE") {
        return res.status(409).json({ error: `${item.productId} is no longer available.` });
      }
      if (product.price == null) {
        return res.status(409).json({ error: `${item.productId} is not priced yet.` });
      }
      if (product.stock < qty) {
        return res.status(409).json({ error: `Only ${product.stock} left of ${product.brand} ${product.model}.` });
      }
      subtotal += Number(product.price) * qty;
      lines.push({ ...product, qty });
    }

    const existingOrders = await readAll(TABLES.ORDERS);
    const code = nextId(existingOrders, "code", "ORD", 5);
    const order = {
      code,
      status: "pending",
      customerName: customer?.name || null,
      email: customer?.email || null,
      address: customer?.address || null,
      city: customer?.city || null,
      postalCode: customer?.postalCode || null,
      country: customer?.country || null,
      subtotal,
      currency: "EUR",
      paymentGateway: null,
      paymentAuthority: null,
      paymentAmountRial: null,
      paymentRef: null,
      paidAt: null,
      createdAt: new Date().toISOString(),
    };
    const orderRow = await appendRow(TABLES.ORDERS, order);

    for (const line of lines) {
      await appendRow(TABLES.ORDER_ITEMS, {
        orderCode: code,
        productId: line.id,
        brand: line.brand,
        model: line.model,
        unitPrice: line.price,
        qty: line.qty,
      });
    }

    try {
      const payment = await requestPayment({
        amountEur: subtotal,
        description: `ARCHIVE.SYS order ${code}`,
        callbackUrl: `${publicBaseUrl(req)}/api/payment/callback?order=${code}`,
        email: customer?.email,
      });
      await updateRow(TABLES.ORDERS, orderRow, {
        ...order,
        paymentGateway: "zarinpal",
        paymentAuthority: payment.authority,
        paymentAmountRial: payment.amountRial,
      });
      res.json({ orderCode: code, redirectUrl: payment.payUrl });
    } catch (err) {
      console.error("[checkout] payment request failed:", err.message);
      await updateRow(TABLES.ORDERS, orderRow, { ...order, status: "failed" });
      res.status(502).json({ error: "Could not start payment. Please try again shortly." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Checkout failed." });
  }
});

// ---- payment gateway return (public, hit by ZarinPal) ----

router.get("/payment/callback", async (req, res) => {
  const orderCode = req.query.order;
  const authority = req.query.Authority;
  const status = req.query.Status;
  const base = publicBaseUrl(req);

  try {
    const orders = await readAll(TABLES.ORDERS);
    const order = orders.find((o) => o.code === orderCode);
    if (!order || order.paymentAuthority !== authority) {
      return res.redirect(`${base}/?order=unknown&payment=failed`);
    }
    if (order.status === "paid") {
      return res.redirect(`${base}/?order=${order.code}&payment=success`);
    }
    if (status !== "OK") {
      await updateRow(TABLES.ORDERS, order._row, { ...order, status: "failed" });
      return res.redirect(`${base}/?order=${order.code}&payment=failed`);
    }

    const result = await verifyPayment({ authority, amountRial: order.paymentAmountRial });
    if (!result.ok) {
      await updateRow(TABLES.ORDERS, order._row, { ...order, status: "failed" });
      return res.redirect(`${base}/?order=${order.code}&payment=failed`);
    }

    await updateRow(TABLES.ORDERS, order._row, {
      ...order,
      status: "paid",
      paidAt: new Date().toISOString(),
      paymentRef: result.refId,
    });

    const items = (await readAll(TABLES.ORDER_ITEMS)).filter((it) => it.orderCode === orderCode);
    const products = await readAll(TABLES.PRODUCTS);
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        await updateRow(TABLES.PRODUCTS, product._row, { ...product, stock: Math.max(0, product.stock - item.qty) });
      }
    }

    res.redirect(`${base}/?order=${order.code}&payment=success`);
  } catch (err) {
    console.error("[payment callback]", err);
    res.redirect(`${base}/?order=${orderCode || "unknown"}&payment=failed`);
  }
});

// ---- admin ----

router.get("/admin/orders", requireAdmin, async (req, res) => {
  try {
    const [orders, items] = await Promise.all([readAll(TABLES.ORDERS), readAll(TABLES.ORDER_ITEMS)]);
    const byCode = new Map();
    for (const it of items) {
      if (!byCode.has(it.orderCode)) byCode.set(it.orderCode, []);
      byCode.get(it.orderCode).push({ brand: it.brand, model: it.model, unitPrice: it.unitPrice, qty: it.qty });
    }
    const result = orders
      .map((o) => ({
        code: o.code,
        status: o.status,
        customerName: o.customerName,
        email: o.email,
        address: o.address,
        city: o.city,
        postalCode: o.postalCode,
        country: o.country,
        subtotal: o.subtotal,
        currency: o.currency,
        paymentGateway: o.paymentGateway,
        paymentRef: o.paymentRef,
        paidAt: o.paidAt,
        createdAt: o.createdAt,
        items: byCode.get(o.code) || [],
      }))
      .sort((a, b) => b.code.localeCompare(a.code));
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not load orders." });
  }
});

router.patch("/admin/orders/:code", requireAdmin, async (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ error: "status is required." });
  try {
    const orders = await readAll(TABLES.ORDERS);
    const order = orders.find((o) => o.code === req.params.code);
    if (!order) return res.status(404).json({ error: "Not found." });
    await updateRow(TABLES.ORDERS, order._row, { ...order, status });
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update order." });
  }
});
