const Notification = require('../models/Notification');

// @desc    Get user's notifications
// @route   GET /api/notifications
exports.getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    const query = {
      $or: [
        { recipient: userId },
        { targetRole: userRole },
        { targetRole: 'all' },
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30)
      .populate('relatedProduct', 'name itemCode image stockQuantity')
      .populate('relatedOrder', 'orderNumber status totalAmount pickupDate');

    // Count unread (either isRead is false or readBy doesn't include user)
    const unreadCount = notifications.filter((n) => {
      if (n.recipient && n.recipient.toString() === userId.toString()) {
        return !n.isRead;
      }
      return !n.readBy.some((id) => id.toString() === userId.toString());
    }).length;

    res.json({
      success: true,
      unreadCount,
      notifications,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found.',
      });
    }

    if (notification.recipient && notification.recipient.toString() === req.user._id.toString()) {
      notification.isRead = true;
    } else {
      if (!notification.readBy.includes(req.user._id)) {
        notification.readBy.push(req.user._id);
      }
    }

    await notification.save();

    res.json({
      success: true,
      message: 'Notification marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all user's notifications as read
// @route   PUT /api/notifications/mark-all-read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    // Mark direct recipient notifications
    await Notification.updateMany(
      { recipient: userId, isRead: false },
      { $set: { isRead: true } }
    );

    // Mark broadcast / role-based notifications
    await Notification.updateMany(
      {
        recipient: null,
        targetRole: { $in: [userRole, 'all'] },
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast campus announcement (Admin / Staff)
// @route   POST /api/notifications/broadcast
exports.createBroadcast = async (req, res, next) => {
  try {
    const { title, message, targetRole = 'all' } = req.body;

    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Both announcement title and message are required.',
      });
    }

    const notification = await Notification.create({
      recipient: null,
      targetRole,
      title,
      message,
      type: 'SYSTEM',
    });

    res.status(201).json({
      success: true,
      message: 'Campus notification broadcasted successfully!',
      notification,
    });
  } catch (error) {
    next(error);
  }
};
