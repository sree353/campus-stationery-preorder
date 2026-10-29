const express = require('express');
const router = express.Router();
const {
  getInventoryOverview,
  quickRestock,
  updateThreshold,
  getInventoryLogs,
} = require('../controllers/inventoryController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.use(verifyToken);
router.use(checkRole('staff', 'admin'));

router.get('/overview', getInventoryOverview);
router.post('/restock', quickRestock);
router.put('/:id/threshold', updateThreshold);
router.get('/logs', getInventoryLogs);

module.exports = router;
