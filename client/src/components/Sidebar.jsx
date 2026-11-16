import React from 'react';
import {
  LayoutDashboard,
  Boxes,
  ArrowLeftRight,
  ClipboardList,
  Truck,
  FileSpreadsheet,
  AlertTriangle,
  Database,
  Layers,
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, lowStockCount = 0 }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory Items', icon: Boxes },
    { id: 'movements', label: 'Stock Movements', icon: ArrowLeftRight },
    { id: 'orders', label: 'Purchase Orders', icon: ClipboardList },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'reports', label: 'Valuation & Reports', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-600/30">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-white text-base tracking-tight">StockMaster</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">MERN Inventory Suite</p>
          </div>
        </div>

        {/* Low Stock Warning Pill */}
        {lowStockCount > 0 && (
          <div className="mx-4 mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-amber-300">{lowStockCount} items low in stock</p>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-amber-400/80 hover:text-amber-300 text-[11px] underline underline-offset-2"
              >
                Review alerts
              </button>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.id === 'inventory' && lowStockCount > 0 && (
                  <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950">
                    {lowStockCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-medium text-slate-300">MongoDB Active</span>
          </div>
          <span className="text-[10px] font-mono text-slate-500">:27017</span>
        </div>
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span>Express Backend</span>
          <span className="font-mono text-emerald-400">:5000</span>
        </div>
      </div>
    </aside>
  );
}
