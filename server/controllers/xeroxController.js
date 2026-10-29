const path = require('path');
const fs = require('fs');
const multer = require('multer');
const { PDFParse } = require('pdf-parse');
const XeroxOrder = require('../models/XeroxOrder');
const XeroxSetting = require('../models/XeroxSetting');
const Notification = require('../models/Notification');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/xerox');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  },
});

// File validation: Only PDF allowed, up to 30MB
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (file.mimetype === 'application/pdf' || ext === '.pdf') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PDF files (.pdf) are supported for Xerox pre-ordering.'), false);
  }
};

exports.uploadMiddleware = multer({
  storage,
  limits: { fileSize: 30 * 1024 * 1024 }, // 30 MB
  fileFilter,
}).single('pdfFile');

// Helper: Extract total pages from PDF buffer or file path
const getPdfPageCount = async (filePath) => {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    if (PDFParse) {
      const parser = new PDFParse({ data: dataBuffer });
      const info = await parser.getInfo();
      if (info && info.total && info.total > 0) {
        return info.total;
      }
    }
  } catch (err) {
    console.warn('PDFParse failed, trying regex fallback:', err.message);
  }

  // Fallback: Regex scan for /Type /Page
  try {
    const content = fs.readFileSync(filePath, 'binary');
    const matches = content.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) {
      return matches.length;
    }
  } catch (fallbackErr) {
    console.warn('Regex fallback failed:', fallbackErr.message);
  }

  return 1;
};

// Helper: Parse custom page range e.g. "1-5, 8, 10-12"
const parsePageRange = (rangeStr, totalDetectedPages) => {
  if (!rangeStr || !rangeStr.trim() || rangeStr.trim().toUpperCase() === 'ALL') {
    return { valid: true, count: totalDetectedPages, selectedRange: 'ALL' };
  }

  const parts = rangeStr.split(',').map((p) => p.trim()).filter(Boolean);
  const selectedPages = new Set();

  for (const part of parts) {
    if (part.includes('-')) {
      const [startStr, endStr] = part.split('-');
      const start = parseInt(startStr, 10);
      const end = parseInt(endStr, 10);

      if (isNaN(start) || isNaN(end) || start < 1 || start > end) {
        return { valid: false, message: `Invalid page range token: "${part}"` };
      }
      for (let p = start; p <= Math.min(end, totalDetectedPages); p++) {
        selectedPages.add(p);
      }
    } else {
      const pageNum = parseInt(part, 10);
      if (isNaN(pageNum) || pageNum < 1) {
        return { valid: false, message: `Invalid page number: "${part}"` };
      }
      if (pageNum <= totalDetectedPages) {
        selectedPages.add(pageNum);
      }
    }
  }

  if (selectedPages.size === 0) {
    return { valid: false, message: 'Selected page range resulted in 0 pages.' };
  }

  return {
    valid: true,
    count: selectedPages.size,
    selectedRange: rangeStr.trim(),
  };
};

// Helper: Generate Xerox Order Number
const generateXeroxOrderNumber = () => {
  const dateStr = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `BIT-XRX-${dateStr}-${randomPart}`;
};

// @desc    Preview PDF & calculate page count
// @route   POST /api/xerox/preview-pdf
exports.previewPdf = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please upload a PDF document.',
      });
    }

    const detectedPages = await getPdfPageCount(req.file.path);
    const settings = await XeroxSetting.getSettings();

    res.json({
      success: true,
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        detectedPages,
        tempPath: req.file.path,
      },
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create student Xerox pre-order
// @route   POST /api/xerox
exports.createXeroxOrder = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please attach a PDF document for Xerox pre-ordering.',
      });
    }

    const {
      pageRangeType = 'ALL',
      customPageRange = '',
      copies = 1,
      colorMode = 'BW',
      printSides = 'SINGLE',
      paperSize = 'A4',
      binding = 'NONE',
      pickupDate,
      pickupTimeSlot,
      studentNotes = '',
    } = req.body;

    if (!pickupDate || !pickupTimeSlot) {
      // Remove uploaded file on validation error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Please select both scheduled pickup date and pickup time slot.',
      });
    }

    const pickupDateObj = new Date(pickupDate);
    if (isNaN(pickupDateObj.getTime())) {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: 'Invalid pickup date.',
      });
    }

    const detectedPages = await getPdfPageCount(req.file.path);

    // Calculate pages to print
    let calculatedPages = detectedPages;
    if (pageRangeType === 'CUSTOM' && customPageRange) {
      const rangeResult = parsePageRange(customPageRange, detectedPages);
      if (!rangeResult.valid) {
        if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(400).json({
          success: false,
          message: rangeResult.message,
        });
      }
      calculatedPages = rangeResult.count;
    }

    const numCopies = Math.max(1, parseInt(copies, 10) || 1);

    // Get current pricing settings
    const settings = await XeroxSetting.getSettings();

    const baseRate = colorMode === 'COLOUR' ? settings.colorPricePerPage : settings.bwPricePerPage;
    const effectiveRatePerPage =
      printSides === 'DOUBLE'
        ? Math.max(0.5, baseRate - (settings.doubleSidedDiscountPerPage || 0))
        : baseRate;

    let bindingCharge = 0;
    if (binding === 'CORNER_STAPLE') bindingCharge = settings.cornerStapleCharge || 2;
    else if (binding === 'SPIRAL_BINDING') bindingCharge = settings.spiralBindingCharge || 30;
    else if (binding === 'SOFT_BINDING') bindingCharge = settings.softBindingCharge || 50;

    const printCostPerCopy = calculatedPages * effectiveRatePerPage;
    const costPerCopy = printCostPerCopy + bindingCharge;
    const totalAmount = Math.round(costPerCopy * numCopies * 100) / 100;

    const orderNumber = generateXeroxOrderNumber();

    const xeroxOrder = await XeroxOrder.create({
      orderNumber,
      student: req.user._id,
      studentDetails: {
        name: req.user.name,
        email: req.user.email,
        rollNumber: req.user.rollNumber || 'N/A',
        department: req.user.department || 'N/A',
        phone: req.user.phone || 'N/A',
        year: req.user.year || 'N/A',
      },
      file: {
        originalName: req.file.originalname,
        fileName: req.file.filename,
        filePath: req.file.path,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        detectedPages,
      },
      printConfig: {
        pageRangeType,
        customPageRange: pageRangeType === 'CUSTOM' ? customPageRange : '',
        calculatedPages,
        copies: numCopies,
        colorMode,
        printSides,
        paperSize,
        binding,
        ratePerPage: effectiveRatePerPage,
        bindingCharge,
      },
      totalAmount,
      pickupDate: pickupDateObj,
      pickupTimeSlot,
      paymentMethod: 'Pay at Store Counter upon Pickup (Cash / Campus UPI)',
      paymentStatus: 'PENDING',
      status: 'PENDING',
      studentNotes: studentNotes || '',
      statusHistory: [
        {
          status: 'PENDING',
          timestamp: new Date(),
          note: 'Xerox pre-order submitted with PDF. Awaiting store staff confirmation.',
          updatedBy: req.user._id,
        },
      ],
    });

    // Notify Student
    await Notification.create({
      recipient: req.user._id,
      targetRole: 'student',
      title: 'Xerox Pre-Order Submitted',
      message: `Your Xerox pre-order #${xeroxOrder.orderNumber} for "${req.file.originalname}" (${calculatedPages} pages × ${numCopies} copies) has been placed. Estimated: ₹${totalAmount}.`,
      type: 'ORDER_UPDATE',
    });

    // Notify Staff
    await Notification.create({
      targetRole: 'staff',
      title: 'New Xerox Print Request',
      message: `New Xerox request #${xeroxOrder.orderNumber} from ${req.user.name} (${req.user.rollNumber || 'Student'}) - ${colorMode} ${printSides} (${calculatedPages} pgs × ${numCopies}).`,
      type: 'ORDER_UPDATE',
    });

    res.status(201).json({
      success: true,
      message: 'Xerox pre-order submitted successfully! Collect at the store desk.',
      order: xeroxOrder,
    });
  } catch (error) {
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// @desc    Get current student's Xerox orders
// @route   GET /api/xerox/my-orders
exports.getMyXeroxOrders = async (req, res, next) => {
  try {
    const orders = await XeroxOrder.find({ student: req.user._id }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all Xerox orders (Staff & Admin)
// @route   GET /api/xerox
exports.getAllXeroxOrders = async (req, res, next) => {
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
        { 'file.originalName': regex },
      ];
    }

    const total = await XeroxOrder.countDocuments(query);
    const orders = await XeroxOrder.find(query)
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

// @desc    Get Xerox order by ID
// @route   GET /api/xerox/:id
exports.getXeroxOrderById = async (req, res, next) => {
  try {
    const order = await XeroxOrder.findById(req.params.id)
      .populate('student', 'name email rollNumber department phone year')
      .populate('processedBy', 'name role')
      .populate('statusHistory.updatedBy', 'name role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Xerox pre-order not found.',
      });
    }

    // Role check: Student can only view their own
    if (req.user.role === 'student' && order.student._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to view this Xerox pre-order.',
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

// @desc    Update Xerox order status (Staff & Admin)
// @route   PUT /api/xerox/:id/status
exports.updateXeroxOrderStatus = async (req, res, next) => {
  try {
    const { status, staffNotes, paymentStatus } = req.body;

    const validStatuses = ['PENDING', 'ACCEPTED', 'PRINTING', 'READY_FOR_PICKUP', 'COMPLETED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid Xerox status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const order = await XeroxOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Xerox pre-order not found.',
      });
    }

    if (order.status === 'COMPLETED' && status !== 'COMPLETED' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot modify an already completed Xerox order.',
      });
    }

    if (status === 'COMPLETED') {
      order.paymentStatus = 'PAID';
      order.paymentReceivedAt = new Date();
    } else if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID' && !order.paymentReceivedAt) {
        order.paymentReceivedAt = new Date();
      }
    }

    order.status = status;
    order.processedBy = req.user._id;
    if (staffNotes !== undefined) {
      order.staffNotes = staffNotes;
    }

    order.statusHistory.push({
      status,
      timestamp: new Date(),
      note: staffNotes || `Xerox order updated to ${status} by ${req.user.name} (${req.user.role})`,
      updatedBy: req.user._id,
    });

    await order.save();

    // Trigger role-based notification for student
    let notificationTitle = 'Xerox Order Status Updated';
    let notificationMsg = `Your Xerox pre-order #${order.orderNumber} status changed to ${status}.`;

    if (status === 'ACCEPTED') {
      notificationTitle = 'Xerox Order Accepted';
      notificationMsg = `Your Xerox document "${order.file.originalName}" has been accepted and queued for printing at the store desk.`;
    } else if (status === 'PRINTING') {
      notificationTitle = 'Xerox Document Printing';
      notificationMsg = `Your document "${order.file.originalName}" is actively printing on the campus Xerox machine.`;
    } else if (status === 'READY_FOR_PICKUP') {
      notificationTitle = 'Xerox Ready for Pickup!';
      notificationMsg = `Your Xerox printout for order #${order.orderNumber} is printed and ready! Collect it at Store Desk #02 during your slot: ${order.pickupTimeSlot}. (Amount: ₹${order.totalAmount})`;
    } else if (status === 'COMPLETED') {
      notificationTitle = 'Xerox Order Completed';
      notificationMsg = `Your Xerox document #${order.orderNumber} has been collected. Thank you!`;
    } else if (status === 'CANCELLED') {
      notificationTitle = 'Xerox Order Cancelled / Rejected';
      notificationMsg = `Your Xerox pre-order #${order.orderNumber} was cancelled. Note: ${staffNotes || 'Rejected by staff'}.`;
    }

    await Notification.create({
      recipient: order.student,
      targetRole: 'student',
      title: notificationTitle,
      message: notificationMsg,
      type: 'ORDER_UPDATE',
    });

    res.json({
      success: true,
      message: `Xerox pre-order #${order.orderNumber} status updated to ${status}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Xerox Payment status (Staff & Admin)
// @route   PUT /api/xerox/:id/payment
exports.updateXeroxPayment = async (req, res, next) => {
  try {
    const { paymentStatus, paymentMethod } = req.body;

    const order = await XeroxOrder.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Xerox order not found.',
      });
    }

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
      if (paymentStatus === 'PAID') {
        order.paymentReceivedAt = new Date();
      }
    }

    if (paymentMethod) {
      order.paymentMethod = paymentMethod;
    }

    await order.save();

    res.json({
      success: true,
      message: `Xerox payment status updated to ${order.paymentStatus}.`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel student Xerox order (Student only when PENDING)
// @route   PUT /api/xerox/:id/cancel
exports.cancelMyXeroxOrder = async (req, res, next) => {
  try {
    const order = await XeroxOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Xerox order not found.',
      });
    }

    if (order.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized to cancel this Xerox pre-order.',
      });
    }

    if (order.status !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order with status "${order.status}". Only PENDING Xerox orders can be cancelled by students.`,
      });
    }

    order.status = 'CANCELLED';
    order.statusHistory.push({
      status: 'CANCELLED',
      timestamp: new Date(),
      note: 'Cancelled by student prior to printing.',
      updatedBy: req.user._id,
    });

    await order.save();

    // Alert staff
    await Notification.create({
      targetRole: 'staff',
      title: 'Xerox Pre-Order Cancelled by Student',
      message: `Xerox pre-order #${order.orderNumber} was cancelled by ${req.user.name}.`,
      type: 'ORDER_UPDATE',
    });

    res.json({
      success: true,
      message: 'Your Xerox pre-order has been cancelled.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Secure document preview/download endpoint
// @route   GET /api/xerox/document/:id
exports.getSecureDocument = async (req, res, next) => {
  try {
    const order = await XeroxOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Xerox pre-order not found.',
      });
    }

    // Role check: Student can ONLY view their own document. Staff and Admin can view any.
    if (
      req.user.role === 'student' &&
      order.student.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Access Denied: You are not authorized to view this document.',
      });
    }

    const filePath = path.resolve(order.file.filePath);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: 'Document file not found on server storage.',
      });
    }

    res.setHeader('Content-Type', 'application/pdf');
    const disposition = req.query.download === 'true' ? 'attachment' : 'inline';
    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(order.file.originalName)}"`
    );

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    next(error);
  }
};

// @desc    Get Xerox Configuration & Pricing Settings
// @route   GET /api/xerox/settings
exports.getXeroxSettings = async (req, res, next) => {
  try {
    const settings = await XeroxSetting.getSettings();
    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Xerox Configuration & Pricing (Admin only)
// @route   PUT /api/xerox/settings
exports.updateXeroxSettings = async (req, res, next) => {
  try {
    const {
      bwPricePerPage,
      colorPricePerPage,
      doubleSidedDiscountPerPage,
      cornerStapleCharge,
      spiralBindingCharge,
      softBindingCharge,
    } = req.body;

    let settings = await XeroxSetting.findOne();
    if (!settings) {
      settings = new XeroxSetting({});
    }

    if (bwPricePerPage !== undefined) settings.bwPricePerPage = Number(bwPricePerPage);
    if (colorPricePerPage !== undefined) settings.colorPricePerPage = Number(colorPricePerPage);
    if (doubleSidedDiscountPerPage !== undefined)
      settings.doubleSidedDiscountPerPage = Number(doubleSidedDiscountPerPage);
    if (cornerStapleCharge !== undefined) settings.cornerStapleCharge = Number(cornerStapleCharge);
    if (spiralBindingCharge !== undefined) settings.spiralBindingCharge = Number(spiralBindingCharge);
    if (softBindingCharge !== undefined) settings.softBindingCharge = Number(softBindingCharge);

    settings.updatedBy = req.user._id;
    await settings.save();

    res.json({
      success: true,
      message: 'Xerox printing prices updated successfully!',
      settings,
    });
  } catch (error) {
    next(error);
  }
};
