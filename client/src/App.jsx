import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import StockMovements from './pages/StockMovements';
import PurchaseOrders from './pages/PurchaseOrders';
import Suppliers from './pages/Suppliers';
import Reports from './pages/Reports';

import StockMovementModal from './components/StockMovementModal';
import ProductModal from './components/ProductModal';
import PurchaseOrderModal from './components/PurchaseOrderModal';
import SupplierModal from './components/SupplierModal';

import {
  getProducts,
  getDashboardStats,
  getCategories,
  getSuppliers,
  reseedDemoData,
} from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);

  // Modals state
  const [isMovementModalOpen, setIsMovementModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isPOModalOpen, setIsPOModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);

  const [selectedProductForMovement, setSelectedProductForMovement] = useState(null);
  const [selectedProductForEdit, setSelectedProductForEdit] = useState(null);
  const [selectedSupplierForEdit, setSelectedSupplierForEdit] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [prodRes, statsRes, catRes, supRes] = await Promise.all([
        getProducts(),
        getDashboardStats(),
        getCategories(),
        getSuppliers(),
      ]);

      setProducts(prodRes.data || []);
      setStats(statsRes.data || {});
      setCategories(catRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err) {
      console.error('Error fetching inventory data:', err);
      showToast(err.message || 'Error connecting to database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleReseed = async () => {
    if (window.confirm('Reset database and seed with fresh realistic demo inventory data?')) {
      try {
        await reseedDemoData();
        await loadAllData();
        showToast('Database successfully re-seeded with demo inventory!');
      } catch (err) {
        showToast('Failed to seed database: ' + err.message, 'error');
      }
    }
  };

  const handleOpenMovementModal = (product = null) => {
    setSelectedProductForMovement(product);
    setIsMovementModalOpen(true);
  };

  const handleOpenProductModal = (product = null) => {
    setSelectedProductForEdit(product);
    setIsProductModalOpen(true);
  };

  const handleOpenSupplierModal = (supplier = null) => {
    setSelectedSupplierForEdit(supplier);
    setIsSupplierModalOpen(true);
  };

  const lowStockCount = stats.summary?.lowStockCount || 0;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl text-xs font-semibold animate-in slide-in-from-bottom-5">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              toast.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'
            }`}
          ></span>
          <span className="text-white">{toast.message}</span>
        </div>
      )}

      {/* Persistent Left Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lowStockCount={lowStockCount}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          activeTabTitle={
            activeTab === 'dashboard'
              ? 'Executive Dashboard'
              : activeTab === 'inventory'
              ? 'Inventory Management'
              : activeTab === 'movements'
              ? 'Stock Movement Audit'
              : activeTab === 'orders'
              ? 'Procurement Orders'
              : activeTab === 'suppliers'
              ? 'Supplier Network'
              : 'Valuation & Accounting'
          }
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onReseed={handleReseed}
          onOpenMovementModal={() => handleOpenMovementModal()}
          onOpenProductModal={() => handleOpenProductModal()}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              stats={stats}
              loading={loading}
              onOpenMovementModal={() => handleOpenMovementModal()}
              onOpenProductModal={() => handleOpenProductModal()}
              onOpenPOModal={() => setIsPOModalOpen(true)}
              onSelectProductForRestock={(item) => handleOpenMovementModal(item)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'inventory' && (
            <Inventory
              products={products}
              categories={categories}
              loading={loading}
              onRefresh={loadAllData}
              onOpenProductModal={() => handleOpenProductModal()}
              onEditProduct={(p) => handleOpenProductModal(p)}
              onOpenMovementModal={() => handleOpenMovementModal()}
              onSelectProductForMovement={(p) => handleOpenMovementModal(p)}
            />
          )}

          {activeTab === 'movements' && (
            <StockMovements
              onOpenMovementModal={() => handleOpenMovementModal()}
            />
          )}

          {activeTab === 'orders' && (
            <PurchaseOrders
              onOpenPOModal={() => setIsPOModalOpen(true)}
              onRefreshInventory={loadAllData}
            />
          )}

          {activeTab === 'suppliers' && (
            <Suppliers
              suppliers={suppliers}
              loading={loading}
              onRefresh={loadAllData}
              onOpenSupplierModal={() => handleOpenSupplierModal()}
              onEditSupplier={(s) => handleOpenSupplierModal(s)}
            />
          )}

          {activeTab === 'reports' && (
            <Reports
              products={products}
              stats={stats}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <StockMovementModal
        isOpen={isMovementModalOpen}
        onClose={() => {
          setIsMovementModalOpen(false);
          setSelectedProductForMovement(null);
        }}
        products={products}
        defaultProduct={selectedProductForMovement}
        onSuccess={() => {
          loadAllData();
          showToast('Stock movement successfully recorded!');
        }}
      />

      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setSelectedProductForEdit(null);
        }}
        product={selectedProductForEdit}
        categories={categories}
        suppliers={suppliers}
        onSuccess={() => {
          loadAllData();
          showToast(selectedProductForEdit ? 'Product updated!' : 'Product added to inventory!');
        }}
      />

      <PurchaseOrderModal
        isOpen={isPOModalOpen}
        onClose={() => setIsPOModalOpen(false)}
        products={products}
        suppliers={suppliers}
        onSuccess={() => {
          loadAllData();
          showToast('Purchase order created successfully!');
        }}
      />

      <SupplierModal
        isOpen={isSupplierModalOpen}
        onClose={() => {
          setIsSupplierModalOpen(false);
          setSelectedSupplierForEdit(null);
        }}
        supplier={selectedSupplierForEdit}
        onSuccess={() => {
          loadAllData();
          showToast('Supplier saved successfully!');
        }}
      />
    </div>
  );
}
