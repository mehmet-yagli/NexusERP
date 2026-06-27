const mongoose = require('mongoose');

const movementSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['Giriş', 'Çıkış'], required: true },
  quantity: { type: Number, required: true },
  reason: { type: String, default: 'Stok Güncelleme' }, // Örn: Satın Alma, İade, Sayım Farkı
}, { timestamps: true });

module.exports = mongoose.model('Movement', movementSchema);