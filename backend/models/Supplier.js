const mongoose = require('mongoose');

const supplierSchema = new mongoose.Schema({
  name: { type: String, required: true },
  contactName: { type: String }, 
  email: { type: String },
  phone: { type: String },
  address: { type: String },
  status: { 
    type: String, 
    enum: ['Aktif', 'Pasif'], 
    default: 'Aktif' 
  } 
}, { timestamps: true });

module.exports = mongoose.model('Supplier', supplierSchema);