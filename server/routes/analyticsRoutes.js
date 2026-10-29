const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/analyticsController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(checkRole('staff', 'admin'));

router.get('/dashboard', getDashboardStats);

module.exports = router;
