import { brands, storageTypes, batteryTypes, years } from "../../data/products";

function toggleInSet(set, value) {
  const next = new Set(set);
  if (next.has(value)) next.delete(value);
  else next.add(value);
  return next;
}

export const DEFAULT_FILTERS = {
  brands: new Set(),
  storage: new Set(),
  battery: new Set(),
  yearMin: years[0],
  yearMax: years[years.length - 1],
  priceMax: 250,
  mpMin: 0,
  zoomMin: 0,
  conditionMin: 0,
  videoOnly: false,
};

export default function FilterPanel({ filters, setFilters }) {
  function patch(p) {
    setFilters((f) => ({ ...f, ...p }));
  }

  return (
    <div aria-label="Filters">
      <div className="filter-group">
        <div className="filter-group__title">Brand</div>
        <div className="filter-chip-row">
          {brands.map((b) => (
            <button
              key={b}
              type="button"
              className={`filter-chip ${filters.brands.has(b) ? "filter-chip--active" : ""}`}
              onClick={() => patch({ brands: toggleInSet(filters.brands, b) })}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Year</div>
        <div className="field">
          <label htmlFor="yearMin">
            {filters.yearMin} – {filters.yearMax}
          </label>
          <input
            id="yearMin"
            type="range"
            min={years[0]}
            max={years[years.length - 1]}
            value={filters.yearMin}
            onChange={(e) => patch({ yearMin: Math.min(Number(e.target.value), filters.yearMax) })}
          />
          <input
            type="range"
            min={years[0]}
            max={years[years.length - 1]}
            value={filters.yearMax}
            onChange={(e) => patch({ yearMax: Math.max(Number(e.target.value), filters.yearMin) })}
          />
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Max price: €{filters.priceMax}</div>
        <input
          type="range"
          min={0}
          max={250}
          step={5}
          value={filters.priceMax}
          onChange={(e) => patch({ priceMax: Number(e.target.value) })}
          aria-label="Maximum price"
        />
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Min megapixels: {filters.mpMin}MP</div>
        <input
          type="range"
          min={0}
          max={16}
          step={0.5}
          value={filters.mpMin}
          onChange={(e) => patch({ mpMin: Number(e.target.value) })}
          aria-label="Minimum megapixels"
        />
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Min optical zoom: {filters.zoomMin}x</div>
        <input
          type="range"
          min={0}
          max={12}
          step={1}
          value={filters.zoomMin}
          onChange={(e) => patch({ zoomMin: Number(e.target.value) })}
          aria-label="Minimum optical zoom"
        />
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Min condition: {filters.conditionMin}/10</div>
        <input
          type="range"
          min={0}
          max={9}
          step={0.5}
          value={filters.conditionMin}
          onChange={(e) => patch({ conditionMin: Number(e.target.value) })}
          aria-label="Minimum condition score"
        />
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Storage</div>
        <div className="filter-chip-row">
          {storageTypes.map((s) => (
            <button
              key={s}
              type="button"
              className={`filter-chip ${filters.storage.has(s) ? "filter-chip--active" : ""}`}
              onClick={() => patch({ storage: toggleInSet(filters.storage, s) })}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group">
        <div className="filter-group__title">Battery</div>
        <div className="filter-chip-row">
          {batteryTypes.map((b) => (
            <button
              key={b}
              type="button"
              className={`filter-chip ${filters.battery.has(b) ? "filter-chip--active" : ""}`}
              onClick={() => patch({ battery: toggleInSet(filters.battery, b) })}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-group checkbox-row">
        <input
          id="videoOnly"
          type="checkbox"
          checked={filters.videoOnly}
          onChange={(e) => patch({ videoOnly: e.target.checked })}
        />
        <label htmlFor="videoOnly">Has video capability</label>
      </div>

      <button type="button" className="btn btn--sm" onClick={() => setFilters(DEFAULT_FILTERS)}>
        Reset filters
      </button>
    </div>
  );
}
