const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // Örn: "ÜRÜN_SİLİNDİ", "YETKİ_GÜNCELLENDİ"
  module: { type: String, required: true }, // Örn: "Stok", "Demirbaş", "Ayarlar"
  details: { type: String }, // Örn: "iPhone 13 ürünü silindi."
  ipAddress: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);