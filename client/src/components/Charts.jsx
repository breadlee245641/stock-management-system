import React from 'react';

// Donut Chart for Stock Status Breakdown
export function StockStatusDonut({ inStock = 0, lowStock = 0, outOfStock = 0 }) {
  const total = inStock + lowStock + outOfStock;
  if (total === 0) {
    return <div className="text-center text-slate-500 py-8 text-sm">No inventory data available</div>;
  }

  const inPct = (inStock / total) * 100;
  const lowPct = (lowStock / total) * 100;
  const outPct = (outOfStock / total) * 100;

  // 2 * PI * r = circumference. For r = 40, circumference ~ 251.32
  const r = 40;
  const c = 2 * Math.PI * r;

  const inDash = (inStock / total) * c;
  const lowDash = (lowStock / total) * c;
  const outDash = (outOfStock / total) * c;

  const inOffset = 0;
  const lowOffset = -inDash;
  const outOffset = -(inDash + lowDash);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
      <div className="relative w-40 h-40 flex items-center justify-center">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r={r} fill="transparent" stroke="#1e293b" strokeWidth="14" />
          {/* In Stock */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="transparent"
            stroke="#10b981"
            strokeWidth="14"
            strokeDasharray={`${inDash} ${c - inDash}`}
            strokeDashoffset={inOffset}
            className="transition-all duration-700 ease-out"
          />
          {/* Low Stock */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="transparent"
            stroke="#f59e0b"
            strokeWidth="14"
            strokeDasharray={`${lowDash} ${c - lowDash}`}
            strokeDashoffset={lowOffset}
            className="transition-all duration-700 ease-out"
          />
          {/* Out of Stock */}
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="transparent"
            stroke="#ef4444"
            strokeWidth="14"
            strokeDasharray={`${outDash} ${c - outDash}`}
            strokeDashoffset={outOffset}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{total}</span>
          <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">SKUs</span>
        </div>
      </div>

      <div className="space-y-3 w-full sm:w-auto">
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
            <span className="text-sm text-slate-300">In Stock</span>
          </div>
          <span className="text-sm font-semibold text-white ml-auto">{inStock} <span className="text-xs text-slate-500 font-normal">({inPct.toFixed(0)}%)</span></span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-amber-500"></span>
            <span className="text-sm text-slate-300">Low Stock Alert</span>
          </div>
          <span className="text-sm font-semibold text-amber-400 ml-auto">{lowStock} <span className="text-xs text-slate-500 font-normal">({lowPct.toFixed(0)}%)</span></span>
        </div>
        <div className="flex items-center justify-between sm:justify-start gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500"></span>
            <span className="text-sm text-slate-300">Out of Stock</span>
          </div>
          <span className="text-sm font-semibold text-rose-400 ml-auto">{outOfStock} <span className="text-xs text-slate-500 font-normal">({outPct.toFixed(0)}%)</span></span>
        </div>
      </div>
    </div>
  );
}

// Category Valuation Bar Chart
export function CategoryValuationBarChart({ categories = {} }) {
  const entries = Object.entries(categories);

  if (entries.length === 0) {
    return <div className="text-center text-slate-500 py-8 text-sm">No category valuation data</div>;
  }

  const maxVal = Math.max(...entries.map(([_, v]) => v.valuation || 0), 100);

  return (
    <div className="space-y-4 pt-2">
      {entries.map(([name, data]) => {
        const pct = Math.min(100, Math.round(((data.valuation || 0) / maxVal) * 100));
        return (
          <div key={name} className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-medium text-slate-300">{name}</span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">{data.count} items ({data.totalQty} units)</span>
                <span className="font-semibold text-emerald-400">${data.valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-2.5 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${Math.max(pct, 4)}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
