import { useState } from "react";
import ProductPhoto from "./ProductPhoto";
import Icon from "../desktop/Icon";
import { getProductById, STATUS } from "../../data/productHelpers";
import { useProductStore } from "../../store/productStore";
import { getClue } from "../../data/clues";
import { useCartStore } from "../../store/cartStore";
import { useWishlistStore } from "../../store/wishlistStore";
import { useSystemStore } from "../../store/systemStore";
import { useSound } from "../../hooks/useSound";
import { useNotifyStore } from "../../store/notifyStore";

const STATUS_BADGE = {
  AVAILABLE: "badge--ok",
  "ON HOLD": "badge--hold",
  SOLD: "badge--sold",
  DELETED: "badge--sold",
  CLASSIFIED: "badge--classified",
};

export default function ProductDetailApp({ productId }) {
  const products = useProductStore((s) => s.products);
  const fetchStatus = useProductStore((s) => s.status);
  const product = getProductById(products, productId);
  const add = useCartStore((s) => s.add);
  const hasWish = useWishlistStore((s) => s.has(productId));
  const toggleWish = useWishlistStore((s) => s.toggle);
  const restoredFiles = useSystemStore((s) => s.restoredFiles);
  const restoreFile = useSystemStore((s) => s.restoreFile);
  const discoverClue = useSystemStore((s) => s.discoverClue);
  const play = useSound();
  const push = useNotifyStore((s) => s.push);
  const [justAdded, setJustAdded] = useState(false);
  const [activePhoto, setActivePhoto] = useState(0);

  if (!product) {
    return (
      <div className="app__scroll" style={{ padding: 20 }}>
        {fetchStatus === "ready" ? "RECORD NOT FOUND." : "READING RECORD..."}
      </div>
    );
  }

  const sealed = (product.status === STATUS.DELETED || product.status === STATUS.CLASSIFIED) && !restoredFiles.includes(productId);

  if (sealed) {
    return (
      <div className="app__scroll" style={{ padding: 20, fontFamily: "var(--font-mono)", fontSize: 13 }}>
        <div className={`badge ${STATUS_BADGE[product.status]}`} style={{ marginBottom: 10 }}>
          {product.status}
        </div>
        <div>SERIAL: {product.serial}</div>
        <div style={{ margin: "10px 0", opacity: 0.75 }}>
          This record has been {product.status.toLowerCase()}. The desktop shell won't display its contents until it's
          restored.
        </div>
        <button
          type="button"
          className="btn"
          onClick={() => {
            restoreFile(productId);
            if (product.mystery) discoverClue(product.mystery.clueId);
            play("notify");
          }}
        >
          {product.status === STATUS.CLASSIFIED ? "[ ATTEMPT OVERRIDE ]" : "[ RESTORE FILE ]"}
        </button>
      </div>
    );
  }

  const clue = product.mystery ? getClue(product.mystery.clueId) : null;
  const soldOut = product.status !== STATUS.AVAILABLE;

  return (
    <div className="product-detail app__scroll">
      <div className="product-detail__photo">
        <ProductPhoto
          product={product.images?.length ? { ...product, image: product.images[activePhoto] } : product}
          damaged={product.condition.overall && product.condition.overall < 7}
        />
        {product.images?.length > 1 && (
          <div className="product-detail__thumbs">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={`product-detail__thumb-btn ${i === activePhoto ? "product-detail__thumb-btn--active" : ""}`}
                onClick={() => setActivePhoto(i)}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={src} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="product-detail__info">
        <div className="mono" style={{ fontSize: 11, color: "var(--metal-700)" }}>
          {product.id}.EXE · SERIAL {product.serial}
        </div>
        <h2 style={{ margin: "4px 0 6px", fontSize: 19 }}>
          {product.brand} {product.series} {product.model}
        </h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
          <span className={`badge ${STATUS_BADGE[product.status]}`}>{product.status}</span>
          <span className="mono" style={{ fontSize: 12 }}>
            YEAR: {product.year}
          </span>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => {
              toggleWish(productId);
              play("click");
            }}
          >
            <Icon name={hasWish ? "heartFull" : "heart"} size={14} /> {hasWish ? "Wishlisted" : "Wishlist"}
          </button>
        </div>

        <table className="spec-table">
          <tbody>
            <tr><td>CCD / MEGAPIXELS</td><td>{product.megapixels} MP</td></tr>
            <tr><td>OPTICAL ZOOM</td><td>{product.opticalZoom}x</td></tr>
            <tr><td>MEDIA</td><td>{product.storage}</td></tr>
            <tr><td>BATTERY</td><td>{product.battery}</td></tr>
            <tr><td>DISPLAY</td><td>{product.displayInches ? `${product.displayInches}"` : "N/A"}</td></tr>
            <tr><td>VIDEO</td><td>{product.video}</td></tr>
            <tr><td>WEIGHT</td><td>{product.weightGrams}g</td></tr>
          </tbody>
        </table>

        <div className="filter-group__title">CONDITION</div>
        <div className="condition-grid">
          <div className="condition-grid__item">
            <span>BODY</span>
            <strong>{product.condition.body}</strong>
          </div>
          <div className="condition-grid__item">
            <span>LENS</span>
            <strong>{product.condition.lens}</strong>
          </div>
          <div className="condition-grid__item">
            <span>LCD</span>
            <strong>{product.condition.lcd}</strong>
          </div>
        </div>

        {product.accessories.length > 0 && (
          <>
            <div className="filter-group__title">INCLUDED ACCESSORIES</div>
            <ul style={{ margin: "0 0 10px", paddingLeft: 18, fontSize: 12.5 }}>
              {product.accessories.map((a) => (
                <li key={a}>{a}</li>
              ))}
            </ul>
          </>
        )}

        {product.notes && (
          <div className="panel" style={{ fontSize: 12, marginBottom: 10 }}>
            {product.notes}
          </div>
        )}

        {clue && (
          <div className="panel--sunken mono" style={{ fontSize: 11.5, marginBottom: 10, whiteSpace: "pre-wrap", padding: 10 }}>
            {clue.title}
            {"\n\n"}
            {clue.body}
          </div>
        )}

        <div className="price-row">
          <span className="price-row__value">{product.price != null ? `€${product.price}` : "— — —"}</span>
          <span className="mono" style={{ fontSize: 11, color: "var(--metal-700)" }}>
            {product.stock > 0 ? `${product.stock} IN STOCK` : "OUT OF STOCK"}
          </span>
        </div>

        <button
          type="button"
          className="btn btn--primary"
          disabled={soldOut}
          onClick={() => {
            add(product.id, 1);
            play("notify");
            setJustAdded(true);
            push("ARCHIVE.SYS", `${product.brand} ${product.model} added to cart.`, 3500);
            setTimeout(() => setJustAdded(false), 1600);
          }}
        >
          {soldOut ? "[ UNAVAILABLE ]" : justAdded ? "ADDED ✓" : "[ ADD TO CART ]"}
        </button>
      </div>
    </div>
  );
}
