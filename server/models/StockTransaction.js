import mongoose from 'mongoose';

const stockTransactionSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productSku: {
      type: String,
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['IN', 'OUT', 'ADJUSTMENT'],
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1'],
    },
    previousQuantity: {
      type: Number,
      required: true,
    },
    newQuantity: {
      type: Number,
      required: true,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    totalValue: {
      type: Number,
      default: 0,
    },
    referenceNumber: {
      type: String,
      default: () => `TXN-${Date.now().toString(36).toUpperCase()}`,
    },
    reason: {
      type: String,
      default: 'General Movement',
    },
    destinationOrSource: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    performedBy: {
      type: String,
      default: 'Inventory Manager',
    },
  },
  { timestamps: true }
);

export default mongoose.model('StockTransaction', stockTransactionSchema);
