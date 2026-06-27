const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true, // Aynı e-posta ile iki kez kayıt olunmasını engelle
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Personel'], // Sadece bu iki yetkiyi kabul et
    default: 'Personel'
  },
  // Kullanıcı Durumu 
  status: {
    type: String,
    enum: ['Aktif', 'Pasif'],
    default: 'Aktif'
  },
  // -Ayarlar sayfasındaki Bildirim Tercihleri 
  notifications: {
    criticalStock: { type: Boolean, default: true },
    dailyReport: { type: Boolean, default: false },
    aiAlerts: { type: Boolean, default: true },
    loginAlerts: { type: Boolean, default: false }
  }
}, { timestamps: true }); // Ne zaman kayıt olduğunu otomatik tutar

module.exports = mongoose.model('User', userSchema);