import React, { useState, useEffect } from 'react';
import { X, ArrowDownRight, ArrowUpRight, SlidersHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { recordStockMovement } from '../services/api';

export default function StockMovementModal({ isOpen, onClose, products = [], defaultProduct = null, onSuccess }) {
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState('IN'); // 'IN', 'OUT', 'ADJUSTMENT'
  const [quantity, setQuantity] = useState('');
  const [adjustmentTarget, setAdjustmentTarget] = useState('');
  const [reason, setReason] = useState('Stock Restock');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [destinationOrSource, setDestinationOrSource] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (defaultProduct) {
      setSelectedProductId(defaultProduct._id);
    } else if (products.length > 0 && !selectedProductId) {
      setSelectedProductId(products[0]._id);
    }
  }, [defaultProduct, products, isOpen]);

  useEffect(() => {
    if (movementType === 'IN') {
      setReason('Supplier Restock / Purchase');
    } else if (movementType === 'OUT') {
      setReason('Customer Sale Dispatch');
    } else if (movementType === 'ADJUSTMENT') {
      setReason('Physical Inventory Audit Discrepancy');
    }
  }, [movementType]);

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p._id === selectedProductId);
  const currentStock = currentProduct ? currentProduct.quantity : 0;
  const unit = currentProduct ? currentProduct.unit : 'pcs';

  let projectedStock = currentStock;
  if (movementType === 'IN' && Number(quantity) > 0) {
    projectedStock = currentStock + Number(quantity);
  } else if (movementType === 'OUT' && Number(quantity) > 0) {
    projectedStock = currentStock - Number(quantity);
  } else if (movementType === 'ADJUSTMENT' && adjustmentTarget !== '') {
    projectedStock = Number(adjustmentTarget);
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!selectedProductId) {
      setError('Please select an item');
      return;
    }

    if (movementType === 'ADJUSTMENT') {
      if (adjustmentTarget === '' || Number(adjustmentTarget) < 0) {
        setError('Please enter a valid target count (>= 0)');
        return;
      }
    } else {
      if (!quantity || Number(quantity) <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }
      if (movementType === 'OUT' && Number(quantity) > currentStock) {
        setError(`Insufficient stock! Cannot dispatch ${quantity} ${unit} (Current on-hand: ${currentStock} ${unit})`);
        return;
      }
    }

    try {
      setLoading(true);
      await recordStockMovement({
        productId: selectedProductId,
        type: movementType,
        quantity: movementType === 'ADJUSTMENT' ? Math.abs(Number(adjustmentTarget) - currentStock) : Number(quantity),
        newTotalQuantity: movementType === 'ADJUSTMENT' ? Number(adjustmentTarget) : undefined,
        referenceNumber: referenceNumber || undefined,
        reason,
        destinationOrSource,
        notes,
      });

      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to record movement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Record Stock Movement</h3>
              <p className="text-xs text-slate-400">Track inbound, outbound, or audit corrections</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Movement Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Transaction Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMovementType('IN')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  movementType === 'IN'
                    ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-sm shadow-emerald-500/20'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                }`}
              >
                <ArrowDownRight className="w-4 h-4" />
                <span>Stock IN</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('OUT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  movementType === 'OUT'
                    ? 'bg-rose-500/15 border-rose-500 text-rose-400 shadow-sm shadow-rose-500/20'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                }`}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Stock OUT</span>
              </button>

              <button
                type="button"
                onClick={() => setMovementType('ADJUSTMENT')}
                className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  movementType === 'ADJUSTMENT'
                    ? 'bg-amber-500/15 border-amber-500 text-amber-400 shadow-sm shadow-amber-500/20'
                    : 'bg-slate-800/60 border-slate-700/80 text-slate-400 hover:border-slate-600'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span>Adjustment</span>
              </button>
            </div>
          </div>

          {/* Product Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Select Product
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {products.map((p) => (
                <option key={p._id} value={p._id}>
                  [{p.sku}] {p.name} (Current: {p.quantity} {p.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity and Preview */}
          <div className="grid grid-cols-2 gap-3">
            {movementType === 'ADJUSTMENT' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Actual Physical Count ({unit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={adjustmentTarget}
                  onChange={(e) => setAdjustmentTarget(e.target.value)}
                  placeholder="e.g. 45"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Quantity ({unit})
                </label>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g. 10"
                  className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            )}

            <div className="bg-slate-800/40 border border-slate-800 rounded-xl p-2.5 flex flex-col justify-center">
              <span className="text-[11px] text-slate-400">Stock Result Preview</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className="text-slate-400 line-through text-xs">{currentStock}</span>
                <span className="text-slate-500">→</span>
                <span
                  className={`text-base font-bold ${
                    projectedStock < 0
                      ? 'text-rose-500'
                      : projectedStock <= (currentProduct?.minStockThreshold || 10)
                      ? 'text-amber-400'
                      : 'text-emerald-400'
                  }`}
                >
                  {projectedStock} {unit}
                </span>
              </div>
            </div>
          </div>

          {/* Reference & Reason */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Reason / Category
              </label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Source / Recipient
              </label>
              <input
                type="text"
                value={destinationOrSource}
                onChange={(e) => setDestinationOrSource(e.target.value)}
                placeholder={movementType === 'IN' ? 'Supplier Name' : 'Customer / Department'}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Reference / PO # (Optional)
            </label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              placeholder="e.g. PO-8901 or INV-4421"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Inspection remarks, carrier info, reason details..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Actions */}
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
              {loading ? 'Processing...' : 'Confirm Movement'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
