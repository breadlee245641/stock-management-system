import React, { useState } from 'react';
import { X, ClipboardList, Plus, Trash2, AlertCircle } from 'lucide-react';
import { createPurchaseOrder } from '../services/api';

export default function PurchaseOrderModal({ isOpen, onClose, products = [], suppliers = [], onSuccess }) {
  const [supplier, setSupplier] = useState(suppliers[0]?.name || 'Apex Micro Electronics');
  const [expectedDelivery, setExpectedDelivery] = useState('');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState([
    {
      productId: products[0]?._id || '',
      sku: products[0]?.sku || '',
      name: products[0]?.name || '',
      quantity: 10,
      unitCost: products[0]?.costPrice || 0,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddItem = () => {
    const firstProduct = products[0];
    if (firstProduct) {
      setItems((prev) => [
        ...prev,
        {
          productId: firstProduct._id,
          sku: firstProduct.sku,
          name: firstProduct.name,
          quantity: 10,
          unitCost: firstProduct.costPrice,
        },
      ]);
    }
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleProductChange = (index, prodId) => {
    const selected = products.find((p) => p._id === prodId);
    if (!selected) return;
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        productId: selected._id,
        sku: selected.sku,
        name: selected.name,
        unitCost: selected.costPrice,
      };
      return updated;
    });
  };

  const handleItemFieldChange = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        [field]: Number(value) || 0,
      };
      return updated;
    });
  };

  const calculatedTotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Add at least one item to the purchase order');
      return;
    }

    try {
      setLoading(true);
      await createPurchaseOrder({
        supplier,
        expectedDelivery: expectedDelivery ? new Date(expectedDelivery) : undefined,
        notes,
        items: items.map((i) => ({
          ...i,
          total: i.quantity * i.unitCost,
        })),
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error creating purchase order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 sticky top-0 z-10 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Create Purchase Order (PO)</h3>
              <p className="text-xs text-slate-400">Order stock replenishment from registered suppliers</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Vendor / Supplier *
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {suppliers.length > 0 ? (
                  suppliers.map((s) => (
                    <option key={s._id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value="Apex Micro Electronics">Apex Micro Electronics</option>
                )}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Expected Delivery Date
              </label>
              <input
                type="date"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Line Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Order Line Items
              </label>
              <button
                type="button"
                onClick={handleAddItem}
                className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
              >
                <Plus className="w-3.5 h-3.5" /> Add Another Item
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-800/40 border border-slate-800 text-xs"
                >
                  <div className="flex-1">
                    <select
                      value={item.productId}
                      onChange={(e) => handleProductChange(idx, e.target.value)}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                    >
                      {products.map((p) => (
                        <option key={p._id} value={p._id}>
                          [{p.sku}] {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-20">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleItemFieldChange(idx, 'quantity', e.target.value)}
                      placeholder="Qty"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-center font-mono"
                    />
                  </div>

                  <div className="w-24">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={item.unitCost}
                      onChange={(e) => handleItemFieldChange(idx, 'unitCost', e.target.value)}
                      placeholder="Cost"
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2 py-1.5 text-white text-right font-mono"
                    />
                  </div>

                  <div className="w-24 text-right font-semibold text-emerald-400 font-mono">
                    ${(item.quantity * item.unitCost).toFixed(2)}
                  </div>

                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 rounded text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total Summary */}
          <div className="flex justify-between items-center p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Order Cost:</span>
            <span className="text-lg font-bold text-emerald-400 font-mono">
              ${calculatedTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Order Notes / Terms
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment terms, shipping instructions, contact person..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
            >
              {loading ? 'Creating PO...' : 'Issue Purchase Order'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
