import React from 'react';
import { FileSpreadsheet, Printer, Download, TrendingUp, AlertTriangle, ShieldCheck, DollarSign } from 'lucide-react';

export default function Reports({ products = [], stats = {} }) {
  const summary = stats.summary || {};
  const categoryBreakdown = stats.categoryBreakdown || {};

  // Sort products by total tied-up capital (qty * costPrice)
  const sortedByValuation = [...products].sort((a, b) => b.quantity * b.costPrice - a.quantity * a.costPrice);

  const reorderList = products.filter((p) => p.quantity <= p.minStockThreshold);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Cost Price', 'Total Valuation', 'Status'];
    const rows = products.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.quantity,
      p.costPrice,
      (p.quantity * p.costPrice).toFixed(2),
      p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.minStockThreshold ? 'Low Stock' : 'In Stock',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `valuation_audit_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Report Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Inventory Valuation & Audit Report</h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Snapshot as of {new Date().toLocaleDateString()} • Generated for Warehouse Accounting
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold shadow-sm"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Sheet</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total On-Hand Capital</span>
          <p className="text-xl font-bold text-emerald-400 font-mono mt-0.5">
            ${(summary.totalValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Total Physical Units</span>
          <p className="text-xl font-bold text-white font-mono mt-0.5">
            {(summary.totalStockUnits || 0).toLocaleString()} units
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Active SKUs</span>
          <p className="text-xl font-bold text-indigo-400 font-mono mt-0.5">
            {summary.totalProducts || 0} items
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Reorder Items Flagged</span>
          <p className="text-xl font-bold text-amber-400 font-mono mt-0.5">
            {reorderList.length} items
          </p>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h4 className="text-sm font-bold text-white">Segment Valuation Distribution</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2.5 px-3">Category Name</th>
                <th className="py-2.5 px-3 text-right">SKU Count</th>
                <th className="py-2.5 px-3 text-right">Physical Units</th>
                <th className="py-2.5 px-3 text-right">Capital Valuation</th>
                <th className="py-2.5 px-3 text-right">% of Inventory</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {Object.entries(categoryBreakdown).map(([name, cat]) => {
                const pct = summary.totalValuation > 0 ? ((cat.valuation / summary.totalValuation) * 100).toFixed(1) : 0;
                return (
                  <tr key={name} className="hover:bg-slate-800/40">
                    <td className="py-2.5 px-3 font-semibold text-slate-200">{name}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-400">{cat.count}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-300">{cat.totalQty}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-semibold">
                      ${cat.valuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-indigo-400">{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Value Inventory Assets */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4">
        <h4 className="text-sm font-bold text-white">Top Capital-Intensive Stock Assets</h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/60 text-[10px] uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-2.5 px-3">SKU</th>
                <th className="py-2.5 px-3">Item Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3 text-right">On-Hand Qty</th>
                <th className="py-2.5 px-3 text-right">Unit Cost</th>
                <th className="py-2.5 px-3 text-right">Total Valuation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedByValuation.slice(0, 8).map((p) => (
                <tr key={p._id} className="hover:bg-slate-800/40">
                  <td className="py-2.5 px-3 font-mono text-indigo-400 font-bold">{p.sku}</td>
                  <td className="py-2.5 px-3 text-slate-200">{p.name}</td>
                  <td className="py-2.5 px-3 text-slate-400">{p.category}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-white">
                    {p.quantity} {p.unit}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-slate-400">${p.costPrice.toFixed(2)}</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-400 font-bold">
                    ${(p.quantity * p.costPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
