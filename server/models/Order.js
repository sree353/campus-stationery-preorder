const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  itemCode: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  subtotal: {
    type: Number,
    required: true,
    min: 0,
  },
  image: {
    type: String,
    default: '',
  },
});

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'],
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  note: {
    type: String,
    default: '',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studentDetails: {
      name: String,
      email: String,
      rollNumber: String,
      department: String,
      phone: String,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalItems: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'],
      default: 'PENDING',
    },
    pickupDate: {
      type: Date,
      required: [true, 'Please select a scheduled pickup date'],
    },
    pickupTimeSlot: {
      type: String,
      required: [true, 'Please select a pickup time slot'],
      enum: [
        'Morning Slot (08:30 AM - 09:15 AM)',
        'Mid-Morning Slot (10:45 AM - 11:15 AM)',
        'Lunch Break (12:45 PM - 01:45 PM)',
        'Afternoon Slot (03:15 PM - 03:45 PM)',
        'Evening Post-Class (04:30 PM - 05:45 PM)',
      ],
    },
    paymentMethod: {
      type: String,
      default: 'Pay at Store Counter upon Pickup (Cash / Campus UPI)',
    },
    paymentStatus: {
      type: String,
      enum: ['UNPAID', 'PENDING', 'PAID', 'PAID_AT_COUNTER'],
      default: 'PENDING',
    },
    studentNotes: {
      type: String,
      default: '',
    },
    staffNotes: {
      type: String,
      default: '',
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Order', orderSchema);
