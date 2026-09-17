import ProductPhoto from "./ProductPhoto";
import Icon from "../desktop/Icon";
import { useWishlistStore } from "../../store/wishlistStore";
import { useSound } from "../../hooks/useSound";

const STATUS_BADGE = {
  AVAILABLE: "badge--ok",
  "ON HOLD": "badge--hold",
  SOLD: "badge--sold",
  DELETED: "badge--sold",
  CLASSIFIED: "badge--classified",
};

export default function ProductCard({ product, onOpen }) {
  const hasWish = useWishlistStore((s) => s.has(product.id));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const play = useSound();

  return (
    <div className="product-card" onClick={onOpen} role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && onOpen()}>
      <div className="product-card__thumb">
        <ProductPhoto product={product} />
        <button
          type="button"
          className="product-card__wish"
          aria-label={hasWish ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            toggleWish(product.id);
            play("click");
          }}
        >
          <Icon name={hasWish ? "heartFull" : "heart"} size={16} />
        </button>
      </div>
      <div className="product-card__body">
        <div className="mono product-card__filename">{product.id}.EXE</div>
        <div className="product-card__name">
          {product.brand} {product.model}
        </div>
        <div className="product-card__meta">
          <span className={`badge ${STATUS_BADGE[product.status]}`}>{product.status}</span>
          <span className="mono">{product.year}</span>
        </div>
        <div className="product-card__specs">
          {product.megapixels}MP · {product.opticalZoom}x zoom · {product.condition.overall ?? "?"}/10
        </div>
        <div className="product-card__price">{product.price != null ? `€${product.price}` : "— — —"}</div>
      </div>
    </div>
  );
}
