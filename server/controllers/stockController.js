import Product from '../models/Product.js';
import StockTransaction from '../models/StockTransaction.js';

// @desc    Record a stock movement (IN, OUT, ADJUSTMENT)
// @route   POST /api/stock/movements
export const recordStockMovement = async (req, res) => {
  try {
    const {
      productId,
      type, // 'IN', 'OUT', 'ADJUSTMENT'
      quantity,
      newTotalQuantity, // used for ADJUSTMENT if direct new count is provided
      referenceNumber,
      reason,
      destinationOrSource,
      notes,
      performedBy,
    } = req.body;

    if (!productId || !type) {
      return res.status(400).json({ success: false, message: 'Product ID and movement type are required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const previousQuantity = product.quantity;
    let computedQty = Number(quantity);
    let newQuantity = previousQuantity;

    if (type === 'IN') {
      if (computedQty <= 0) {
        return res.status(400).json({ success: false, message: 'Stock IN quantity must be greater than 0' });
      }
      newQuantity = previousQuantity + computedQty;
    } else if (type === 'OUT') {
      if (computedQty <= 0) {
        return res.status(400).json({ success: false, message: 'Stock OUT quantity must be greater than 0' });
      }
      if (previousQuantity < computedQty) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock! Current stock is ${previousQuantity} ${product.unit}, but attempted to dispatch ${computedQty} ${product.unit}.`,
        });
      }
      newQuantity = previousQuantity - computedQty;
    } else if (type === 'ADJUSTMENT') {
      if (newTotalQuantity !== undefined && newTotalQuantity !== null) {
        const targetQty = Number(newTotalQuantity);
        if (targetQty < 0) {
          return res.status(400).json({ success: false, message: 'Inventory quantity cannot be negative' });
        }
        computedQty = Math.abs(targetQty - previousQuantity);
        newQuantity = targetQty;
      } else {
        return res.status(400).json({ success: false, message: 'Target stock quantity is required for adjustment' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Invalid movement type. Must be IN, OUT, or ADJUSTMENT.' });
    }

    // Update product quantity in database
    product.quantity = newQuantity;
    await product.save();

    // Create the transaction record
    const unitPrice = type === 'OUT' ? product.sellingPrice : product.costPrice;
    const totalValue = computedQty * unitPrice;

    const transaction = await StockTransaction.create({
      productId: product._id,
      productSku: product.sku,
      productName: product.name,
      type,
      quantity: computedQty,
      previousQuantity,
      newQuantity,
      unitPrice,
      totalValue,
      referenceNumber: referenceNumber || `TXN-${Date.now().toString(36).toUpperCase()}`,
      reason: reason || (type === 'IN' ? 'Stock Inbound' : type === 'OUT' ? 'Stock Outbound' : 'Audit Correction'),
      destinationOrSource: destinationOrSource || '',
      notes: notes || '',
      performedBy: performedBy || 'Inventory Staff',
    });

    res.status(201).json({
      success: true,
      message: `Stock successfully updated. Current stock is now ${newQuantity} ${product.unit}.`,
      data: {
        product,
        transaction,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all stock transactions with filters
// @route   GET /api/stock/transactions
export const getTransactions = async (req, res) => {
  try {
    const { type, search, startDate, endDate, limit = 50 } = req.query;

    let query = {};

    if (type && type !== 'All') {
      query.type = type;
    }

    if (search) {
      query.$or = [
        { productName: { $regex: search, $options: 'i' } },
        { productSku: { $regex: search, $options: 'i' } },
        { referenceNumber: { $regex: search, $options: 'i' } },
        { reason: { $regex: search, $options: 'i' } },
      ];
    }

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const transactions = await StockTransaction.find(query)
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
