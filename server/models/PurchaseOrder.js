import mongoose from 'mongoose';

const purchaseOrderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  sku: String,
  name: String,
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unitCost: {
    type: Number,
    required: true,
    min: 0,
  },
  total: {
    type: Number,
    required: true,
  },
});

const purchaseOrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => `PO-${Date.now().toString().slice(-6)}`,
    },
    supplier: {
      type: String,
      required: [true, 'Supplier name is required'],
    },
    items: [purchaseOrderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Ordered', 'Received', 'Cancelled'],
      default: 'Pending',
    },
    expectedDelivery: {
      type: Date,
    },
    receivedDate: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

export default mongoose.model('PurchaseOrder', purchaseOrderSchema);
