import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    sku: {
      type: String,
      required: [true, 'SKU is required'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    barcode: {
      type: String,
      trim: true,
      default: '',
    },
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    costPrice: {
      type: Number,
      required: [true, 'Cost price is required'],
      min: [0, 'Cost price cannot be negative'],
      default: 0,
    },
    sellingPrice: {
      type: Number,
      required: [true, 'Selling price is required'],
      min: [0, 'Selling price cannot be negative'],
      default: 0,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [0, 'Quantity cannot be negative'],
      default: 0,
    },
    minStockThreshold: {
      type: Number,
      default: 10,
      min: [0, 'Minimum threshold cannot be negative'],
    },
    unit: {
      type: String,
      default: 'pcs',
      trim: true,
    },
    warehouseLocation: {
      type: String,
      default: 'Main Warehouse - Section A',
      trim: true,
    },
    supplier: {
      type: String,
      default: 'Default Supplier',
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for inventory valuation
productSchema.virtual('totalValuation').get(function () {
  return (this.quantity || 0) * (this.costPrice || 0);
});

// Virtual for stock status
productSchema.virtual('status').get(function () {
  if (this.quantity === 0) return 'Out of Stock';
  if (this.quantity <= this.minStockThreshold) return 'Low Stock';
  return 'In Stock';
});

export default mongoose.model('Product', productSchema);
