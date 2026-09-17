// Maps a DB product row (+ known image count) into the exact shape the
// frontend already expects (camelCase, condition object, images array of
// URLs) — keeps the API contract identical to the old static data file.

export function serializeProduct(row, imageCount) {
  const images = Array.from({ length: imageCount }, (_, i) => `/api/products/${row.id}/image/${i}`);
  return {
    id: row.id,
    brand: row.brand,
    series: row.series || "",
    model: row.model,
    year: row.year,
    price: row.price == null ? null : Number(row.price),
    megapixels: row.megapixels == null ? 0 : Number(row.megapixels),
    opticalZoom: row.optical_zoom == null ? 0 : Number(row.optical_zoom),
    digitalZoom: row.digital_zoom == null ? 0 : Number(row.digital_zoom),
    storage: row.storage,
    battery: row.battery,
    displayInches: row.display_inches == null ? 0 : Number(row.display_inches),
    video: row.video,
    weightGrams: row.weight_grams,
    colorway: row.colorway,
    bodyStyle: row.body_style,
    condition: {
      body: row.condition_body,
      lens: row.condition_lens,
      lcd: row.condition_lcd,
      overall: row.condition_overall == null ? null : Number(row.condition_overall),
    },
    status: row.status,
    stock: row.stock,
    accessories: row.accessories || [],
    notes: row.notes,
    serial: row.serial,
    mystery: row.mystery || null,
    disabled: row.disabled,
    image: images[0] || null,
    images,
  };
}
