const mongoose = require('mongoose');

const xeroxSettingSchema = new mongoose.Schema(
  {
    bwPricePerPage: {
      type: Number,
      required: true,
      default: 2.0,
      min: [0.1, 'B&W price must be at least ₹0.10'],
    },
    colorPricePerPage: {
      type: Number,
      required: true,
      default: 10.0,
      min: [0.5, 'Colour price must be at least ₹0.50'],
    },
    doubleSidedDiscountPerPage: {
      type: Number,
      default: 0.5,
      min: 0,
    },
    cornerStapleCharge: {
      type: Number,
      default: 2.0,
      min: 0,
    },
    spiralBindingCharge: {
      type: Number,
      default: 30.0,
      min: 0,
    },
    softBindingCharge: {
      type: Number,
      default: 50.0,
      min: 0,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Helper static method to retrieve or auto-create default settings
xeroxSettingSchema.statics.getSettings = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({
      bwPricePerPage: 2.0,
      colorPricePerPage: 10.0,
      doubleSidedDiscountPerPage: 0.5,
      cornerStapleCharge: 2.0,
      spiralBindingCharge: 30.0,
      softBindingCharge: 50.0,
    });
  }
  return settings;
};

module.exports = mongoose.model('XeroxSetting', xeroxSettingSchema);
