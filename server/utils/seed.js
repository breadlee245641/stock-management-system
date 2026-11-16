import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import StockTransaction from '../models/StockTransaction.js';
import PurchaseOrder from '../models/PurchaseOrder.js';

dotenv.config();

const categoriesData = [
  { name: 'Electronics', description: 'Components, boards, gadgets, and peripherals', color: '#3b82f6' },
  { name: 'Office Supplies', description: 'Stationery, paper, toner, desk equipment', color: '#10b981' },
  { name: 'Hardware & Tools', description: 'Hand tools, fasteners, drills, measuring equipment', color: '#f59e0b' },
  { name: 'Packaging & Shipping', description: 'Boxes, bubble wrap, poly mailers, strapping tape', color: '#8b5cf6' },
  { name: 'Raw Materials', description: 'Metals, polymers, cables, raw stock', color: '#ec4899' },
];

const suppliersData = [
  {
    name: 'Apex Micro Electronics',
    contactPerson: 'David Chen',
    email: 'sales@apexmicro.com',
    phone: '+1 (555) 234-5678',
    address: '840 Silicon Way, San Jose, CA',
    categories: ['Electronics'],
  },
  {
    name: 'Industrial Pro Tools Ltd',
    contactPerson: 'Sarah Jenkins',
    email: 'orders@industrialpro.com',
    phone: '+1 (555) 876-5432',
    address: '102 Industrial Parkway, Cleveland, OH',
    categories: ['Hardware & Tools'],
  },
  {
    name: 'PackMaster Logistics Supply',
    contactPerson: 'Michael Rodriguez',
    email: 'contact@packmaster.com',
    phone: '+1 (555) 432-1098',
    address: '500 Logistics Blvd, Dallas, TX',
    categories: ['Packaging & Shipping'],
  },
  {
    name: 'Metro Office Depot Direct',
    contactPerson: 'Emily Watson',
    email: 'support@metrooffice.com',
    phone: '+1 (555) 345-6789',
    address: '22 Corporate Center Dr, Chicago, IL',
    categories: ['Office Supplies'],
  },
];

const productsData = [
  {
    sku: 'ELEC-ESP32-WROOM',
    barcode: '890123456701',
    name: 'ESP32 Wi-Fi & Bluetooth IoT Module',
    category: 'Electronics',
    description: 'Dual-core MCU with integrated Wi-Fi & BLE 4.2',
    costPrice: 2.80,
    sellingPrice: 5.50,
    quantity: 140,
    minStockThreshold: 30,
    unit: 'pcs',
    warehouseLocation: 'Bin E-14 (Aisle 2)',
    supplier: 'Apex Micro Electronics',
  },
  {
    sku: 'ELEC-OLED-096',
    barcode: '890123456702',
    name: '0.96 inch I2C OLED Display 128x64 Blue',
    category: 'Electronics',
    description: 'High contrast monochrome OLED display with SSD1306 driver',
    costPrice: 1.95,
    sellingPrice: 4.20,
    quantity: 18,
    minStockThreshold: 25, // Low stock!
    unit: 'pcs',
    warehouseLocation: 'Bin E-15 (Aisle 2)',
    supplier: 'Apex Micro Electronics',
  },
  {
    sku: 'ELEC-STEP-NEMA17',
    barcode: '890123456703',
    name: 'NEMA 17 Stepper Motor 1.5A 42Ncm',
    category: 'Electronics',
    description: 'Precision biphasic stepper motor for 3D printers and CNCs',
    costPrice: 7.20,
    sellingPrice: 14.50,
    quantity: 0, // Out of stock!
    minStockThreshold: 10,
    unit: 'pcs',
    warehouseLocation: 'Rack B-03',
    supplier: 'Apex Micro Electronics',
  },
  {
    sku: 'TOOL-DIGI-CALIPER',
    barcode: '890123456704',
    name: 'Stainless Steel Digital Caliper 6 inch / 150mm',
    category: 'Hardware & Tools',
    description: 'Precision micrometer caliper with LCD readout (0.01mm resolution)',
    costPrice: 11.50,
    sellingPrice: 24.99,
    quantity: 42,
    minStockThreshold: 15,
    unit: 'pcs',
    warehouseLocation: 'Shelf T-01',
    supplier: 'Industrial Pro Tools Ltd',
  },
  {
    sku: 'TOOL-CORDLESS-DRILL',
    barcode: '890123456705',
    name: '20V Brushless Cordless Drill / Driver Kit',
    category: 'Hardware & Tools',
    description: 'High torque drill with 2x 2.0Ah lithium batteries & fast charger',
    costPrice: 48.00,
    sellingPrice: 89.95,
    quantity: 8,
    minStockThreshold: 12, // Low stock!
    unit: 'boxes',
    warehouseLocation: 'Shelf T-04',
    supplier: 'Industrial Pro Tools Ltd',
  },
  {
    sku: 'PACK-CORR-BOX-M',
    barcode: '890123456706',
    name: 'Double-Wall Corrugated Shipping Boxes 12x9x6"',
    category: 'Packaging & Shipping',
    description: 'Heavy duty 200 lb test cardboard shipping cartons (Bundle of 25)',
    costPrice: 14.00,
    sellingPrice: 26.50,
    quantity: 85,
    minStockThreshold: 20,
    unit: 'bundles',
    warehouseLocation: 'Zone P-02 Pallet 4',
    supplier: 'PackMaster Logistics Supply',
  },
  {
    sku: 'PACK-BUBBLE-ROLL',
    barcode: '890123456707',
    name: 'Perforated Bubble Cushioning Roll 3/16" 350ft',
    category: 'Packaging & Shipping',
    description: 'Air barrier protection bubble wrap perforated every 12 inches',
    costPrice: 16.50,
    sellingPrice: 31.00,
    quantity: 4,
    minStockThreshold: 15, // Low stock!
    unit: 'rolls',
    warehouseLocation: 'Zone P-01 Pallet 1',
    supplier: 'PackMaster Logistics Supply',
  },
  {
    sku: 'OFF-THERM-LABEL',
    barcode: '890123456708',
    name: 'Direct Thermal Shipping Labels 4x6" (Roll of 500)',
    category: 'Office Supplies',
    description: 'BPA-free commercial grade thermal adhesive labels for Zebra/Rollo',
    costPrice: 4.80,
    sellingPrice: 9.99,
    quantity: 210,
    minStockThreshold: 40,
    unit: 'rolls',
    warehouseLocation: 'Cabinet O-08',
    supplier: 'Metro Office Depot Direct',
  },
  {
    sku: 'OFF-ERGON-CHAIR',
    barcode: '890123456709',
    name: 'High-Back Breathable Mesh Ergonomic Chair',
    category: 'Office Supplies',
    description: 'Adjustable lumbar support 3D armrests tilt lock mechanism',
    costPrice: 85.00,
    sellingPrice: 165.00,
    quantity: 0, // Out of stock!
    minStockThreshold: 5,
    unit: 'pcs',
    warehouseLocation: 'Bulk Storage Bay 2',
    supplier: 'Metro Office Depot Direct',
  },
  {
    sku: 'RAW-ALUM-EXTRUSION',
    barcode: '890123456710',
    name: 'T-Slot Anodized Aluminum Extrusion 2020 (1 Meter)',
    category: 'Raw Materials',
    description: 'Linear rail framing profile for automation & CNC builds',
    costPrice: 4.10,
    sellingPrice: 8.90,
    quantity: 75,
    minStockThreshold: 25,
    unit: 'bars',
    warehouseLocation: 'Rack R-12',
    supplier: 'Industrial Pro Tools Ltd',
  },
];

export const seedDatabase = async () => {
  try {
    const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/stock_management';
    await mongoose.connect(uri);
    console.log(' Connected to MongoDB for seeding...');

    // Drop collections to remove any old or conflicting indexes
    const collections = ['categories', 'suppliers', 'products', 'stocktransactions', 'purchaseorders'];
    for (const colName of collections) {
      try {
        await mongoose.connection.collection(colName).drop();
      } catch (err) {
        // collection might not exist yet, safe to ignore
      }
    }
    console.log(' Cleared existing database collections and indexes.');

    // Seed Categories
    const categories = await Category.insertMany(categoriesData);
    console.log(` Created ${categories.length} categories.`);

    // Seed Suppliers
    const suppliers = await Supplier.insertMany(suppliersData);
    console.log(` Created ${suppliers.length} suppliers.`);

    // Seed Products
    const products = await Product.insertMany(productsData);
    console.log(` Created ${products.length} products.`);

    // Generate Initial Transactions
    const transactions = [];
    for (const product of products) {
      if (product.quantity > 0) {
        transactions.push({
          productId: product._id,
          productSku: product.sku,
          productName: product.name,
          type: 'IN',
          quantity: product.quantity,
          previousQuantity: 0,
          newQuantity: product.quantity,
          unitPrice: product.costPrice,
          totalValue: product.quantity * product.costPrice,
          referenceNumber: `INIT-${product.sku.slice(0, 8)}`,
          reason: 'Initial Warehouse Inbound',
          destinationOrSource: product.supplier,
          notes: 'Baseline stock intake upon system initialization',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Add some realistic dispatch (OUT) movements
    const sampleProduct = products[0]; // ESP32
    transactions.push({
      productId: sampleProduct._id,
      productSku: sampleProduct.sku,
      productName: sampleProduct.name,
      type: 'OUT',
      quantity: 25,
      previousQuantity: sampleProduct.quantity + 25,
      newQuantity: sampleProduct.quantity,
      unitPrice: sampleProduct.sellingPrice,
      totalValue: 25 * sampleProduct.sellingPrice,
      referenceNumber: 'ORD-2026-9041',
      reason: 'B2B Client Order Dispatch',
      destinationOrSource: 'TechLabs Inc',
      notes: 'Customer order fulfilled via Express Freight',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    });

    const sampleCaliper = products[3]; // Caliper
    transactions.push({
      productId: sampleCaliper._id,
      productSku: sampleCaliper.sku,
      productName: sampleCaliper.name,
      type: 'OUT',
      quantity: 8,
      previousQuantity: sampleCaliper.quantity + 8,
      newQuantity: sampleCaliper.quantity,
      unitPrice: sampleCaliper.sellingPrice,
      totalValue: 8 * sampleCaliper.sellingPrice,
      referenceNumber: 'ORD-2026-9082',
      reason: 'Retail Store Restock',
      destinationOrSource: 'Main Branch Store',
      notes: 'Weekly store replenishment',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    });

    // Add an audit adjustment
    transactions.push({
      productId: sampleProduct._id,
      productSku: sampleProduct.sku,
      productName: sampleProduct.name,
      type: 'ADJUSTMENT',
      quantity: 2,
      previousQuantity: sampleProduct.quantity - 2,
      newQuantity: sampleProduct.quantity,
      unitPrice: sampleProduct.costPrice,
      totalValue: 2 * sampleProduct.costPrice,
      referenceNumber: 'AUDIT-Q1-09',
      reason: 'Cycle Count Discrepancy Found',
      destinationOrSource: 'Bin E-14 Inspection',
      notes: 'Found 2 misplaced units during shelf count',
      createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    });

    await StockTransaction.insertMany(transactions);
    console.log(` Created ${transactions.length} stock movement records.`);

    // Seed Purchase Orders
    const poItems = [
      {
        productId: products[2]._id, // Stepper motor (Out of stock)
        sku: products[2].sku,
        name: products[2].name,
        quantity: 50,
        unitCost: products[2].costPrice,
        total: 50 * products[2].costPrice,
      },
      {
        productId: products[1]._id, // OLED (Low stock)
        sku: products[1].sku,
        name: products[1].name,
        quantity: 100,
        unitCost: products[1].costPrice,
        total: 100 * products[1].costPrice,
      },
    ];

    await PurchaseOrder.create({
      orderNumber: 'PO-2026-00101',
      supplier: 'Apex Micro Electronics',
      items: poItems,
      totalAmount: poItems.reduce((acc, i) => acc + i.total, 0),
      status: 'Ordered',
      expectedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      notes: 'Urgent restock for zero and low-stock electronic components',
    });

    await PurchaseOrder.create({
      orderNumber: 'PO-2026-00098',
      supplier: 'PackMaster Logistics Supply',
      items: [
        {
          productId: products[6]._id,
          sku: products[6].sku,
          name: products[6].name,
          quantity: 30,
          unitCost: products[6].costPrice,
          total: 30 * products[6].costPrice,
        },
      ],
      totalAmount: 30 * products[6].costPrice,
      status: 'Pending',
      expectedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      notes: 'Scheduled monthly packaging materials order',
    });

    console.log(' Created sample purchase orders.');
    console.log(' Database seed completed successfully!');
    return true;
  } catch (error) {
    console.error(' Seeding error:', error);
    throw error;
  }
};

// If run directly from command line
if (process.argv[1] && process.argv[1].includes('seed.js')) {
  seedDatabase()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
