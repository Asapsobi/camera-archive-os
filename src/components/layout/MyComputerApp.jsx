import { useEffect, useMemo, useState } from "react";
import Icon from "../desktop/Icon";
import { getBrands, getProductsByBrand } from "../../data/productHelpers";
import { useProductStore } from "../../store/productStore";
import { useLauncher } from "../../hooks/useLauncher";

export default function MyComputerApp() {
  const products = useProductStore((s) => s.products);
  const brands = useMemo(() => getBrands(products), [products]);
  const [selected, setSelected] = useState(null);
  const launch = useLauncher();

  useEffect(() => {
    if (selected == null && brands.length) setSelected(brands[0]);
  }, [selected, brands]);

  return (
    <div className="explorer">
      <div className="explorer__tree">
        <button type="button" style={{ fontWeight: 700 }} onClick={() => setSelected(null)}>
          <Icon name="computer" size={18} /> ARCHIVE (C:)
        </button>
        {brands.map((b) => (
          <button key={b} onClick={() => setSelected(b)} style={{ paddingLeft: 22, background: selected === b ? "var(--xp-blue-300)" : undefined }}>
            <Icon name="folder" size={16} /> {b}
          </button>
        ))}
      </div>
      <div className="explorer__panel">
        {!selected ? (
          <p style={{ fontSize: 12.5 }}>Select a manufacturer folder on the left to see how many units are indexed.</p>
        ) : (
          <>
            <h3 style={{ marginTop: 0 }}>{selected}\</h3>
            <p className="mono" style={{ fontSize: 12 }}>{getProductsByBrand(products, selected).length} file(s) indexed</p>
            <div
              role="button"
              tabIndex={0}
              onClick={() => launch("archive", { initialBrand: selected })}
              onKeyDown={(e) => e.key === "Enter" && launch("archive", { initialBrand: selected })}
              style={{ display: "inline-flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}
            >
              <Icon name="folder" size={48} />
              <span style={{ fontSize: 11.5 }}>{selected}</span>
            </div>
            <p style={{ fontSize: 11.5, color: "var(--metal-700)", marginTop: 10 }}>tap to open in Camera Archive</p>
          </>
        )}
      </div>
    </div>
  );
}
