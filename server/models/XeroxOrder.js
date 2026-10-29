const mongoose = require('mongoose');

const statusHistorySchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'PRINTING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'],
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

const xeroxOrderSchema = new mongoose.Schema(
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
      year: String,
    },
    file: {
      originalName: { type: String, required: true },
      fileName: { type: String, required: true },
      filePath: { type: String, required: true },
      fileSize: { type: Number, required: true },
      mimeType: { type: String, default: 'application/pdf' },
      detectedPages: { type: Number, default: 1 },
    },
    printConfig: {
      pageRangeType: {
        type: String,
        enum: ['ALL', 'CUSTOM'],
        default: 'ALL',
      },
      customPageRange: {
        type: String,
        default: '',
      },
      calculatedPages: {
        type: Number,
        required: true,
        min: 1,
      },
      copies: {
        type: Number,
        required: true,
        min: 1,
        default: 1,
      },
      colorMode: {
        type: String,
        enum: ['BW', 'COLOUR'],
        default: 'BW',
      },
      printSides: {
        type: String,
        enum: ['SINGLE', 'DOUBLE'],
        default: 'SINGLE',
      },
      paperSize: {
        type: String,
        default: 'A4',
      },
      binding: {
        type: String,
        enum: ['NONE', 'CORNER_STAPLE', 'SPIRAL_BINDING', 'SOFT_BINDING'],
        default: 'NONE',
      },
      ratePerPage: {
        type: Number,
        required: true,
      },
      bindingCharge: {
        type: Number,
        default: 0,
      },
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
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
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
    paymentReceivedAt: {
      type: Date,
    },
    status: {
      type: String,
      enum: ['PENDING', 'ACCEPTED', 'PRINTING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'],
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

module.exports = mongoose.model('XeroxOrder', xeroxOrderSchema);
