const Product = require('../models/Product');
const Order = require('../models/Order');
const XeroxOrder = require('../models/XeroxOrder');
const User = require('../models/User');

// @desc    Get dashboard metrics & analytical reports (Admin & Staff)
// @route   GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res, next) => {
  try {
    // 1. Products Metrics
    const totalProducts = await Product.countDocuments({ isActive: true });
    const outOfStockCount = await Product.countDocuments({
      isActive: true,
      stockQuantity: { $lte: 0 },
    });

    // Low stock: > 0 and <= minStockThreshold
    const allProducts = await Product.find({ isActive: true });
    let lowStockCount = 0;
    let healthyStockCount = 0;
    let totalStockUnits = 0;
    let inventoryTotalValue = 0;

    allProducts.forEach((p) => {
      totalStockUnits += p.stockQuantity;
      inventoryTotalValue += p.stockQuantity * p.price;
      if (p.stockQuantity > 0 && p.stockQuantity <= p.minStockThreshold) {
        lowStockCount++;
      } else if (p.stockQuantity > p.minStockThreshold) {
        healthyStockCount++;
      }
    });

    // 2. Users Metrics
    const totalUsers = await User.countDocuments();
    const studentCount = await User.countDocuments({ role: 'student' });
    const staffCount = await User.countDocuments({ role: 'staff' });
    const adminCount = await User.countDocuments({ role: 'admin' });

    // 3. Orders Metrics (Stationery)
    const totalOrders = await Order.countDocuments();
    const pendingOrders = await Order.countDocuments({ status: 'PENDING' });
    const confirmedOrders = await Order.countDocuments({ status: { $in: ['CONFIRMED', 'PREPARING'] } });
    const readyOrders = await Order.countDocuments({ status: 'READY_FOR_PICKUP' });
    const completedOrders = await Order.countDocuments({ status: 'COMPLETED' });
    const cancelledOrders = await Order.countDocuments({ status: 'CANCELLED' });

    // Orders scheduled for today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const todayPickupsCount = await Order.countDocuments({
      pickupDate: { $gte: todayStart, $lte: todayEnd },
      status: { $in: ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP'] },
    });

    // Total revenue from completed stationery orders
    const completedOrdersDocs = await Order.find({ status: 'COMPLETED' }, 'totalAmount');
    const totalCompletedRevenue = completedOrdersDocs.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // Potential revenue from all active stationery orders
    const activeOrdersDocs = await Order.find({ status: { $ne: 'CANCELLED' } }, 'totalAmount');
    const totalActiveRevenue = activeOrdersDocs.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // 3b. Xerox Orders Metrics
    const totalXeroxOrders = await XeroxOrder.countDocuments();
    const pendingXeroxOrders = await XeroxOrder.countDocuments({ status: 'PENDING' });
    const acceptedXeroxOrders = await XeroxOrder.countDocuments({ status: 'ACCEPTED' });
    const printingXeroxOrders = await XeroxOrder.countDocuments({ status: 'PRINTING' });
    const readyXeroxOrders = await XeroxOrder.countDocuments({ status: 'READY_FOR_PICKUP' });
    const completedXeroxOrders = await XeroxOrder.countDocuments({ status: 'COMPLETED' });
    const cancelledXeroxOrders = await XeroxOrder.countDocuments({ status: 'CANCELLED' });

    const completedXeroxDocs = await XeroxOrder.find({ status: 'COMPLETED' }, 'totalAmount');
    const xeroxCompletedRevenue = completedXeroxDocs.reduce((acc, curr) => acc + curr.totalAmount, 0);

    const activeXeroxDocs = await XeroxOrder.find({ status: { $ne: 'CANCELLED' } }, 'totalAmount');
    const xeroxActiveRevenue = activeXeroxDocs.reduce((acc, curr) => acc + curr.totalAmount, 0);

    // 4. Category breakdown of products
    const categoryAgg = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalStock: { $sum: '$stockQuantity' },
          value: { $sum: { $multiply: ['$stockQuantity', '$price'] } },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // 5. Top selling stationery products (aggregated from all non-cancelled orders)
    const topProductsAgg = await Order.aggregate([
      { $match: { status: { $ne: 'CANCELLED' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.name',
          itemCode: { $first: '$items.itemCode' },
          totalSold: { $sum: '$items.quantity' },
          totalRevenue: { $sum: '$items.subtotal' },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 6 },
    ]);

    // 6. Recent 5 orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('student', 'name rollNumber email');

    res.json({
      success: true,
      data: {
        counts: {
          totalProducts,
          totalUsers,
          studentCount,
          staffCount,
          adminCount,
          totalOrders,
          pendingOrders,
          confirmedOrders,
          readyOrders,
          completedOrders,
          cancelledOrders,
          todayPickupsCount,
          lowStockCount,
          outOfStockCount,
          healthyStockCount,
          totalStockUnits,
          totalInventoryValue: Math.round(inventoryTotalValue),
          totalCompletedRevenue: Math.round(totalCompletedRevenue),
          totalActiveRevenue: Math.round(totalActiveRevenue),
          // Xerox Counts
          totalXeroxOrders,
          pendingXeroxOrders,
          acceptedXeroxOrders,
          printingXeroxOrders,
          readyXeroxOrders,
          completedXeroxOrders,
          cancelledXeroxOrders,
          xeroxCompletedRevenue: Math.round(xeroxCompletedRevenue),
          xeroxActiveRevenue: Math.round(xeroxActiveRevenue),
          grandTotalOrders: totalOrders + totalXeroxOrders,
          grandTotalRevenue: Math.round(totalCompletedRevenue + xeroxCompletedRevenue),
        },
        ordersByStatus: [
          { status: 'Pending', count: pendingOrders, color: '#f59e0b' },
          { status: 'Confirmed/Prep', count: confirmedOrders, color: '#3b82f6' },
          { status: 'Ready for Pickup', count: readyOrders, color: '#8b5cf6' },
          { status: 'Completed', count: completedOrders, color: '#10b981' },
          { status: 'Cancelled', count: cancelledOrders, color: '#ef4444' },
        ],
        xeroxByStatus: [
          { status: 'Pending', count: pendingXeroxOrders, color: '#f59e0b' },
          { status: 'Accepted', count: acceptedXeroxOrders, color: '#3b82f6' },
          { status: 'Printing', count: printingXeroxOrders, color: '#06b6d4' },
          { status: 'Ready for Pickup', count: readyXeroxOrders, color: '#8b5cf6' },
          { status: 'Completed', count: completedXeroxOrders, color: '#10b981' },
          { status: 'Cancelled', count: cancelledXeroxOrders, color: '#ef4444' },
        ],
        stockHealth: [
          { label: 'In Stock', count: healthyStockCount, color: '#10b981' },
          { label: 'Low Stock', count: lowStockCount, color: '#f59e0b' },
          { label: 'Out of Stock', count: outOfStockCount, color: '#ef4444' },
        ],
        categoryBreakdown: categoryAgg.map((cat) => ({
          category: cat._id,
          count: cat.count,
          totalStock: cat.totalStock,
          value: Math.round(cat.value),
        })),
        topProducts: topProductsAgg,
        recentOrders,
      },
    });
  } catch (error) {
    next(error);
  }
};
