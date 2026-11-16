import PurchaseOrder from '../models/PurchaseOrder.js';
import Product from '../models/Product.js';
import StockTransaction from '../models/StockTransaction.js';

export const getPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });
    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPurchaseOrder = async (req, res) => {
  try {
    const { supplier, items, expectedDelivery, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'At least one item is required in purchase order' });
    }

    const calculatedTotal = items.reduce((acc, curr) => acc + (curr.quantity * curr.unitCost), 0);

    const order = await PurchaseOrder.create({
      supplier,
      items,
      totalAmount: calculatedTotal,
      expectedDelivery,
      notes,
      status: 'Pending',
    });

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await PurchaseOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }

    if (order.status === 'Received') {
      return res.status(400).json({ success: false, message: 'Order has already been fulfilled and received.' });
    }

    if (status === 'Received') {
      // Fulfill the order: increment stock for each product & log transaction
      for (const item of order.items) {
        const product = await Product.findById(item.productId);
        if (product) {
          const prev = product.quantity;
          product.quantity += item.quantity;
          await product.save();

          await StockTransaction.create({
            productId: product._id,
            productSku: product.sku,
            productName: product.name,
            type: 'IN',
            quantity: item.quantity,
            previousQuantity: prev,
            newQuantity: product.quantity,
            unitPrice: item.unitCost,
            totalValue: item.quantity * item.unitCost,
            referenceNumber: order.orderNumber,
            reason: `Purchase Order Received (${order.supplier})`,
            destinationOrSource: order.supplier,
            notes: `Auto-fulfilled from Purchase Order #${order.orderNumber}`,
          });
        }
      }
      order.receivedDate = new Date();
    }

    order.status = status;
    await order.save();

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePurchaseOrder = async (req, res) => {
  try {
    const order = await PurchaseOrder.findByIdAndDelete(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Purchase Order not found' });
    }
    res.json({ success: true, message: 'Order deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
