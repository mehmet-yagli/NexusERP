const mongoose = require('mongoose');

const assetSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: [true, 'Demirbaş adı zorunludur.'] 
  },
  sku: { 
    type: String, 
    required: true, 
    unique: true 
  },
  category: { 
    type: String, 
    enum: ['Elektronik', 'Mobilya', 'Makine', 'Araç', 'Diğer'],
    required: true 
  },
  purchasePrice: { 
    type: Number, 
    required: true 
  },
  purchaseDate: { 
    type: Date, 
    required: true 
  },
  salvageValue: { 
    type: Number, 
    default: 0 
  },
  usefulLife: { 
    type: Number, 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['Aktif', 'Bakımda', 'Hurdaya Ayrıldı', 'Kayıp'],
    default: 'Aktif'
  },
  assignedTo: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('Asset', assetSchema);