const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} = require('../controllers/productController');
const { verifyToken, checkRole } = require('../middleware/auth');

router.get('/meta/categories', getCategories);
router.get('/', getProducts);
router.get('/:id', getProductById);

// Staff and Admin routes
router.post('/', verifyToken, checkRole('staff', 'admin'), createProduct);
router.put('/:id', verifyToken, checkRole('staff', 'admin'), updateProduct);
router.delete('/:id', verifyToken, checkRole('staff', 'admin'), deleteProduct);

module.exports = router;
