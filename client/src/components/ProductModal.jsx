import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Sparkles, AlertCircle } from 'lucide-react';
import { createProduct, updateProduct } from '../services/api';

export default function ProductModal({
  isOpen,
  onClose,
  product = null, // null for create, object for edit
  categories = [],
  suppliers = [],
  onSuccess,
}) {
  const [formData, setFormData] = useState({
    sku: '',
    barcode: '',
    name: '',
    category: '',
    description: '',
    costPrice: '',
    sellingPrice: '',
    quantity: '',
    minStockThreshold: '10',
    unit: 'pcs',
    warehouseLocation: 'Main Warehouse - Aisle 1',
    supplier: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        sku: product.sku || '',
        barcode: product.barcode || '',
        name: product.name || '',
        category: product.category || (categories[0]?.name || 'Electronics'),
        description: product.description || '',
        costPrice: product.costPrice !== undefined ? product.costPrice : '',
        sellingPrice: product.sellingPrice !== undefined ? product.sellingPrice : '',
        quantity: product.quantity !== undefined ? product.quantity : '',
        minStockThreshold: product.minStockThreshold !== undefined ? product.minStockThreshold : '10',
        unit: product.unit || 'pcs',
        warehouseLocation: product.warehouseLocation || 'Main Warehouse - Aisle 1',
        supplier: product.supplier || (suppliers[0]?.name || 'General Supplier'),
      });
    } else {
      setFormData({
        sku: `SKU-${Math.floor(100000 + Math.random() * 900000)}`,
        barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
        name: '',
        category: categories[0]?.name || 'Electronics',
        description: '',
        costPrice: '',
        sellingPrice: '',
        quantity: '0',
        minStockThreshold: '10',
        unit: 'pcs',
        warehouseLocation: 'Main Warehouse - Aisle 1',
        supplier: suppliers[0]?.name || 'General Supplier',
      });
    }
  }, [product, isOpen, categories, suppliers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleGenerateSKU = () => {
    const prefix = formData.category ? formData.category.slice(0, 3).toUpperCase() : 'ITM';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({
      ...prev,
      sku: `${prefix}-${rand}`,
      barcode: `890${Math.floor(100000000 + Math.random() * 900000000)}`,
    }));
  };

  const cost = Number(formData.costPrice) || 0;
  const selling = Number(formData.sellingPrice) || 0;
  const margin = selling > 0 ? (((selling - cost) / selling) * 100).toFixed(1) : 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Product Name is required');
      return;
    }
    if (!formData.sku.trim()) {
      setError('SKU is required');
      return;
    }

    try {
      setLoading(true);
      if (product) {
        await updateProduct(product._id, formData);
      } else {
        await createProduct(formData);
      }
      onSuccess && onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/95 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <PackagePlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                {product ? 'Edit Product' : 'Add New Inventory Item'}
              </h3>
              <p className="text-xs text-slate-400">
                {product ? `Update specs for ${product.sku}` : 'Fill in the catalog details and initial stock level'}
              </p>
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

          {/* SKU & Barcode with auto-generate button */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  SKU (Stock Keeping Unit) *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateSKU}
                  className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" /> Auto
                </button>
              </div>
              <input
                type="text"
                name="sku"
                required
                value={formData.sku}
                onChange={handleChange}
                placeholder="e.g. ELEC-9041"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Barcode / EAN (Optional)
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                placeholder="e.g. 890123456789"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Cordless Impact Drill 18V"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {categories.length > 0 ? (
                  categories.map((c) => (
                    <option key={c._id || c.name} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Electronics">Electronics</option>
                    <option value="Office Supplies">Office Supplies</option>
                    <option value="Hardware & Tools">Hardware & Tools</option>
                    <option value="Packaging & Shipping">Packaging & Shipping</option>
                    <option value="Raw Materials">Raw Materials</option>
                  </>
                )}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Description / Specifications
            </label>
            <textarea
              name="description"
              rows={2}
              value={formData.description}
              onChange={handleChange}
              placeholder="Key technical details, dimensions, specs, package contents..."
              className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            ></textarea>
          </div>

          {/* Pricing & Profit Margin Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-800/40 border border-slate-800">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Cost Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="costPrice"
                required
                value={formData.costPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Selling Price ($) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="sellingPrice"
                required
                value={formData.sellingPrice}
                onChange={handleChange}
                placeholder="0.00"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white font-mono"
              />
            </div>

            <div className="flex flex-col justify-center">
              <span className="text-[11px] text-slate-400">Projected Margin</span>
              <div className="flex items-baseline gap-2 mt-0.5">
                <span className={`text-base font-bold ${Number(margin) >= 30 ? 'text-emerald-400' : Number(margin) > 0 ? 'text-amber-400' : 'text-rose-400'}`}>
                  {margin}%
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  +${(selling - cost > 0 ? (selling - cost).toFixed(2) : '0.00')}/ea
                </span>
              </div>
            </div>
          </div>

          {/* Stock, Threshold, and Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                {product ? 'Current Quantity' : 'Initial Stock'} *
              </label>
              <input
                type="number"
                min="0"
                name="quantity"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Min Stock Alert Level
              </label>
              <input
                type="number"
                min="0"
                name="minStockThreshold"
                value={formData.minStockThreshold}
                onChange={handleChange}
                placeholder="10"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Unit of Measure
              </label>
              <select
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="pcs">Pieces (pcs)</option>
                <option value="boxes">Boxes</option>
                <option value="bundles">Bundles</option>
                <option value="rolls">Rolls</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="meters">Meters (m)</option>
                <option value="bars">Bars</option>
              </select>
            </div>
          </div>

          {/* Location and Supplier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Warehouse Location / Bin
              </label>
              <input
                type="text"
                name="warehouseLocation"
                value={formData.warehouseLocation}
                onChange={handleChange}
                placeholder="e.g. Zone B - Rack 4 - Bin 12"
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Default Supplier
              </label>
              <select
                name="supplier"
                value={formData.supplier}
                onChange={handleChange}
                className="w-full bg-slate-800/80 border border-slate-700 rounded-xl px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {suppliers.length > 0 ? (
                  suppliers.map((s) => (
                    <option key={s._id || s.name} value={s.name}>
                      {s.name}
                    </option>
                  ))
                ) : (
                  <option value="General Supplier">General Supplier</option>
                )}
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
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
              {loading ? 'Saving...' : product ? 'Update Product' : 'Create Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
