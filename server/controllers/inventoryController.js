const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');

// @desc    Get inventory summary & item list
// @route   GET /api/inventory/overview
exports.getInventoryOverview = async (req, res, next) => {
  try {
    const { status, category, search } = req.query;

    const filter = { isActive: true };
    if (status && status !== 'ALL') {
      filter.status = status;
    }
    if (category && category !== 'All') {
      filter.category = category;
    }
    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      filter.$or = [{ name: regex }, { itemCode: regex }, { brand: regex }];
    }

    const items = await Product.find(filter).sort({ stockQuantity: 1, name: 1 });

    // Aggregate summary statistics across all active items
    const allActive = await Product.find({ isActive: true });
    let totalStockUnits = 0;
    let totalInventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let healthyStockCount = 0;

    allActive.forEach((p) => {
      totalStockUnits += p.stockQuantity;
      totalInventoryValue += p.stockQuantity * p.price;
      if (p.status === 'Out of Stock') outOfStockCount++;
      else if (p.status === 'Low Stock') lowStockCount++;
      else healthyStockCount++;
    });

    res.json({
      success: true,
      summary: {
        totalProducts: allActive.length,
        totalStockUnits,
        totalInventoryValue: Math.round(totalInventoryValue),
        lowStockCount,
        outOfStockCount,
        healthyStockCount,
      },
      items,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Quick restock product stock
// @route   POST /api/inventory/restock
exports.quickRestock = async (req, res, next) => {
  try {
    const { productId, addedQuantity, note } = req.body;

    const qty = Number(addedQuantity);
    if (!qty || qty <= 0 || !Number.isInteger(qty)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid positive quantity to restock.',
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    const previousStock = product.stockQuantity;
    const newStock = previousStock + qty;

    product.stockQuantity = newStock;
    product.status = Product.computeStatus(newStock, product.minStockThreshold);
    await product.save();

    await InventoryLog.create({
      product: product._id,
      action: 'RESTOCK',
      previousStock,
      newStock,
      quantityChanged: qty,
      performedBy: req.user._id,
      note: note || `Restocked +${qty} units by ${req.user.name} (${req.user.role})`,
    });

    // Notify staff & admin about replenishment
    await Notification.create({
      targetRole: 'staff',
      title: 'Stock Replenished',
      message: `Product "${product.name}" (${product.itemCode}) restocked with +${qty} units. New level: ${newStock}.`,
      type: 'RESTOCK',
      relatedProduct: product._id,
    });

    res.json({
      success: true,
      message: `Successfully restocked ${qty} units of "${product.name}". New stock: ${newStock}`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update minimum stock threshold
// @route   PUT /api/inventory/:id/threshold
exports.updateThreshold = async (req, res, next) => {
  try {
    const { minStockThreshold } = req.body;

    const threshold = Number(minStockThreshold);
    if (threshold === undefined || isNaN(threshold) || threshold < 1) {
      return res.status(400).json({
        success: false,
        message: 'Minimum stock threshold must be a number greater than or equal to 1.',
      });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found.',
      });
    }

    product.minStockThreshold = threshold;
    product.status = Product.computeStatus(product.stockQuantity, threshold);
    await product.save();

    await InventoryLog.create({
      product: product._id,
      action: 'THRESHOLD_UPDATE',
      previousStock: product.stockQuantity,
      newStock: product.stockQuantity,
      quantityChanged: 0,
      performedBy: req.user._id,
      note: `Minimum threshold updated to ${threshold} by ${req.user.name}`,
    });

    res.json({
      success: true,
      message: `Updated minimum threshold for "${product.name}" to ${threshold}. Current status: ${product.status}.`,
      product,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get recent inventory logs
// @route   GET /api/inventory/logs
exports.getInventoryLogs = async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;

    const logs = await InventoryLog.find()
      .populate('product', 'name itemCode category price')
      .populate('performedBy', 'name role')
      .populate('orderRef', 'orderNumber')
      .sort({ createdAt: -1 })
      .limit(Number(limit));

    res.json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    next(error);
  }
};
