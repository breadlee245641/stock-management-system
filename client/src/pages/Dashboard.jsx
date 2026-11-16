import React from 'react';
import {
  Boxes,
  DollarSign,
  AlertTriangle,
  XCircle,
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  Clock,
  PlusCircle,
} from 'lucide-react';
import StatCard from '../components/StatCard';
import { StockStatusDonut, CategoryValuationBarChart } from '../components/Charts';

export default function Dashboard({
  stats = {},
  loading,
  onOpenMovementModal,
  onOpenProductModal,
  onOpenPOModal,
  onSelectProductForRestock,
  setActiveTab,
}) {
  const summary = stats.summary || {};
  const recentTransactions = stats.recentTransactions || [];
  const lowStockAlerts = stats.lowStockAlerts || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-400">Loading stock metrics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-gradient-to-r from-indigo-950/60 via-slate-900 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Inventory Overview & Real-Time Telemetry</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Live monitoring of stock valuation, warehouse distribution, reorder thresholds, and material movements across all facilities.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={onOpenMovementModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-600/30 text-xs font-semibold transition-all shadow-sm"
          >
            <ArrowDownRight className="w-4 h-4" />
            <span>Stock Inbound</span>
          </button>
          <button
            onClick={onOpenPOModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-all shadow-lg shadow-indigo-600/30"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Purchase Order</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Products (SKUs)"
          value={summary.totalProducts || 0}
          subtitle={`${summary.totalStockUnits || 0} total units in stock`}
          icon={Boxes}
          color="indigo"
          badge="Catalog"
        />

        <StatCard
          title="Total Stock Valuation"
          value={`$${(summary.totalValuation || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtitle="At supplier purchase cost"
          icon={DollarSign}
          color="emerald"
          badge="Cost Basis"
        />

        <StatCard
          title="Low Stock Alerts"
          value={summary.lowStockCount || 0}
          subtitle="Items below safety reorder threshold"
          icon={AlertTriangle}
          color="amber"
          badge="Action Needed"
        />

        <StatCard
          title="Out of Stock Items"
          value={summary.outOfStockCount || 0}
          subtitle="Zero on-hand inventory"
          icon={XCircle}
          color="rose"
          badge="Critical"
        />
      </div>

      {/* Secondary Financial & Profitability Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Estimated Retail Value</span>
            <p className="text-xl font-bold text-white mt-0.5">
              ${(summary.totalPotentialRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Projected Gross Profit</span>
            <p className="text-xl font-bold text-emerald-400 mt-0.5">
              ${(summary.potentialProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-medium">Average Markup / Margin</span>
            <p className="text-xl font-bold text-indigo-400 mt-0.5">
              {summary.totalValuation > 0
                ? `${Math.round(((summary.totalPotentialRevenue - summary.totalValuation) / summary.totalValuation) * 100)}%`
                : '0%'}
            </p>
          </div>
          <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Boxes className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Visual Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Health Donut */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Stock Level Health</h3>
              <p className="text-xs text-slate-400">Inventory breakdown by availability state</p>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              View All
            </button>
          </div>
          <StockStatusDonut
            inStock={summary.inStockCount || 0}
            lowStock={summary.lowStockCount || 0}
            outOfStock={summary.outOfStockCount || 0}
          />
        </div>

        {/* Category Valuation Bar Chart */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Valuation by Category</h3>
              <p className="text-xs text-slate-400">Capital distribution across inventory segments</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Detailed Report
            </button>
          </div>
          <CategoryValuationBarChart categories={stats.categoryBreakdown || {}} />
        </div>
      </div>

      {/* Critical Restock Alerts & Recent Transactions Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white">Urgent Restock Triggers</h3>
              </div>
              <span className="text-xs font-semibold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                {lowStockAlerts.length} Attention
              </span>
            </div>

            <div className="divide-y divide-slate-800/80 mt-2 max-h-80 overflow-y-auto">
              {lowStockAlerts.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  All inventory items are currently above safe threshold limits.
                </div>
              ) : (
                lowStockAlerts.map((item) => (
                  <div key={item._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-indigo-400 font-medium">{item.sku}</span>
                        <span className="font-semibold text-slate-200 truncate">{item.name}</span>
                      </div>
                      <p className="text-[11px] text-slate-400">
                        {item.warehouseLocation} • {item.supplier}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span
                          className={`font-bold font-mono ${
                            item.quantity === 0 ? 'text-rose-400' : 'text-amber-400'
                          }`}
                        >
                          {item.quantity} / {item.minStockThreshold} {item.unit}
                        </span>
                        <p className="text-[10px] text-slate-500">
                          {item.quantity === 0 ? 'Depleted' : 'Low stock'}
                        </p>
                      </div>

                      <button
                        onClick={() => onSelectProductForRestock(item)}
                        className="px-2.5 py-1 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/40 border border-indigo-500/30 font-semibold text-[11px] transition-all"
                      >
                        Restock
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Recent Transactions Activity */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">Recent Movements Log</h3>
              </div>
              <button
                onClick={() => setActiveTab('movements')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View Audit Trail
              </button>
            </div>

            <div className="divide-y divide-slate-800/80 mt-2 max-h-80 overflow-y-auto">
              {recentTransactions.length === 0 ? (
                <div className="text-center py-10 text-slate-500 text-xs">
                  No stock movements recorded yet.
                </div>
              ) : (
                recentTransactions.map((tx) => (
                  <div key={tx._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 ${
                          tx.type === 'IN'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : tx.type === 'OUT'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {tx.type === 'IN' ? (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        ) : tx.type === 'OUT' ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        )}
                      </div>

                      <div className="space-y-0.5 truncate">
                        <div className="flex items-center gap-1.5">
                          <span className="font-semibold text-slate-200 truncate">{tx.productName}</span>
                          <span className="font-mono text-[10px] text-slate-400">[{tx.productSku}]</span>
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {tx.reason} {tx.destinationOrSource ? `• ${tx.destinationOrSource}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-bold font-mono ${
                          tx.type === 'IN'
                            ? 'text-emerald-400'
                            : tx.type === 'OUT'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }`}
                      >
                        {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : '±'}
                        {tx.quantity}
                      </span>
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
