import { useState } from "react";
import { useCartStore } from "../../store/cartStore";
import { getProductById } from "../../data/productHelpers";
import { useProductStore } from "../../store/productStore";
import { useSound } from "../../hooks/useSound";

export default function CheckoutApp() {
  const items = useCartStore((s) => s.items);
  const products = useProductStore((s) => s.products);
  const play = useSound();
  const [step, setStep] = useState("form");
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", postal: "", country: "" });

  const lines = items.map((i) => ({ ...i, product: getProductById(products, i.productId) })).filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.qty, 0);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (lines.length === 0) return;
    setError(null);
    setStep("processing");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: lines.map((l) => ({ productId: l.productId, qty: l.qty })),
          customer: {
            name: form.name,
            email: form.email,
            address: form.address,
            city: form.city,
            postalCode: form.postal,
            country: form.country,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Checkout failed.");
        setStep("form");
        return;
      }
      play("notify");
      // Cart is intentionally left as-is until payment actually succeeds —
      // it only clears when the gateway redirects back with payment=success.
      window.location.href = data.redirectUrl;
    } catch {
      setError("Could not reach the archive. Check your connection and try again.");
      setStep("form");
    }
  }

  if (lines.length === 0 && step === "form") {
    return (
      <div className="app__scroll" style={{ padding: 20, textAlign: "center" }}>
        Your cart is empty — there's nothing to check out yet.
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="app__scroll" style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <div>CONTACTING PAYMENT GATEWAY...</div>
        <div style={{ marginTop: 12 }}>
          <span className="blink-cursor" /> redirecting you to pay
        </div>
      </div>
    );
  }

  return (
    <form className="checkout-form" onSubmit={submit}>
      <fieldset className="fieldset">
        <legend>SHIPPING</legend>
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="co-name">Full name</label>
          <input id="co-name" className="input" required value={form.name} onChange={update("name")} />
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="co-email">Email</label>
          <input id="co-email" type="email" className="input" required value={form.email} onChange={update("email")} />
        </div>
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="co-address">Address</label>
          <input id="co-address" className="input" required value={form.address} onChange={update("address")} />
        </div>
        <div className="checkout-form__row">
          <div className="field">
            <label htmlFor="co-city">City</label>
            <input id="co-city" className="input" required value={form.city} onChange={update("city")} />
          </div>
          <div className="field">
            <label htmlFor="co-postal">Postal code</label>
            <input id="co-postal" className="input" required value={form.postal} onChange={update("postal")} />
          </div>
        </div>
        <div className="field" style={{ marginTop: 8 }}>
          <label htmlFor="co-country">Country</label>
          <input id="co-country" className="input" required value={form.country} onChange={update("country")} />
        </div>
      </fieldset>

      <div className="panel--sunken" style={{ padding: 10, fontSize: 12, marginBottom: 4 }}>
        You'll be redirected to the payment gateway to pay — no card details are collected here.
      </div>

      {error && (
        <div className="panel--sunken" style={{ padding: 10, fontSize: 12, marginBottom: 4, color: "var(--danger-red)" }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <strong>Total: €{subtotal.toFixed(2)}</strong>
        <button type="submit" className="btn btn--primary">
          Place Order →
        </button>
      </div>
    </form>
  );
}
