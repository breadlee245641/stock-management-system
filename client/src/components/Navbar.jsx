import React from 'react';
import { Plus, ArrowLeftRight, RotateCcw, Search, Sparkles } from 'lucide-react';

export default function Navbar({
  onOpenMovementModal,
  onOpenProductModal,
  onReseed,
  searchQuery,
  setSearchQuery,
  activeTabTitle,
}) {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-bold text-white capitalize">{activeTabTitle}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Quick Search */}
        <div className="relative hidden md:block w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Quick search SKU, item, bin..."
            className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        {/* Reseed Demo Button */}
        <button
          onClick={onReseed}
          title="Reload fresh sample dataset"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 text-slate-300 hover:text-white hover:border-slate-600 text-xs font-semibold transition-all shadow-sm"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        {/* Record Movement Button */}
        <button
          onClick={onOpenMovementModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 hover:bg-indigo-500/20 text-xs font-semibold transition-all shadow-sm"
        >
          <ArrowLeftRight className="w-3.5 h-3.5" />
          <span>Stock IN/OUT</span>
        </button>

        {/* Add Product Button */}
        <button
          onClick={onOpenProductModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Product</span>
        </button>
      </div>
    </header>
  );
}
