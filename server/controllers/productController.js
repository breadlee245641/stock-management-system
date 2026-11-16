import Product from '../models/Product.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Get all products with filtering & search
// @route   GET /api/products
export const getProducts = async (req, res) => {
  try {
    const { search, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } },
        { barcode: { $regex: search, $options: 'i' } },
        { warehouseLocation: { $regex: search, $options: 'i' } },
      ];
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    // Filter by stock status
    if (status === 'Out of Stock') {
      query.quantity = 0;
    } else if (status === 'Low Stock') {
      query.$expr = {
        $and: [
          { $gt: ['$quantity', 0] },
          { $lte: ['$quantity', '$minStockThreshold'] }
        ]
      };
    } else if (status === 'In Stock') {
      query.$expr = { $gt: ['$quantity', '$minStockThreshold'] };
    }

    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const products = await Product.find(query).sort(sort);

    res.json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }
    res.json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create new product
// @route   POST /api/products
export const createProduct = async (req, res) => {
  try {
    const { sku, name, category, description, costPrice, sellingPrice, quantity, minStockThreshold, unit, warehouseLocation, supplier, barcode } = req.body;

    const existingSku = await Product.findOne({ sku: sku.toUpperCase() });
    if (existingSku) {
      return res.status(400).json({ success: false, message: 'SKU already exists' });
    }

    const product = await Product.create({
      sku: sku.toUpperCase(),
      barcode: barcode || '',
      name,
      category,
      description: description || '',
      costPrice: Number(costPrice) || 0,
      sellingPrice: Number(sellingPrice) || 0,
      quantity: Number(quantity) || 0,
      minStockThreshold: Number(minStockThreshold) || 10,
      unit: unit || 'pcs',
      warehouseLocation: warehouseLocation || 'Main Warehouse',
      supplier: supplier || 'General Supplier',
    });

    // Record initial stock transaction if quantity > 0
    if (product.quantity > 0) {
      await StockTransaction.create({
        productId: product._id,
        productSku: product.sku,
        productName: product.name,
        type: 'IN',
        quantity: product.quantity,
        previousQuantity: 0,
        newQuantity: product.quantity,
        unitPrice: product.costPrice,
        totalValue: product.quantity * product.costPrice,
        reason: 'Initial Inventory Entry',
        notes: 'Created upon product initialization',
      });
    }

    res.status(201).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Update product details
// @route   PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // SKU uniqueness check if changed
    if (req.body.sku && req.body.sku.toUpperCase() !== product.sku) {
      const existing = await Product.findOne({ sku: req.body.sku.toUpperCase() });
      if (existing) {
        return res.status(400).json({ success: false, message: 'SKU is already in use' });
      }
      req.body.sku = req.body.sku.toUpperCase();
    }

    // Prevent direct arbitrary quantity change via standard update (should use stock movement)
    // but if provided and different, we log an adjustment transaction
    if (req.body.quantity !== undefined && Number(req.body.quantity) !== product.quantity) {
      const newQty = Number(req.body.quantity);
      const diff = newQty - product.quantity;
      await StockTransaction.create({
        productId: product._id,
        productSku: product.sku,
        productName: product.name,
        type: 'ADJUSTMENT',
        quantity: Math.abs(diff),
        previousQuantity: product.quantity,
        newQuantity: newQty,
        unitPrice: product.costPrice,
        totalValue: Math.abs(diff) * product.costPrice,
        reason: 'Manual Inventory Edit / Reconciliation',
        notes: req.body.adjustmentReason || 'Direct quantity edit in product settings',
      });
    }

    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product removed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get dashboard metrics & charts
// @route   GET /api/products/dashboard-stats
export const getDashboardStats = async (req, res) => {
  try {
    const products = await Product.find();

    let totalProducts = products.length;
    let totalStockUnits = 0;
    let totalValuation = 0;
    let totalPotentialRevenue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let inStockCount = 0;

    const categoryBreakdown = {};

    products.forEach((p) => {
      totalStockUnits += p.quantity;
      totalValuation += p.quantity * p.costPrice;
      totalPotentialRevenue += p.quantity * p.sellingPrice;

      if (p.quantity === 0) {
        outOfStockCount++;
      } else if (p.quantity <= p.minStockThreshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }

      if (!categoryBreakdown[p.category]) {
        categoryBreakdown[p.category] = {
          count: 0,
          valuation: 0,
          totalQty: 0,
        };
      }
      categoryBreakdown[p.category].count++;
      categoryBreakdown[p.category].valuation += p.quantity * p.costPrice;
      categoryBreakdown[p.category].totalQty += p.quantity;
    });

    // Recent 10 transactions
    const recentTransactions = await StockTransaction.find()
      .sort({ createdAt: -1 })
      .limit(10);

    // Recent low stock items
    const lowStockAlerts = products
      .filter((p) => p.quantity <= p.minStockThreshold)
      .slice(0, 10);

    // Transaction stats in past 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const movements = await StockTransaction.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: '$type',
          totalQuantity: { $sum: '$quantity' },
          totalValue: { $sum: '$totalValue' },
          count: { $sum: 1 },
        },
      },
    ]);

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalStockUnits,
          totalValuation: Math.round(totalValuation * 100) / 100,
          totalPotentialRevenue: Math.round(totalPotentialRevenue * 100) / 100,
          potentialProfit: Math.round((totalPotentialRevenue - totalValuation) * 100) / 100,
          inStockCount,
          lowStockCount,
          outOfStockCount,
        },
        categoryBreakdown,
        recentTransactions,
        lowStockAlerts,
        movements,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
