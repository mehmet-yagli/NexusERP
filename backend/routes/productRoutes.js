const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// İşlemi kim yaptı diye 
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/', protect, authorize('Admin'), productController.createProduct);

router.get('/', protect, productController.getProducts);

router.put('/:id', protect, authorize('Admin'), productController.updateProduct);

router.delete('/:id', protect, authorize('Admin'), productController.deleteProduct);

// stok geçmişi getirmek için
router.get('/:id/movements', protect, productController.getProductMovements);

module.exports = router;