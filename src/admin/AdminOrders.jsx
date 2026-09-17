import { Fragment, useEffect, useState } from "react";
import { adminApi } from "./adminApi";

const STATUS_BADGE = {
  paid: "a-badge--ok",
  pending: "a-badge--warn",
  failed: "a-badge--danger",
  cancelled: "a-badge--danger",
  fulfilled: "a-badge--ok",
};

const NEXT_STATUSES = ["pending", "paid", "fulfilled", "cancelled", "failed"];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  async function load() {
    setStatus("loading");
    try {
      setOrders(await adminApi.listOrders());
      setStatus("ready");
    } catch (err) {
      setError(err.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function changeStatus(code, newStatus) {
    try {
      await adminApi.updateOrderStatus(code, newStatus);
      load();
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div>
      <div className="admin__toolbar">
        <h2>Orders ({orders.length})</h2>
        <button type="button" className="a-btn" onClick={load}>
          Refresh
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
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Placed</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <Fragment key={o.code}>
                  <tr>
                    <td className="mono">{o.code}</td>
                    <td>
                      {o.customerName || "—"}
                      <br />
                      <span style={{ color: "var(--a-text-soft)", fontSize: 12 }}>{o.email}</span>
                    </td>
                    <td>
                      <button type="button" className="a-btn a-btn--sm" onClick={() => setExpanded(expanded === o.code ? null : o.code)}>
                        {o.items.length} item{o.items.length === 1 ? "" : "s"} {expanded === o.code ? "▲" : "▼"}
                      </button>
                    </td>
                    <td>
                      €{o.subtotal} {o.currency}
                    </td>
                    <td>
                      <span className={`a-badge ${STATUS_BADGE[o.status] || ""}`}>{o.status}</span>
                    </td>
                    <td style={{ fontSize: 12.5 }}>{new Date(o.createdAt).toLocaleString()}</td>
                    <td>
                      <select
                        className="a-select"
                        style={{ width: "auto" }}
                        value={o.status}
                        onChange={(e) => changeStatus(o.code, e.target.value)}
                      >
                        {NEXT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                  {expanded === o.code && (
                    <tr>
                      <td></td>
                      <td colSpan={6}>
                        <div style={{ fontSize: 12.5, marginBottom: 6 }}>
                          {o.address}, {o.city} {o.postalCode}, {o.country}
                        </div>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {o.items.map((it, i) => (
                            <li key={i}>
                              {it.qty}× {it.brand} {it.model} — €{it.unitPrice} each
                            </li>
                          ))}
                        </ul>
                        {o.paymentRef && (
                          <div style={{ fontSize: 12, color: "var(--a-text-soft)", marginTop: 6 }}>
                            Payment ref: {o.paymentRef} via {o.paymentGateway}
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", color: "var(--a-text-soft)" }}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
