import React, { useState, useEffect } from 'react';
import {
  ClipboardList,
  Plus,
  CheckCircle2,
  Clock,
  Truck,
  Trash2,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';
import { getPurchaseOrders, updateOrderStatus, deletePurchaseOrder } from '../services/api';

export default function PurchaseOrders({ onOpenPOModal, onRefreshInventory }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getPurchaseOrders();
      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await updateOrderStatus(id, newStatus);
      fetchOrders();
      if (newStatus === 'Received') {
        onRefreshInventory && onRefreshInventory();
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleDelete = async (id, orderNumber) => {
    if (window.confirm(`Delete purchase order ${orderNumber}?`)) {
      try {
        await deletePurchaseOrder(id);
        fetchOrders();
      } catch (err) {
        alert(err.message || 'Failed to delete order');
      }
    }
  };

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const pendingCount = orders.filter((o) => o.status === 'Pending').length;
  const orderedCount = orders.filter((o) => o.status === 'Ordered').length;
  const receivedCount = orders.filter((o) => o.status === 'Received').length;

  return (
    <div className="space-y-5">
      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">Draft / Pending POs</span>
            <p className="text-xl font-bold text-amber-400 mt-1 font-mono">{pendingCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">In Transit / Ordered</span>
            <p className="text-xl font-bold text-blue-400 mt-1 font-mono">{orderedCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-lg">
          <div>
            <span className="text-xs text-slate-400 font-medium">Received & Stocked</span>
            <p className="text-xl font-bold text-emerald-400 mt-1 font-mono">{receivedCount}</p>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Control Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Purchase Orders & Replenishment Pipeline</h3>
          <p className="text-xs text-slate-400">Track purchase requisitions and auto-receive inventory shipments</p>
        </div>
        <button
          onClick={onOpenPOModal}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Purchase Order</span>
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-xs">Loading orders...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16 text-slate-500 bg-slate-900 border border-slate-800 rounded-2xl text-xs">
            No purchase orders found. Click "New Purchase Order" to restock items.
          </div>
        ) : (
          orders.map((po) => {
            const isExpanded = expandedId === po._id;
            const isReceived = po.status === 'Received';

            return (
              <div
                key={po._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg transition-all"
              >
                <div className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => toggleExpand(po._id)}
                      className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-indigo-400 text-sm">{po.orderNumber}</span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                            isReceived
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : po.status === 'Ordered'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          {po.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-0.5">
                        Supplier: <strong className="text-white">{po.supplier}</strong> • {po.items?.length || 0} line items
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 ml-auto">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Value</span>
                      <span className="font-mono font-bold text-emerald-400 text-sm">
                        ${(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {!isReceived && (
                        <>
                          {po.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(po._id, 'Ordered')}
                              className="px-3 py-1.5 rounded-xl bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 text-xs font-semibold transition-all"
                            >
                              Mark Sent
                            </button>
                          )}

                          <button
                            onClick={() => handleStatusChange(po._id, 'Received')}
                            title="Receive shipment and automatically increase stock levels"
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 transition-all"
                          >
                            <PackageCheck className="w-3.5 h-3.5" />
                            <span>Receive & Stock</span>
                          </button>
                        </>
                      )}

                      <button
                        onClick={() => handleDelete(po._id, po.orderNumber)}
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Details Drawer */}
                {isExpanded && (
                  <div className="bg-slate-950/60 p-4 border-t border-slate-800/80 space-y-3 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-400">
                      <div>
                        <span>Created: </span>
                        <strong className="text-slate-200">{new Date(po.createdAt).toLocaleDateString()}</strong>
                      </div>
                      {po.expectedDelivery && (
                        <div>
                          <span>Expected Delivery: </span>
                          <strong className="text-slate-200">{new Date(po.expectedDelivery).toLocaleDateString()}</strong>
                        </div>
                      )}
                      {po.receivedDate && (
                        <div>
                          <span>Received On: </span>
                          <strong className="text-emerald-400">{new Date(po.receivedDate).toLocaleDateString()}</strong>
                        </div>
                      )}
                    </div>

                    {po.notes && (
                      <p className="text-slate-400 italic">
                        Notes: {po.notes}
                      </p>
                    )}

                    <div className="border border-slate-800 rounded-xl overflow-hidden mt-2">
                      <table className="w-full text-left">
                        <thead className="bg-slate-900 text-[10px] uppercase tracking-wider text-slate-400">
                          <tr>
                            <th className="py-2 px-3">SKU</th>
                            <th className="py-2 px-3">Item Description</th>
                            <th className="py-2 px-3 text-right">Order Qty</th>
                            <th className="py-2 px-3 text-right">Unit Cost</th>
                            <th className="py-2 px-3 text-right">Line Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {po.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-mono text-indigo-400">{item.sku}</td>
                              <td className="py-2 px-3 text-slate-200">{item.name}</td>
                              <td className="py-2 px-3 text-right font-mono text-white">{item.quantity}</td>
                              <td className="py-2 px-3 text-right font-mono text-slate-400">${item.unitCost.toFixed(2)}</td>
                              <td className="py-2 px-3 text-right font-mono text-emerald-400 font-semibold">${item.total.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
