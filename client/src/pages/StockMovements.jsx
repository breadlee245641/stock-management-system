import React, { useState, useEffect } from 'react';
import {
  ArrowDownRight,
  ArrowUpRight,
  SlidersHorizontal,
  Search,
  Filter,
  Plus,
  Calendar,
  Layers,
  ArrowLeftRight,
} from 'lucide-react';
import { getStockTransactions } from '../services/api';

export default function StockMovements({ onOpenMovementModal }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('All');
  const [search, setSearch] = useState('');

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const res = await getStockTransactions({ type: selectedType !== 'All' ? selectedType : undefined });
      setTransactions(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [selectedType]);

  const filteredTransactions = transactions.filter((t) => {
    return (
      t.productName.toLowerCase().includes(search.toLowerCase()) ||
      t.productSku.toLowerCase().includes(search.toLowerCase()) ||
      (t.referenceNumber && t.referenceNumber.toLowerCase().includes(search.toLowerCase())) ||
      (t.reason && t.reason.toLowerCase().includes(search.toLowerCase()))
    );
  });

  const totalIn = transactions.filter((t) => t.type === 'IN').reduce((acc, t) => acc + t.quantity, 0);
  const totalOut = transactions.filter((t) => t.type === 'OUT').reduce((acc, t) => acc + t.quantity, 0);

  return (
    <div className="space-y-5">
      {/* Metrics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Inbound Units</span>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">+{totalIn}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Outbound Units</span>
            <p className="text-xl font-bold text-rose-400 mt-1 font-mono">-{totalOut}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">Net Stock Delta</span>
            <p className={`text-xl font-bold mt-1 font-mono ${totalIn - totalOut >= 0 ? 'text-indigo-400' : 'text-amber-400'}`}>
              {totalIn - totalOut >= 0 ? `+${totalIn - totalOut}` : totalIn - totalOut}
            </p>
          </div>
          <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {['All', 'IN', 'OUT', 'ADJUSTMENT'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedType === type
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {type === 'All' ? 'All Movements' : type === 'IN' ? 'Inbound (IN)' : type === 'OUT' ? 'Outbound (OUT)' : 'Adjustments'}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[220px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ref #, SKU, reason..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button
            onClick={onOpenMovementModal}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Record Movement</span>
          </button>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold select-none">
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Reference #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Item & SKU</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-center">Stock Shift</th>
                <th className="py-3 px-4">Reason / Counterparty</th>
                <th className="py-3 px-4">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-16 text-slate-500">
                    No movement records found.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-800/40 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-4 text-slate-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(tx.createdAt).toLocaleDateString()} {new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </td>

                    {/* Reference */}
                    <td className="py-3 px-4 font-mono font-bold text-slate-300">
                      {tx.referenceNumber}
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-4">
                      {tx.type === 'IN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <ArrowDownRight className="w-3 h-3" /> Inbound
                        </span>
                      ) : tx.type === 'OUT' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <ArrowUpRight className="w-3 h-3" /> Outbound
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <SlidersHorizontal className="w-3 h-3" /> Audit Adjust
                        </span>
                      )}
                    </td>

                    {/* Product Name & SKU */}
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200 block">{tx.productName}</span>
                      <span className="text-[10px] font-mono text-indigo-400">{tx.productSku}</span>
                    </td>

                    {/* Quantity */}
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={
                          tx.type === 'IN'
                            ? 'text-emerald-400'
                            : tx.type === 'OUT'
                            ? 'text-rose-400'
                            : 'text-amber-400'
                        }
                      >
                        {tx.type === 'IN' ? '+' : tx.type === 'OUT' ? '-' : '±'}
                        {tx.quantity}
                      </span>
                    </td>

                    {/* Stock Shift (Previous -> New) */}
                    <td className="py-3 px-4 text-center font-mono text-slate-400 text-[11px]">
                      <span>{tx.previousQuantity}</span>
                      <span className="mx-1.5 text-slate-600">→</span>
                      <span className="font-bold text-slate-200">{tx.newQuantity}</span>
                    </td>

                    {/* Reason / Notes */}
                    <td className="py-3 px-4 text-slate-300">
                      <div>
                        <span className="font-medium text-slate-200">{tx.reason}</span>
                        {tx.destinationOrSource && (
                          <span className="text-slate-500 text-[11px] block">{tx.destinationOrSource}</span>
                        )}
                        {tx.notes && (
                          <span className="text-slate-400 text-[10px] italic block">{tx.notes}</span>
                        )}
                      </div>
                    </td>

                    {/* Performed By */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {tx.performedBy || 'System Admin'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
