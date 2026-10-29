const Order = require('../models/Order');
const Product = require('../models/Product');
const InventoryLog = require('../models/InventoryLog');
const Notification = require('../models/Notification');

// Generate unique BIT order number
const generateOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BIT-ORD-${dateStr}-${randomPart}`;
};

// @desc    Create student pre-order
// @route   POST /api/orders
exports.createOrder = async (req, res, next) => {
  try {
    const { items, pickupDate, pickupTimeSlot, studentNotes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Your cart / order items cannot be empty.',
      });
    }

    if (!pickupDate || !pickupTimeSlot) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both scheduled pickup date and pickup time slot.',
      });
    }

    const pickupDateObj = new Date(pickupDate);
    if (isNaN(pickupDateObj.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup date provided.',
      });
    }

    // Validate items and stock availability
    const orderItems = [];
    let totalAmount = 0;
    let totalItems = 0;

    // Verify all products and stock upfront
    const productsToUpdate = [];

    for (const item of items) {
      const product = await Product.findById(item.productId || item.product);

      if (!product || !product.isActive) {
        return res.status(404).json({
          success: false,
          message: `Product "${item.name || 'Unknown'}" is not available in the store catalogue.`,
        });
      }

      const qty = Number(item.quantity);
      if (qty <= 0 || !Number.isInteger(qty)) {
        return res.status(400).json({
          success: false,
          message: `Invalid quantity for ${product.name}. Must be at least 1.`,
        });
      }

      if (product.stockQuantity < qty) {
        return res.status(400).json({
          success: false,
          message: `Cannot order ${qty} unit(s) of "${product.name}". Only ${product.stockQuantity} unit(s) currently available in store inventory.`,
          availableStock: product.stockQuantity,
          productId: product._id,
        });
      }

      const subtotal = product.price * qty;
      totalAmount += subtotal;
      totalItems += qty;

      orderItems.push({
        product: product._id,
        name: product.name,
        itemCode: product.itemCode,
        price: product.price,
        quantity: qty,
        subtotal,
        image: product.image,
      });

      productsToUpdate.push({
        product,
        qtyDeducted: qty,
      });
    }

    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      student: req.user._id,
      studentDetails: {
        name: req.user.name,
        email: req.user.email,
        rollNumber: req.user.rollNumber || 'N/A',
        department: req.user.department || 'N/A',
        phone: req.user.phone || 'N/A',
      },
      items: orderItems,
      totalAmount,
      totalItems,
      status: 'PENDING',
      pickupDate: pickupDateObj,
      pickupTimeSlot,
      studentNotes: studentNotes || '',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: 'Pre-order placed by student. Awaiting store staff verification.',
          updatedBy: req.user._id,
        },
      ],
    });

    // Deduct stock and log for each product
    for (const entry of productsToUpdate) {
      const { product, qtyDeducted } = entry;
      const prevStock = product.stockQuantity;
      const newStock = prevStock - qtyDeducted;

      product.stockQuantity = newStock;
      product.status = Product.computeStatus(newStock, product.minStockThreshold);
      await product.save();

      await InventoryLog.create({
        product: product._id,
        action: 'PRE_ORDER_DEDUCT',
        previousStock: prevStock,
        newStock: newStock,
        quantityChanged: -qtyDeducted,
        performedBy: req.user._id,
        orderRef: order._id,
        note: `Pre-order #${order.orderNumber} placed by ${req.user.name}`,
      });

      // Trigger low-stock alert if product hit threshold or 0
      if (newStock <= product.minStockThreshold) {
        await Notification.create({
          targetRole: 'staff',
          title: newStock === 0 ? 'Item Out of Stock!' : 'Low Stock Warning',
          message: `Item "${product.name}" (${product.itemCode}) dropped to ${newStock} unit(s) remaining after order #${order.orderNumber}. (Threshold: ${product.minStockThreshold})`,
          type: newStock === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK',
          relatedProduct: product._id,
          relatedOrder: order._id,
        });
      }
    }

    // Notification for student
    await Notification.create({
      recipient: req.user._id,
      targetRole: 'student',
      title: 'Pre-Order Submitted Successfully',
      message: `Your pre-order #${order.orderNumber} has been received. Scheduled pickup: ${new Date(pickupDate).toLocaleDateString()} during ${pickupTimeSlot}.`,
      type: 'ORDER_UPDATE',
      relatedOrder: order._id,
    });

    // Notification for staff
    await Notification.create({
      targetRole: 'staff',
      title: 'New Student Pre-Order Received',
      message: `New pre-order #${order.orderNumber} placed by ${req.user.name} (${req.user.rollNumber || 'Student'}) - Total: ₹${totalAmount}.`,
      type: 'ORDER_UPDATE',
      relatedOrder: order._id,
    });

    res.status(201).json({
      success: true,
      message: 'Pre-order successfully placed! Check your order history for updates.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current student's orders
// @route   GET /api/orders/my-orders
exports.getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ student: req.user._id })
      .sort({ createdAt: -1 })
      .populate('items.product', 'name itemCode image category brand');

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders (Store Staff & Admin)
// @route   GET /api/orders
exports.getAllOrders = async (req, res, next) => {
  try {
    const { status, search, pickupDate, page = 1, limit = 50 } = req.query;

    const query = {};

    if (status && status !== 'ALL') {
      query.status = status;
    }

    if (pickupDate) {
      const startOfDay = new Date(pickupDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(pickupDate);
      endOfDay.setHours(23, 59, 59, 999);
      query.pickupDate = { $gte: startOfDay, $lte: endOfDay };
    }

    if (search) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [
        { orderNumber: regex },
        { 'studentDetails.name': regex },
        { 'studentDetails.rollNumber': regex },
        { 'studentDetails.email': regex },
      ];
    }

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate('student', 'name email rollNumber department phone')
      .populate('processedBy', 'name role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({
      success: true,
      count: orders.length,
      total,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get order details by ID
// @route   GET /api/orders/:id
exports.getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('student', 'name email rollNumber department phone year')
      .populate('processedBy', 'name role')
      .populate('statusHistory.updatedBy', 'name role')
      .populate('items.product', 'name itemCode image brand category price stockQuantity');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    // Role authorization check: students can only view their own order
    if (
      req.user.role === 'student' &&
      order.student._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this order.',
      });
    }

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Store Staff & Admin)
// @route   PUT /api/orders/:id/status
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const { status, staffNotes, paymentStatus } = req.body;

    const validStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    const previousStatus = order.status;

    // Prevent changing from cancelled or completed unless explicit override
    if (previousStatus === 'COMPLETED' && status !== 'COMPLETED' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify an already completed order.',
      });
    }

    // If order is transitioning to CANCELLED from an active status, RESTORE STOCK
    if (status === 'CANCELLED' && previousStatus !== 'CANCELLED') {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          const prevStock = product.stockQuantity;
          const restoredStock = prevStock + item.quantity;
          product.stockQuantity = restoredStock;
          product.status = Product.computeStatus(restoredStock, product.minStockThreshold);
          await product.save();

          await InventoryLog.create({
            product: product._id,
            action: 'ORDER_CANCELLED_RESTORE',
            previousStock: prevStock,
            newStock: restoredStock,
            quantityChanged: item.quantity,
            performedBy: req.user._id,
            orderRef: order._id,
            note: `Stock restored upon cancellation of order #${order.orderNumber}`,
          });
        }
      }
    }

    // If status is COMPLETED, auto mark payment as PAID_AT_COUNTER
    if (status === 'COMPLETED') {
      order.paymentStatus = 'PAID_AT_COUNTER';
    } else if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    order.status = status;
    order.processedBy = req.user._id;
    if (staffNotes) {
      order.staffNotes = staffNotes;
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: staffNotes || `Status updated to ${status} by ${req.user.name} (${req.user.role})`,
      updatedBy: req.user._id,
    });

    await order.save();

    // Notify the student regarding status progress
    let notificationTitle = 'Order Status Updated';
    let notificationMsg = `Your pre-order #${order.orderNumber} status changed to ${status}.`;

    if (status === 'CONFIRMED') {
      notificationTitle = 'Pre-Order Confirmed';
      notificationMsg = `Your pre-order #${order.orderNumber} has been verified and confirmed by the store desk.`;
    } else if (status === 'PREPARING') {
      notificationTitle = 'Pre-Order Being Prepared';
      notificationMsg = `Your pre-order #${order.orderNumber} is currently being packed and prepared by store staff.`;
    } else if (status === 'READY_FOR_PICKUP') {
      notificationTitle = 'Pre-Order Ready for Pickup!';
      notificationMsg = `Your stationery order #${order.orderNumber} is packed and ready! Please collect it at the campus counter during your slot: ${order.pickupTimeSlot}.`;
    } else if (status === 'COMPLETED') {
      notificationTitle = 'Pre-Order Completed';
      notificationMsg = `Your order #${order.orderNumber} has been handed over. Thank you!`;
    } else if (status === 'CANCELLED') {
      notificationTitle = 'Pre-Order Cancelled';
      notificationMsg = `Your pre-order #${order.orderNumber} was cancelled. Note: ${staffNotes || 'Cancelled by campus store desk'}.`;
    }

    await Notification.create({
      recipient: order.student,
      targetRole: 'student',
      title: notificationTitle,
      message: notificationMsg,
      type: 'ORDER_UPDATE',
      relatedOrder: order._id,
    });

    res.json({
      success: true,
      message: `Order #${order.orderNumber} status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Student cancels their own pending order
// @route   PUT /api/orders/:id/cancel
exports.cancelMyOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this order.',
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}". Only PENDING pre-orders can be cancelled by students. Please contact the store staff.`,
      });
    }

    // Restore stock
    for (const item of order.items) {
      const product = await Product.findById(item.product);
      if (product) {
        const prevStock = product.stockQuantity;
        const restoredStock = prevStock + item.quantity;
        product.stockQuantity = restoredStock;
        product.status = Product.computeStatus(restoredStock, product.minStockThreshold);
        await product.save();

        await InventoryLog.create({
          product: product._id,
          action: 'ORDER_CANCELLED_RESTORE',
          previousStock: prevStock,
          newStock: restoredStock,
          quantityChanged: item.quantity,
          performedBy: req.user._id,
          orderRef: order._id,
          note: `Student cancelled pending pre-order #${order.orderNumber}`,
        });
      }
    }

    order.status = 'CANCELLED';
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: 'Cancelled by student prior to confirmation.',
      updatedBy: req.user._id,
    });

    await order.save();

    // Alert staff
    await Notification.create({
      targetRole: 'staff',
      title: 'Order Cancelled by Student',
      message: `Pre-order #${order.orderNumber} was cancelled by ${req.user.name}. Reserved stock has been automatically restored.`,
      type: 'ORDER_UPDATE',
      relatedOrder: order._id,
    });

    res.json({
      success: true,
      message: 'Your pre-order has been cancelled and stock returned to store inventory.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update payment status (Store Staff & Admin)
// @route   PUT /api/orders/:id/payment
exports.updatePaymentStatus = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found.',
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }
    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    await order.save();

    res.json({
      success: true,
      message: `Payment status updated to ${order.paymentStatus}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

