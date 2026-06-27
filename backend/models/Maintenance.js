const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  asset: { // Hangi demirbaşa bakım yapılıyor? (Asset modeline referans)
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Asset',
    required: true
  },
  description: { // Bakımda ne yapıldı? 
    type: String, 
    required: true 
  },
  cost: { // Bakım masrafı
    type: Number, 
    default: 0 
  },
  maintenanceDate: { // Bakım ne zaman yapıldı?
    type: Date, 
    default: Date.now 
  },
  performedBy: { // Bakımı hangi teknik servis yaptı?
    type: String 
  }
}, { timestamps: true });

module.exports = mongoose.model('Maintenance', maintenanceSchema);