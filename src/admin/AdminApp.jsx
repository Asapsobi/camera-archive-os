import { useEffect, useState } from "react";
import { adminApi } from "./adminApi";
import AdminLogin from "./AdminLogin";
import AdminProducts from "./AdminProducts";
import AdminOrders from "./AdminOrders";

export default function AdminApp() {
  const [authed, setAuthed] = useState(null); // null = checking
  const [tab, setTab] = useState("products");

  useEffect(() => {
    adminApi
      .session()
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  async function logout() {
    await adminApi.logout();
    setAuthed(false);
  }

  if (authed === null) return null;
  if (!authed) return <AdminLogin onSuccess={() => setAuthed(true)} />;

  return (
    <div className="admin">
      <header className="admin__header">
        <span className="admin__brand">ARCHIVE.SYS Admin</span>
        <nav className="admin__tabs">
          <button type="button" className={`admin__tab ${tab === "products" ? "admin__tab--active" : ""}`} onClick={() => setTab("products")}>
            Products
          </button>
          <button type="button" className={`admin__tab ${tab === "orders" ? "admin__tab--active" : ""}`} onClick={() => setTab("orders")}>
            Orders
          </button>
        </nav>
        <button type="button" className="a-btn a-btn--sm" onClick={logout}>
          Sign out
        </button>
      </header>
      <div className="admin__body">{tab === "products" ? <AdminProducts /> : <AdminOrders />}</div>
    </div>
  );
}
