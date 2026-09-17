import CameraIllustration from "./CameraIllustration";

// Renders a real product photo when one was imported via
// `npm run import-products`, falling back to the flat illustration
// otherwise. Kept as one component so both the catalog card and the
// detail page stay in sync.
export default function ProductPhoto({ product, className, damaged = false }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={`${product.brand} ${product.model}`}
        className={className}
        style={{ width: "100%", height: "100%", objectFit: "cover" }}
      />
    );
  }
  return (
    <CameraIllustration
      bodyStyle={product.bodyStyle}
      colorway={product.colorway}
      damaged={damaged}
      className={className}
    />
  );
}
