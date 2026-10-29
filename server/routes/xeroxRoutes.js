const express = require('express');
const router = express.Router();
const {
  uploadMiddleware,
  previewPdf,
  createXeroxOrder,
  getMyXeroxOrders,
  getAllXeroxOrders,
  getXeroxOrderById,
  updateXeroxOrderStatus,
  updateXeroxPayment,
  cancelMyXeroxOrder,
  getSecureDocument,
  getXeroxSettings,
  updateXeroxSettings,
} = require('../controllers/xeroxController');
const { verifyToken, checkRole } = require('../middleware/auth');

// Public/authenticated settings read
router.get('/settings', getXeroxSettings);

// Require authentication for all subsequent endpoints
router.use(verifyToken);

// PDF preview endpoint (calculates page count without creating order)
router.post('/preview-pdf', uploadMiddleware, previewPdf);

// Student endpoints
router.post('/', checkRole('student'), uploadMiddleware, createXeroxOrder);
router.get('/my-orders', checkRole('student'), getMyXeroxOrders);
router.put('/:id/cancel', checkRole('student'), cancelMyXeroxOrder);

// Staff & Admin endpoints
router.get('/', checkRole('staff', 'admin'), getAllXeroxOrders);
router.put('/:id/status', checkRole('staff', 'admin'), updateXeroxOrderStatus);
router.put('/:id/payment', checkRole('staff', 'admin'), updateXeroxPayment);

// Admin-only Xerox pricing configuration
router.put('/settings', checkRole('admin'), updateXeroxSettings);

// Secure document view & download (verifies ownership or staff/admin role)
router.get('/document/:id', getSecureDocument);

// Get single order details
router.get('/:id', getXeroxOrderById);

module.exports = router;
