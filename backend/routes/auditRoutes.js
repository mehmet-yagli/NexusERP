const express = require('express');
const router = express.Router();
const auditController = require('../controllers/auditController');

// Güvenlik katmanları
const { protect, authorize } = require('../middleware/authMiddleware');

// URL: GET /api/audit-logs  SADECE ADMİN GÖREBİLİR
router.get('/', protect, authorize('Admin'), auditController.getAuditLogs);

module.exports = router;