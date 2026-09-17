import { useEffect, useState } from "react";
import { adminApi } from "./adminApi";
import ProductForm from "./ProductForm";

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new, object = edit

  async function load() {
    setStatus("loading");
    try {
      setProducts(await adminApi.listProducts());
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id) {
    try {
      await adminApi.toggleProduct(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  async function remove(id) {
    if (!confirm("Delete this product permanently? This can't be undone.")) return;
    try {
      await adminApi.deleteProduct(id);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="admin__toolbar">
        <h2>Products ({products.length})</h2>
        <button type="button" className="a-btn a-btn--primary" onClick={() => setEditing(null)}>
          + Add camera
        </button>
      </div>

      {status === "error" && <div className="a-error">{error}</div>}

      {status === "loading" ? (
        <p>Loading...</p>
      ) : (
        <div className="a-table-wrap">
          <table className="a-table">
            <thead>
              <tr>
                <th></th>
                <th>ID</th>
                <th>Brand / model</th>
                <th>Year</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className={p.disabled ? "a-row--disabled" : ""}>
                  <td>
                    <div className="a-thumb">{p.image && <img src={p.image} alt="" />}</div>
                  </td>
                  <td className="mono">{p.id}</td>
                  <td>
                    {p.brand} {p.model}
                  </td>
                  <td>{p.year}</td>
                  <td>{p.price != null ? `€${p.price}` : "—"}</td>
                  <td>{p.stock}</td>
                  <td>
                    <span
                      className={`a-badge ${
                        p.disabled ? "a-badge--danger" : p.status === "AVAILABLE" ? "a-badge--ok" : "a-badge--warn"
                      }`}
                    >
                      {p.disabled ? "DISABLED" : p.status}
                    </span>
                  </td>
                  <td style={{ whiteSpace: "nowrap" }}>
                    <button type="button" className="a-btn a-btn--sm" onClick={() => setEditing(p)}>
                      Edit
                    </button>{" "}
                    <button type="button" className="a-btn a-btn--sm" onClick={() => toggle(p.id)}>
                      {p.disabled ? "Enable" : "Disable"}
                    </button>{" "}
                    <button type="button" className="a-btn a-btn--sm a-btn--danger" onClick={() => remove(p.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan={8} style={{ textAlign: "center", color: "var(--a-text-soft)" }}>
                    No products yet — add your first camera.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editing !== undefined && (
        <ProductForm
          product={editing}
          onClose={() => setEditing(undefined)}
          onSaved={() => {
            setEditing(undefined);
            load();
          }}
        />
      )}
    </div>
  );
}
