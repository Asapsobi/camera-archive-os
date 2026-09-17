// Pure derivations over a `products` array. Framework-agnostic on purpose —
// used by useProductStore, which is the only thing that knows the data
// comes from a live API rather than a static file.

export const CONDITION_SCALE = ["POOR", "FAIR", "GOOD", "EXCELLENT", "MINT"];

export const STATUS = {
  AVAILABLE: "AVAILABLE",
  ON_HOLD: "ON HOLD",
  SOLD: "SOLD",
  DELETED: "DELETED",
  CLASSIFIED: "CLASSIFIED",
};

export function getVisibleProducts(products) {
  return products.filter((p) => p.status !== STATUS.DELETED && p.status !== STATUS.CLASSIFIED);
}

export function getDeletedProducts(products) {
  return products.filter((p) => p.status === STATUS.DELETED || p.status === STATUS.CLASSIFIED);
}

export function getProductById(products, id) {
  return products.find((p) => p.id === id);
}

export function getProductsByYear(products, year) {
  return getVisibleProducts(products).filter((p) => p.year === year);
}

export function getProductsByBrand(products, brand) {
  return getVisibleProducts(products).filter((p) => p.brand === brand);
}

export function getBrands(products) {
  return Array.from(new Set(products.map((p) => p.brand))).sort();
}

export function getYears(products) {
  return Array.from(new Set(products.map((p) => p.year))).sort((a, b) => a - b);
}

export function getStorageTypes(products) {
  return Array.from(new Set(products.map((p) => p.storage))).sort();
}

export function getBatteryTypes(products) {
  return Array.from(new Set(products.map((p) => p.battery.replace(/^\d+×\s*/, "")))).sort();
}
