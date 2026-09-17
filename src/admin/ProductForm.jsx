import { useState } from "react";
import { adminApi } from "./adminApi";

const COLORWAYS = ["silver", "black", "graphite", "titanium", "blue", "pink", "orange", "white"];
const BODY_STYLES = ["compact", "ultracompact", "bridge", "rugged", "mirrorless"];
const CONDITIONS = ["POOR", "FAIR", "GOOD", "EXCELLENT", "MINT"];
const STATUSES = ["AVAILABLE", "ON HOLD", "SOLD", "DELETED", "CLASSIFIED"];

function fieldsFromProduct(p) {
  if (!p) {
    return {
      brand: "",
      series: "",
      model: "",
      year: "",
      price: "",
      megapixels: "",
      opticalZoom: "",
      digitalZoom: "",
      storage: "",
      battery: "",
      displayInches: "",
      video: "",
      weightGrams: "",
      colorway: "silver",
      bodyStyle: "compact",
      conditionBody: "GOOD",
      conditionLens: "GOOD",
      conditionLcd: "GOOD",
      conditionOverall: "",
      status: "AVAILABLE",
      stock: "1",
      accessories: "",
      notes: "",
      serial: "",
    };
  }
  return {
    brand: p.brand || "",
    series: p.series || "",
    model: p.model || "",
    year: p.year ?? "",
    price: p.price ?? "",
    megapixels: p.megapixels ?? "",
    opticalZoom: p.opticalZoom ?? "",
    digitalZoom: p.digitalZoom ?? "",
    storage: p.storage || "",
    battery: p.battery || "",
    displayInches: p.displayInches ?? "",
    video: p.video || "",
    weightGrams: p.weightGrams ?? "",
    colorway: p.colorway || "silver",
    bodyStyle: p.bodyStyle || "compact",
    conditionBody: p.condition?.body || "GOOD",
    conditionLens: p.condition?.lens || "GOOD",
    conditionLcd: p.condition?.lcd || "GOOD",
    conditionOverall: p.condition?.overall ?? "",
    status: p.status || "AVAILABLE",
    stock: p.stock ?? "1",
    accessories: (p.accessories || []).join(", "),
    notes: p.notes || "",
    serial: p.serial || "",
  };
}

export default function ProductForm({ product, onClose, onSaved }) {
  const [fields, setFields] = useState(() => fieldsFromProduct(product));
  const [newImages, setNewImages] = useState([]);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  function set(key) {
    return (e) => setFields((f) => ({ ...f, [key]: e.target.value }));
  }

  async function submit(e) {
    e.preventDefault();
    if (!fields.brand || !fields.model) {
      setError("Brand and model are required.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      for (const [key, value] of Object.entries(fields)) {
        form.append(key, value);
      }
      for (const file of newImages) form.append("images", file);

      if (product) {
        await adminApi.updateProduct(product.id, form);
      } else {
        await adminApi.createProduct(form);
      }
      onSaved();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="a-modal">
        <h3>{product ? `Edit ${product.brand} ${product.model}` : "Add a new camera"}</h3>
        {error && <div className="a-error">{error}</div>}
        <form onSubmit={submit}>
          <div className="a-form-grid">
            <div className="a-field">
              <label className="a-label">Brand *</label>
              <input className="a-input" value={fields.brand} onChange={set("brand")} required />
            </div>
            <div className="a-field">
              <label className="a-label">Series</label>
              <input className="a-input" value={fields.series} onChange={set("series")} />
            </div>
            <div className="a-field">
              <label className="a-label">Model *</label>
              <input className="a-input" value={fields.model} onChange={set("model")} required />
            </div>
            <div className="a-field">
              <label className="a-label">Year</label>
              <input className="a-input" type="number" value={fields.year} onChange={set("year")} />
            </div>
            <div className="a-field">
              <label className="a-label">Price (€, blank = unpriced)</label>
              <input className="a-input" type="number" step="0.01" value={fields.price} onChange={set("price")} />
            </div>
            <div className="a-field">
              <label className="a-label">Stock</label>
              <input className="a-input" type="number" value={fields.stock} onChange={set("stock")} />
            </div>
            <div className="a-field">
              <label className="a-label">Megapixels</label>
              <input className="a-input" type="number" step="0.1" value={fields.megapixels} onChange={set("megapixels")} />
            </div>
            <div className="a-field">
              <label className="a-label">Optical zoom (x)</label>
              <input className="a-input" type="number" step="0.1" value={fields.opticalZoom} onChange={set("opticalZoom")} />
            </div>
            <div className="a-field">
              <label className="a-label">Digital zoom (x)</label>
              <input className="a-input" type="number" step="0.1" value={fields.digitalZoom} onChange={set("digitalZoom")} />
            </div>
            <div className="a-field">
              <label className="a-label">Display (inches)</label>
              <input className="a-input" type="number" step="0.1" value={fields.displayInches} onChange={set("displayInches")} />
            </div>
            <div className="a-field">
              <label className="a-label">Storage</label>
              <input className="a-input" value={fields.storage} onChange={set("storage")} placeholder="SD / SDHC" />
            </div>
            <div className="a-field">
              <label className="a-label">Battery</label>
              <input className="a-input" value={fields.battery} onChange={set("battery")} placeholder="2x AA" />
            </div>
            <div className="a-field">
              <label className="a-label">Video</label>
              <input className="a-input" value={fields.video} onChange={set("video")} placeholder="1280x720 @30fps" />
            </div>
            <div className="a-field">
              <label className="a-label">Weight (g)</label>
              <input className="a-input" type="number" value={fields.weightGrams} onChange={set("weightGrams")} />
            </div>
            <div className="a-field">
              <label className="a-label">Colorway</label>
              <select className="a-select" value={fields.colorway} onChange={set("colorway")}>
                {COLORWAYS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Body style</label>
              <select className="a-select" value={fields.bodyStyle} onChange={set("bodyStyle")}>
                {BODY_STYLES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Condition — body</label>
              <select className="a-select" value={fields.conditionBody} onChange={set("conditionBody")}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Condition — lens</label>
              <select className="a-select" value={fields.conditionLens} onChange={set("conditionLens")}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Condition — LCD</label>
              <select className="a-select" value={fields.conditionLcd} onChange={set("conditionLcd")}>
                {CONDITIONS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Condition — overall (0-10)</label>
              <input className="a-input" type="number" step="0.5" min="0" max="10" value={fields.conditionOverall} onChange={set("conditionOverall")} />
            </div>
            <div className="a-field">
              <label className="a-label">Status</label>
              <select className="a-select" value={fields.status} onChange={set("status")}>
                {STATUSES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="a-field">
              <label className="a-label">Serial</label>
              <input className="a-input" value={fields.serial} onChange={set("serial")} placeholder="auto-generated if blank" />
            </div>
            <div className="a-field a-form-grid--full">
              <label className="a-label">Accessories (comma-separated)</label>
              <input className="a-input" value={fields.accessories} onChange={set("accessories")} placeholder="Original box, Strap" />
            </div>
            <div className="a-field a-form-grid--full">
              <label className="a-label">Notes</label>
              <textarea className="a-textarea" rows={3} value={fields.notes} onChange={set("notes")} />
            </div>

            {product?.images?.length > 0 && (
              <div className="a-field a-form-grid--full">
                <label className="a-label">Current photos</label>
                <div className="a-image-row">
                  {product.images.map((src) => (
                    <img key={src} src={src} alt="" />
                  ))}
                </div>
              </div>
            )}

            <div className="a-field a-form-grid--full">
              <label className="a-label">
                {product ? "Replace photos (leave empty to keep current)" : "Photos"}
              </label>
              <input
                className="a-input"
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setNewImages(Array.from(e.target.files))}
              />
            </div>
          </div>

          <div className="a-modal-actions">
            <button type="button" className="a-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="a-btn a-btn--primary" disabled={busy}>
              {busy ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
