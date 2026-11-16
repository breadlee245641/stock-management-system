import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Edit2,
  Trash2,
  Download,
  Barcode,
  Package,
  Layers,
  ArrowUpDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
} from 'lucide-react';
import { deleteProduct } from '../services/api';

export default function Inventory({
  products = [],
  categories = [],
  loading,
  onRefresh,
  onOpenProductModal,
  onEditProduct,
  onOpenMovementModal,
  onSelectProductForMovement,
}) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Filter & Search
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.includes(search)) ||
      (p.warehouseLocation && p.warehouseLocation.toLowerCase().includes(search.toLowerCase()));

    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;

    let matchesStatus = true;
    if (selectedStatus === 'In Stock') {
      matchesStatus = p.quantity > p.minStockThreshold;
    } else if (selectedStatus === 'Low Stock') {
      matchesStatus = p.quantity > 0 && p.quantity <= p.minStockThreshold;
    } else if (selectedStatus === 'Out of Stock') {
      matchesStatus = p.quantity === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort
  filteredProducts.sort((a, b) => {
    let valA = a[sortBy];
    let valB = b[sortBy];
    if (typeof valA === 'string') valA = valA.toLowerCase();
    if (typeof valB === 'string') valB = valB.toLowerCase();

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to permanently delete "${name}" from inventory?`)) {
      try {
        await deleteProduct(id);
        onRefresh();
      } catch (err) {
        alert(err.message || 'Failed to delete product');
      }
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    const headers = ['SKU', 'Name', 'Category', 'Quantity', 'Unit', 'Threshold', 'Cost Price', 'Selling Price', 'Valuation', 'Location', 'Supplier', 'Status'];
    const rows = filteredProducts.map((p) => [
      p.sku,
      `"${p.name.replace(/"/g, '""')}"`,
      p.category,
      p.quantity,
      p.unit,
      p.minStockThreshold,
      p.costPrice,
      p.sellingPrice,
      (p.quantity * p.costPrice).toFixed(2),
      `"${p.warehouseLocation}"`,
      `"${p.supplier}"`,
      p.quantity === 0 ? 'Out of Stock' : p.quantity <= p.minStockThreshold ? 'Low Stock' : 'In Stock',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `inventory_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-5">
      {/* Filters & Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative min-w-[240px] flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by name, SKU, barcode, bin..."
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c._id || c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stock Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="All">All Statuses</option>
              <option value="In Stock">In Stock (Healthy)</option>
              <option value="Low Stock">Low Stock Alert</option>
              <option value="Out of Stock">Out of Stock (Depleted)</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            title="Download CSV Spreadsheet"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:border-slate-600 text-xs font-semibold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => onOpenProductModal()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50 text-[11px] uppercase tracking-wider text-slate-400 font-semibold select-none">
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('sku')}>
                  <div className="flex items-center gap-1">
                    <span>SKU / Barcode</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-1">
                    <span>Product Name</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white" onClick={() => handleSort('category')}>
                  <div className="flex items-center gap-1">
                    <span>Category</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 cursor-pointer hover:text-white text-right" onClick={() => handleSort('quantity')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Stock Level</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('costPrice')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Unit Cost</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4 text-right cursor-pointer hover:text-white" onClick={() => handleSort('sellingPrice')}>
                  <div className="flex items-center justify-end gap-1">
                    <span>Retail</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </div>
                </th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4 text-right">Quick Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-slate-500">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading products...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-16 text-slate-500">
                    <Package className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                    <span>No products found matching the criteria.</span>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const isOut = p.quantity === 0;
                  const isLow = !isOut && p.quantity <= p.minStockThreshold;

                  return (
                    <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* SKU / Barcode */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-indigo-400 block">{p.sku}</span>
                        {p.barcode && (
                          <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                            <Barcode className="w-3 h-3 shrink-0" /> {p.barcode}
                          </span>
                        )}
                      </td>

                      {/* Name & Desc */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-semibold text-slate-100 block">{p.name}</span>
                        {p.description && (
                          <span className="text-[11px] text-slate-400 truncate block mt-0.5">
                            {p.description}
                          </span>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/80 font-medium text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Stock Level with Gauge */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex flex-col items-end">
                          <span
                            className={`font-mono font-bold text-sm ${
                              isOut ? 'text-rose-400' : isLow ? 'text-amber-400' : 'text-emerald-400'
                            }`}
                          >
                            {p.quantity} <span className="text-xs font-normal text-slate-400">{p.unit}</span>
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            Min: {p.minStockThreshold} {p.unit}
                          </span>
                        </div>
                      </td>

                      {/* Cost */}
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        ${p.costPrice.toFixed(2)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-emerald-400 font-semibold">
                        ${p.sellingPrice.toFixed(2)}
                      </td>

                      {/* Warehouse Location */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        <span>{p.warehouseLocation}</span>
                        <span className="block text-slate-500 text-[10px] truncate max-w-[140px] mt-0.5">
                          {p.supplier}
                        </span>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <XCircle className="w-3 h-3" /> Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <AlertTriangle className="w-3 h-3" /> Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" /> In Stock
                          </span>
                        )}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Inbound/Outbound modal trigger */}
                          <button
                            onClick={() => onSelectProductForMovement(p)}
                            title="Record Movement (IN / OUT)"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 border border-indigo-500/20 transition-colors"
                          >
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          </button>

                          {/* Edit Item */}
                          <button
                            onClick={() => onEditProduct(p)}
                            title="Edit Product"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete Item */}
                          <button
                            onClick={() => handleDelete(p._id, p.name)}
                            title="Delete Product"
                            className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer Summary */}
        <div className="px-6 py-3.5 bg-slate-950/60 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-2">
          <span>
            Showing <strong className="text-white">{filteredProducts.length}</strong> of{' '}
            <strong className="text-white">{products.length}</strong> items
          </span>
          <div className="flex items-center gap-4">
            <span>
              Total Units Displayed:{' '}
              <strong className="text-white font-mono">
                {filteredProducts.reduce((acc, p) => acc + p.quantity, 0)}
              </strong>
            </span>
            <span>
              Valuation:{' '}
              <strong className="text-emerald-400 font-mono">
                ${filteredProducts
                  .reduce((acc, p) => acc + p.quantity * p.costPrice, 0)
                  .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
