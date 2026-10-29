const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  updatePaymentStatus,
  cancelMyOrder,
} = require('../controllers/orderController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

router.post('/', checkRole('student'), createOrder);
router.get('/my-orders', checkRole('student'), getMyOrders);
router.put('/:id/cancel', checkRole('student'), cancelMyOrder);

router.get('/', checkRole('staff', 'admin'), getAllOrders);
router.put('/:id/status', checkRole('staff', 'admin'), updateOrderStatus);
router.put('/:id/payment', checkRole('staff', 'admin'), updatePaymentStatus);

router.get('/:id', getOrderById);

module.exports = router;
