import ProductPhoto from "../product/ProductPhoto";
import Icon from "../desktop/Icon";
import { useCartStore } from "../../store/cartStore";
import { getProductById } from "../../data/productHelpers";
import { useProductStore } from "../../store/productStore";
import { useLauncher } from "../../hooks/useLauncher";
import { useSound } from "../../hooks/useSound";

export default function CartApp() {
  const items = useCartStore((s) => s.items);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const products = useProductStore((s) => s.products);
  const launch = useLauncher();
  const play = useSound();

  const lines = items.map((i) => ({ ...i, product: getProductById(products, i.productId) })).filter((l) => l.product);
  const subtotal = lines.reduce((sum, l) => sum + (l.product.price ?? 0) * l.qty, 0);

  if (lines.length === 0) {
    return (
      <div className="app">
        <div className="app__scroll" style={{ padding: 24, textAlign: "center" }}>
          <Icon name="cart" size={48} />
          <div className="mono" style={{ marginTop: 10, color: "var(--metal-700)" }}>
            CART.DAT — 0 RECORDS
          </div>
          <p style={{ fontSize: 12.5 }}>Nothing in the cart yet. Open the Camera Archive to start browsing.</p>
          <button type="button" className="btn btn--primary" onClick={() => launch("archive")}>
            Browse Archive
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <div className="app__scroll">
        {lines.map((l) => (
          <div key={l.productId} className="cart-line">
            <div className="cart-line__thumb">
              <ProductPhoto product={l.product} />
            </div>
            <div className="cart-line__info">
              <div style={{ fontSize: 12.5, fontWeight: 700 }}>
                {l.product.brand} {l.product.model}
              </div>
              <div className="mono" style={{ fontSize: 11, color: "var(--metal-700)" }}>
                €{l.product.price} each
              </div>
              <div className="qty-stepper" style={{ marginTop: 4 }}>
                <button type="button" className="btn btn--sm" onClick={() => setQty(l.productId, l.qty - 1)} aria-label="Decrease quantity">
                  −
                </button>
                <input
                  className="input"
                  value={l.qty}
                  onChange={(e) => setQty(l.productId, Number(e.target.value.replace(/\D/g, "")) || 1)}
                  aria-label="Quantity"
                />
                <button type="button" className="btn btn--sm" onClick={() => setQty(l.productId, l.qty + 1)} aria-label="Increase quantity">
                  +
                </button>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700 }}>€{(l.product.price ?? 0) * l.qty}</div>
              <button
                type="button"
                className="btn btn--sm"
                style={{ marginTop: 6 }}
                onClick={() => {
                  remove(l.productId);
                  play("click");
                }}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
      <div className="app__statusbar" style={{ fontFamily: "var(--font-ui)" }}>
        <strong>Subtotal: €{subtotal}</strong>
        <button type="button" className="btn btn--primary" onClick={() => launch("checkout")}>
          Checkout →
        </button>
      </div>
    </div>
  );
}
