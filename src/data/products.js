// Camera archive data — real products dropped into product-drops/ and
// imported via `npm run import-products`.
// Shape is intentionally flat/serializable so this file can be swapped for a
// real API response (e.g. GET /api/cameras) without touching any component.

import { realProducts } from "./realProducts.generated";

export const CONDITION_SCALE = ["POOR", "FAIR", "GOOD", "EXCELLENT", "MINT"];

export const STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_HOLD: "ON HOLD",
  SOLD: "SOLD",
  DELETED: "DELETED",
  CLASSIFIED: "CLASSIFIED",
};

export const products = realProducts;

export const brands = Array.from(new Set(products.map((p) => p.brand))).sort();

export const years = Array.from(new Set(products.map((p) => p.year))).sort((a, b) => a - b);

export const storageTypes = Array.from(new Set(products.map((p) => p.storage))).sort();

export const batteryTypes = Array.from(
  new Set(products.map((p) => p.battery.replace(/^\d+×\s*/, "")))
).sort();

export function getVisibleProducts() {
  return products.filter((p) => p.status !== STATUS.DELETED && p.status !== STATUS.CLASSIFIED);
}

export function getDeletedProducts() {
  return products.filter((p) => p.status === STATUS.DELETED || p.status === STATUS.CLASSIFIED);
}

export function getProductById(id) {
  return products.find((p) => p.id === id);
}

export function getProductsByYear(year) {
  return getVisibleProducts().filter((p) => p.year === year);
}

export function getProductsByBrand(brand) {
  return getVisibleProducts().filter((p) => p.brand === brand);
}
