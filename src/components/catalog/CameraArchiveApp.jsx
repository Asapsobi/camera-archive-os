import { useEffect, useMemo, useState } from "react";
import { getVisibleProducts } from "../../data/products";
import ProductCard from "../product/ProductCard";
import FilterPanel, { DEFAULT_FILTERS } from "./FilterPanel";
import { useLauncher } from "../../hooks/useLauncher";

const SORTS = {
  "year-desc": { label: "Year (newest first)", cmp: (a, b) => b.year - a.year },
  "year-asc": { label: "Year (oldest first)", cmp: (a, b) => a.year - b.year },
  "price-asc": { label: "Price (low to high)", cmp: (a, b) => (a.price ?? 0) - (b.price ?? 0) },
  "price-desc": { label: "Price (high to low)", cmp: (a, b) => (b.price ?? 0) - (a.price ?? 0) },
  "mp-desc": { label: "Megapixels (highest)", cmp: (a, b) => b.megapixels - a.megapixels },
};

export default function CameraArchiveApp({ initialBrand }) {
  const launch = useLauncher();
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("year-desc");
  const [filters, setFilters] = useState(() =>
    initialBrand ? { ...DEFAULT_FILTERS, brands: new Set([initialBrand]) } : DEFAULT_FILTERS
  );
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 480);
    return () => clearTimeout(t);
  }, []);

  const results = useMemo(() => {
    const all = getVisibleProducts();
    const q = query.trim().toLowerCase();
    const filtered = all.filter((p) => {
      if (filters.brands.size && !filters.brands.has(p.brand)) return false;
      if (p.year < filters.yearMin || p.year > filters.yearMax) return false;
      if (p.price != null && p.price > filters.priceMax) return false;
      if (p.megapixels < filters.mpMin) return false;
      if (p.opticalZoom < filters.zoomMin) return false;
      if ((p.condition.overall ?? 0) < filters.conditionMin) return false;
      if (filters.storage.size && !filters.storage.has(p.storage)) return false;
      if (filters.battery.size) {
        const batt = p.battery.replace(/^\d+×\s*/, "");
        if (!filters.battery.has(batt)) return false;
      }
      if (filters.videoOnly && (!p.video || p.video === "None")) return false;
      if (q) {
        const hay = `${p.brand} ${p.model} ${p.series} ${p.id}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
    return filtered.sort(SORTS[sort].cmp);
  }, [query, sort, filters]);

  return (
    <div className="catalog">
      <div className={`catalog__sidebar ${sidebarOpen ? "catalog__sidebar--open" : ""}`}>
        <FilterPanel filters={filters} setFilters={setFilters} />
      </div>
      <div className="catalog__main">
        <div className="catalog__toolbar">
          <input
            className="input"
            type="search"
            placeholder="search brand, model, or file ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search cameras"
          />
          <select className="select" value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort by">
            {Object.entries(SORTS).map(([key, s]) => (
              <option key={key} value={key}>
                {s.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="btn btn--sm"
            onClick={() => setSidebarOpen((v) => !v)}
            aria-expanded={sidebarOpen}
          >
            Filters {sidebarOpen ? "▲" : "▼"}
          </button>
        </div>

        {loading ? (
          <div className="app__scroll" style={{ padding: 16 }}>
            <div className="mono" style={{ marginBottom: 10, fontSize: 12, color: "var(--metal-700)" }}>
              CONNECTING TO ARCHIVE DATABASE<span className="blink-cursor" />
            </div>
            <div className="progressbar" aria-hidden="true">
              {Array.from({ length: 18 }).map((_, i) => (
                <div key={i} className="progressbar__chunk" style={{ animationDelay: `${i * 40}ms` }} />
              ))}
            </div>
          </div>
        ) : results.length === 0 ? (
          <div className="catalog__empty">
            NO RECORDS MATCH THIS QUERY.
            <br />
            try widening the filters, archivist.
          </div>
        ) : (
          <div className="catalog__grid">
            {results.map((p) => (
              <ProductCard key={p.id} product={p} onOpen={() => launch("product", { productId: p.id })} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
