import React, { useState } from 'react';
import { Truck, Plus, Mail, Phone, MapPin, Edit2, Trash2, Tag } from 'lucide-react';
import { deleteSupplier } from '../services/api';

export default function Suppliers({ suppliers = [], loading, onRefresh, onOpenSupplierModal, onEditSupplier }) {
  const [search, setSearch] = useState('');

  const filtered = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.contactPerson && s.contactPerson.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
  );

  const handleDelete = async (id, name) => {
    if (window.confirm(`Delete supplier "${name}"?`)) {
      try {
        await deleteSupplier(id);
        onRefresh();
      } catch (err) {
        alert(err.message || 'Failed to delete supplier');
      }
    }
  };

  return (
    <div className="space-y-5">
      {/* Header and Control */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Vendor & Supplier Directory</h3>
          <p className="text-xs text-slate-400">Manage supply partners, procurement contacts, and product categories</p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search suppliers..."
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={() => onOpenSupplierModal()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Supplier</span>
          </button>
        </div>
      </div>

      {/* Supplier Cards Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs">Loading suppliers...</span>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
          No suppliers found. Click "Add Supplier" to add one.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {filtered.map((s) => (
            <div
              key={s._id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between hover:border-slate-700 transition-all"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{s.name}</h4>
                      {s.contactPerson && (
                        <p className="text-xs text-slate-400 font-medium">Attn: {s.contactPerson}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditSupplier(s)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(s._id, s.name)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 mt-4">
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-500" />
                      <a href={`mailto:${s.email}`} className="text-indigo-400 hover:underline">
                        {s.email}
                      </a>
                    </div>
                  )}

                  {s.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-500" />
                      <span>{s.phone}</span>
                    </div>
                  )}

                  {s.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span className="text-slate-400">{s.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {s.categories && s.categories.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap gap-1.5">
                  {s.categories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-slate-800 text-[10px] font-semibold text-slate-300 border border-slate-700"
                    >
                      {cat}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
