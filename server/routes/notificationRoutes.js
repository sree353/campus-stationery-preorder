const express = require('express');
const router = express.Router();
const {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
  createBroadcast,
} = require('../controllers/notificationController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);

router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:id/read', markAsRead);
router.post('/broadcast', checkRole('staff', 'admin'), createBroadcast);

module.exports = router;
