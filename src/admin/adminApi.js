async function request(path, options = {}) {
  const res = await fetch(`/api${path}`, {
    ...options,
    credentials: "same-origin",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.error || `HTTP ${res.status}`);
    if (res.status === 401) err.unauthorized = true;
    throw err;
  }
  if (res.status === 204) return null;
  return res.json();
}

export const adminApi = {
  session: () => request("/admin/session"),
  login: (password) =>
    request("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }),
  logout: () => request("/admin/logout", { method: "POST" }),

  listProducts: () => request("/admin/products"),
  createProduct: (formData) => request("/admin/products", { method: "POST", body: formData }),
  updateProduct: (id, formData) => request(`/admin/products/${id}`, { method: "PATCH", body: formData }),
  toggleProduct: (id) => request(`/admin/products/${id}/toggle`, { method: "POST" }),
  deleteProduct: (id) => request(`/admin/products/${id}`, { method: "DELETE" }),

  listOrders: () => request("/admin/orders"),
  updateOrderStatus: (code, status) =>
    request(`/admin/orders/${code}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    }),
};
