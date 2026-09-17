import { useState } from "react";
import { adminApi } from "./adminApi";

export default function AdminLogin({ onSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await adminApi.login(password);
      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin__login">
      <form className="admin__login-card" onSubmit={submit}>
        <h1>ARCHIVE.SYS Admin</h1>
        <p>Sign in to manage orders and inventory.</p>
        {error && <div className="a-error">{error}</div>}
        <div className="a-field">
          <label className="a-label" htmlFor="admin-pass">
            Password
          </label>
          <input
            id="admin-pass"
            type="password"
            className="a-input"
            autoFocus
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="a-btn a-btn--primary" style={{ width: "100%" }} disabled={busy}>
          {busy ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
