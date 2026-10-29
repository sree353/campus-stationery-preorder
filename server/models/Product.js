const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide product name'],
      trim: true,
    },
    itemCode: {
      type: String,
      required: [true, 'Please provide item code'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide category'],
      trim: true,
    },
    brand: {
      type: String,
      default: 'Campus Essentials',
      trim: true,
    },
    unit: {
      type: String,
      default: 'Piece',
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please provide price'],
      min: [0, 'Price cannot be negative'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Please provide stock quantity'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    minStockThreshold: {
      type: Number,
      default: 10,
      min: [1, 'Minimum threshold must be at least 1'],
    },
    status: {
      type: String,
      enum: ['In Stock', 'Low Stock', 'Out of Stock'],
      default: 'In Stock',
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    specifications: [
      {
        key: { type: String, trim: true },
        value: { type: String, trim: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Automatic status calculation before save
productSchema.pre('save', function (next) {
  if (this.stockQuantity <= 0) {
    this.status = 'Out of Stock';
  } else if (this.stockQuantity <= this.minStockThreshold) {
    this.status = 'Low Stock';
  } else {
    this.status = 'In Stock';
  }
  next();
});

// Helper static method to compute status for updates
productSchema.statics.computeStatus = function (stock, threshold) {
  if (stock <= 0) return 'Out of Stock';
  if (stock <= threshold) return 'Low Stock';
  return 'In Stock';
};

module.exports = mongoose.model('Product', productSchema);
