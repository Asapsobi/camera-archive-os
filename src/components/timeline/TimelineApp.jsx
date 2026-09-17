import { useEffect, useMemo, useState } from "react";
import { getYears, getProductsByYear } from "../../data/productHelpers";
import { useProductStore } from "../../store/productStore";
import ProductCard from "../product/ProductCard";
import { useLauncher } from "../../hooks/useLauncher";

export default function TimelineApp() {
  const products = useProductStore((s) => s.products);
  const years = useMemo(() => getYears(products), [products]);
  const [year, setYear] = useState(null);
  const [scanLines, setScanLines] = useState([]);
  const [scanning, setScanning] = useState(false);
  const launch = useLauncher();

  useEffect(() => {
    if (year == null && years.length) setYear(years[years.length - 1]);
  }, [year, years]);

  useEffect(() => {
    if (year == null) return;
    setScanning(true);
    setScanLines([]);
    const items = getProductsByYear(products, year);
    const steps = [
      `SEEKING SECTOR ${year}...`,
      `INDEX FOUND: ${items.length} DEVICE${items.length === 1 ? "" : "S"}`,
      "VERIFYING CHECKSUMS...",
      "OK.",
    ];
    let i = 0;
    const id = setInterval(() => {
      setScanLines((s) => [...s, steps[i]]);
      i += 1;
      if (i >= steps.length) {
        clearInterval(id);
        setScanning(false);
      }
    }, 140);
    return () => clearInterval(id);
  }, [year, products]);

  const items = year == null ? [] : getProductsByYear(products, year);

  return (
    <div className="timeline">
      <div className="timeline__years">
        {years.map((y) => (
          <button key={y} className={`timeline__year-btn ${y === year ? "timeline__year-btn--active" : ""}`} onClick={() => setYear(y)}>
            {y}
          </button>
        ))}
      </div>
      <div className="timeline__content">
        {year == null ? (
          <div className="catalog__empty">LOADING ARCHIVE INDEX...</div>
        ) : scanning ? (
          <div>
            {scanLines.map((l, i) => (
              <div key={i} className="scan-line">
                {l}
              </div>
            ))}
            <span className="blink-cursor" />
          </div>
        ) : items.length === 0 ? (
          <div className="catalog__empty">NO DEVICES INDEXED FOR {year}.</div>
        ) : (
          <div className="catalog__grid" style={{ padding: 0 }}>
            {items.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={() => launch("product", { productId: p.id })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
