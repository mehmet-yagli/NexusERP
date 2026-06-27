const express = require('express');
const router = express.Router();
const maintenanceController = require('../controllers/maintenanceController');

router.post('/', maintenanceController.createMaintenance);

router.get('/:assetId', maintenanceController.getMaintenancesByAsset);

module.exports = router;