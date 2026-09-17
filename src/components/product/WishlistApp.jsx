import { useWishlistStore } from "../../store/wishlistStore";
import { getProductById } from "../../data/products";
import ProductCard from "./ProductCard";
import { useLauncher } from "../../hooks/useLauncher";

export default function WishlistApp() {
  const ids = useWishlistStore((s) => s.ids);
  const launch = useLauncher();
  const products = ids.map(getProductById).filter(Boolean);

  if (products.length === 0) {
    return (
      <div className="app__scroll" style={{ padding: 24, textAlign: "center" }}>
        <div className="mono" style={{ color: "var(--metal-700)" }}>
          WISHLIST.DAT — 0 RECORDS
        </div>
        <p style={{ fontSize: 12.5 }}>
          Click the heart icon on any camera file to save it here. Nothing gets deleted, nothing gets forgotten.
        </p>
      </div>
    );
  }

  return (
    <div className="catalog__grid app__scroll">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} onOpen={() => launch("product", { productId: p.id })} />
      ))}
    </div>
  );
}
