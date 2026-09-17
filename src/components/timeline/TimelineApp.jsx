import { useEffect, useState } from "react";
import { years, getProductsByYear } from "../../data/products";
import ProductCard from "../product/ProductCard";
import { useLauncher } from "../../hooks/useLauncher";

export default function TimelineApp() {
  const [year, setYear] = useState(years[years.length - 1]);
  const [scanLines, setScanLines] = useState([]);
  const [scanning, setScanning] = useState(false);
  const launch = useLauncher();

  useEffect(() => {
    setScanning(true);
    setScanLines([]);
    const items = getProductsByYear(year);
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
  }, [year]);

  const items = getProductsByYear(year);

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
        {scanning ? (
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
