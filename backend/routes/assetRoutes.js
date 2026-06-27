const express = require('express');
const router = express.Router();
const assetController = require('../controllers/assetController');

// URL: POST /api/assets  Yeni demirbaş ekler
router.post('/', assetController.createAsset);

// URL: GET /api/assets  Demirbaşları amortisman hesaplanmış şekilde getirir
router.get('/', assetController.getAssets);

module.exports = router;