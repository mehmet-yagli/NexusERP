const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');

// GET /api/ai/insights adresine gelen istekleri Controller'a yönlendir (Dashboard Özeti)
router.get('/insights', aiController.getInventoryInsights);

// POST /api/ai/ask adresine gelen istekleri Controller'a yönlendir (Etkileşimli Soru-Cevap)
// Bu rota, kullanıcının sorduğu soruları veya otomatik analiz taleplerini işler.
router.post('/ask', aiController.askNexusAI);

module.exports = router;