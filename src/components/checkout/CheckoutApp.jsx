import { useState } from "react";
import { useCartStore } from "../../store/cartStore";
import { getProductById } from "../../data/products";
import { useSound } from "../../hooks/useSound";

function randomOrderId() {
  return `ARC-${Math.floor(100000 + Math.random() * 899999)}`;
}

export default function CheckoutApp() {
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);
  const play = useSound();
  const [step, setStep] = useState("form");
  const [orderId, setOrderId] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", address: "", city: "", postal: "", country: "", card: "", exp: "", cvc: "" });

  const lines = items.map((i) => ({ ...i, product: getProductById(i.productId) })).filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.qty, 0);

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  function submit(e) {
    e.preventDefault();
    if (lines.length === 0) return;
    setStep("processing");
    setTimeout(() => {
      setOrderId(randomOrderId());
      setStep("done");
      clear();
      play("notify");
    }, 1400);
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
        <div>CONTACTING ARCHIVE PAYMENT NODE...</div>
        <div style={{ marginTop: 12 }}>
          <span className="blink-cursor" /> please wait
        </div>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="app__scroll" style={{ padding: 24, fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <div className="glow-text" style={{ color: "var(--lime-dim)", fontSize: 16, marginBottom: 8 }}>
          SYSTEM: ORDER CONFIRMED
        </div>
        <div>ORDER ID: {orderId}</div>
        <div style={{ marginTop: 10, opacity: 0.75 }}>
          A confirmation would normally be emailed to {form.email || "the address on file"}. This is a demo
          storefront — no real payment was processed and no camera will actually ship.
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

      <fieldset className="fieldset">
        <legend>PAYMENT (simulated — demo only)</legend>
        <div className="field" style={{ marginBottom: 8 }}>
          <label htmlFor="co-card">Card number</label>
          <input id="co-card" className="input" required inputMode="numeric" placeholder="0000 0000 0000 0000" value={form.card} onChange={update("card")} />
        </div>
        <div className="checkout-form__row">
          <div className="field">
            <label htmlFor="co-exp">Expiry</label>
            <input id="co-exp" className="input" required placeholder="MM/YY" value={form.exp} onChange={update("exp")} />
          </div>
          <div className="field">
            <label htmlFor="co-cvc">CVC</label>
            <input id="co-cvc" className="input" required inputMode="numeric" value={form.cvc} onChange={update("cvc")} />
          </div>
        </div>
      </fieldset>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
        <strong>Total: €{subtotal}</strong>
        <button type="submit" className="btn btn--primary">
          Place Order
        </button>
      </div>
    </form>
  );
}
