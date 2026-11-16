# 📦 StockMaster Pro — Enterprise Stock Management System (MERN Stack)

A full-stack, enterprise-grade **Stock & Inventory Management System** built on the **MERN (MongoDB, Express.js, React, Node.js)** stack with Tailwind CSS, Lucide icons, and automated inventory audit trails.

---

## 🌟 Key Features

### 1. 📊 Executive Dashboard & Live Inventory Telemetry
- **Key Performance Indicators (KPIs)**: Total SKUs, Total Units, Capital Valuation, Low Stock Alerts, Out of Stock Count.
- **Profitability Metrics**: Cost Valuation vs. Projected Retail Valuation vs. Estimated Margin.
- **Visual Analytics**:
  - Interactive SVG Donut Chart for Stock Availability breakdown (In Stock, Low Stock, Depleted).
  - Dynamic Segment Valuation Bar Chart by Product Category.
- **Live Restock Alert Panel**: 1-click shortcut to trigger replenishment.
- **Real-Time Transaction Feed**: Recent inbound and outbound movements.

### 2. 📋 Inventory Catalog Management
- **Full Product Specifications**: SKU (auto-generated or custom), Barcode / EAN, Name, Category, Description, Cost Price, Selling Price, On-Hand Quantity, Unit of Measure, Safety Reorder Threshold, Warehouse Bin / Location, and Primary Supplier.
- **Multi-criteria Filtering & Sorting**: Instant search across name, SKU, barcode, and location. Filter by category and stock availability. Sortable columns.
- **Real-Time Margin Calculator**: Visual margin percentage indicator on item creation/edit.
- **1-Click CSV Data Export**: Export active catalog filtered views to spreadsheet CSV.

### 3. 🔄 Stock Movement & Audit Logging (IN / OUT / ADJUSTMENT)
- **Stock IN (Inbound)**: Receive shipments from suppliers or purchase orders with cost tracking.
- **Stock OUT (Outbound / Dispatch)**: Fulfill customer orders or warehouse dispatches with negative-stock prevention safeguards.
- **Stock ADJUSTMENT (Physical Cycle Counts)**: Log discrepancies found during physical shelf audits with automatic delta tracking.
- **Audit Trail**: Every movement logs timestamp, reference number, reason, counterparty, previous vs new stock levels, and operator.

### 4. 📝 Procurement & Purchase Orders (PO)
- Create and track supplier purchase orders with multi-item line breakdown and calculated totals.
- Status Lifecycle: `Pending` ➔ `Ordered` ➔ `Received`.
- **Automated Stock Replenishment**: Clicking **"Receive & Stock"** automatically updates product stock quantities in MongoDB and registers inbound transaction records in the audit ledger.

### 5. 🚚 Supplier Network Management
- Vendor directory with contact person, phone, email, physical warehouse address, and supplied item categories.
- Direct association with inventory catalog items.

### 6. 📑 Valuation Reports & Warehouse Sheets
- Balance sheet valuation of inventory assets.
- Capital concentration report (top items holding inventory capital).
- Category distribution table.
- Printable stock sheet and downloadable CSV audit export.

---

## 🏗️ Technology Stack

- **Frontend**: React 19, Vite 6, Tailwind CSS, Lucide Icons
- **Backend**: Node.js, Express.js, RESTful API
- **Database**: MongoDB (Local `mongodb://127.0.0.1:27017/stock_management` via Mongoose)
- **Architecture**: Modular MVC with Controllers, Models, Routes, and Config

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port `27017`

### 1. Start the Full-Stack Application
From the project root:

```bash
# Start backend server (serves API on :5000 and client build on http://localhost:5000)
npm start
```

### 2. Run in Development Mode (with Vite Hot Reload)
In two separate terminals:

```bash
# Terminal 1: Backend Server
npm run server

# Terminal 2: Frontend Dev Server
npm run client
```

- **Frontend Application**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000/api`

### 3. Re-seed Demo Data
To reset the database with fresh, realistic inventory items and transactions:

```bash
npm run seed
```
*(Or click the "Reset Demo" button directly inside the web UI navbar)*

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status |
| `GET` | `/api/products` | Get products with search, category & status filters |
| `GET` | `/api/products/dashboard-stats` | Summary stats, charts data & recent transactions |
| `POST` | `/api/products` | Create a new inventory product |
| `PUT` | `/api/products/:id` | Update product details |
| `DELETE` | `/api/products/:id` | Delete product |
| `POST` | `/api/stock/movements` | Record stock IN, OUT, or ADJUSTMENT |
| `GET` | `/api/stock/transactions` | Query audit trail of stock movements |
| `GET` | `/api/orders` | List purchase orders |
| `POST` | `/api/orders` | Create new purchase order |
| `PATCH` | `/api/orders/:id/status` | Update status (auto-stocks if 'Received') |
| `GET` | `/api/suppliers` | List all suppliers |
| `POST` | `/api/suppliers` | Register new supplier |
| `GET` | `/api/categories` | List product categories |
| `POST` | `/api/seed` | One-click reset & seed demo inventory |
