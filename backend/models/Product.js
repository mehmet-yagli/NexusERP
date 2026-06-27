const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true }, // Barkod / Stok Kodu
  category: { type: String, required: true },
  quantity: { type: Number, required: true, default: 0 },
  minQuantity: { type: Number, required: true, default: 5 }, // Kritik stok uyarısı için
  price: { type: Number, required: true }, // Birim fiyat
  supplier: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Supplier' 
  }, // Tedarikçi tablosuna referans
  imageUrl: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);