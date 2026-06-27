const Product = require('../models/Product');
const Movement = require('../models/Movement'); // Stok Hareketleri Modeli direkt ürünler için
const AuditLog = require('../models/AuditLog'); // Sistem İz Kayıtları Modeli güvenlik için

// 1. Yeni Ürün Ekleme
exports.createProduct = async (req, res) => {
  try {
    const { name, sku, category, quantity, minQuantity, price, supplier } = req.body;

    // Güvenlik var mı bu ürün kodu 
    const existingProduct = await Product.findOne({ sku });
    if (existingProduct) {
      return res.status(400).json({ message: 'Bu stok kodu (SKU) ile zaten bir ürün kayıtlı.' });
    }

    const newProduct = new Product({
      name, sku, category, quantity, minQuantity, price, supplier
    });

    const savedProduct = await newProduct.save();

    // movement 
    if (savedProduct.quantity > 0) {
      await Movement.create({
        product: savedProduct._id,
        user: req.user.id, // İşlemi yapan kişi
        type: 'Giriş',
        quantity: savedProduct.quantity,
        reason: 'Yeni Ürün Ekleme (Sisteme Giriş)'
      });
    }

    // auditlog
    await AuditLog.create({
      user: req.user.id,
      action: 'ÜRÜN_EKLENDİ',
      module: 'Stok',
      details: `${savedProduct.name} (SKU: ${savedProduct.sku}) sisteme eklendi.`,
      ipAddress: req.ip || req.connection?.remoteAddress || 'Bilinmiyor'
    });

    res.status(201).json({ message: 'Ürün başarıyla eklendi.', product: savedProduct });
    
  } catch (error) {
    res.status(500).json({ message: 'Ürün eklenirken bir hata oluştu.', error: error.message });
  }
};

// 2. Tüm Ürünleri Listeleme 
exports.getProducts = async (req, res) => {
  try {
    // excel ve pdf için hem de site içi görünüş için sıralama 
    const products = await Product.find()
                                  .populate('supplier', 'name')
                                  .sort({ createdAt: -1 });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ message: 'Ürünler getirilirken hata oluştu.', error: error.message });
  }
};

// 3. Ürün Güncelleme 
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Stok farkını bulmak için önce eski ürünü çekiyoruz
    const oldProduct = await Product.findById(id);
    if (!oldProduct) {
      return res.status(404).json({ message: 'Güncellenecek ürün bulunamadı.' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
    //  Stok miktarında değişim varsa Logla
    const quantityDifference = updatedProduct.quantity - oldProduct.quantity;
    if (quantityDifference !== 0) {
      await Movement.create({
        product: updatedProduct._id,
        user: req.user.id,
        type: quantityDifference > 0 ? 'Giriş' : 'Çıkış',
        quantity: Math.abs(quantityDifference), 
        reason: 'Manuel Stok Güncellemesi'
      });
    }

    //  Sistem İz Kaydı (Audit Log)
    await AuditLog.create({
      user: req.user.id,
      action: 'ÜRÜN_GÜNCELLENDİ',
      module: 'Stok',
      details: `${updatedProduct.name} ürünü güncellendi.`,
      ipAddress: req.ip || req.connection?.remoteAddress || 'Bilinmiyor'
    });
    
    res.status(200).json({ message: 'Ürün başarıyla güncellendi.', product: updatedProduct });
  } catch (error) {
    res.status(500).json({ message: 'Ürün güncellenirken hata oluştu.', error: error.message });
  }
};

// 4. Ürün Silme (DELETE)
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Silinecek ürün bulunamadı.' });
    }

    //  Sistem İz Kaydı (Audit Log)
    await AuditLog.create({
      user: req.user.id,
      action: 'ÜRÜN_SİLİNDİ',
      module: 'Stok',
      details: `${deletedProduct.name} (SKU: ${deletedProduct.sku}) sistemden silindi.`,
      ipAddress: req.ip || req.connection?.remoteAddress || 'Bilinmiyor'
    });
    
    res.status(200).json({ message: 'Ürün başarıyla silindi.' });
  } catch (error) {
    res.status(500).json({ message: 'Ürün silinirken hata oluştu.', error: error.message });
  }
};
// 5. Belirli Bir Ürünün Stok Geçmişini Getirme 
exports.getProductMovements = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Movement tablosunda bu ürüne ait olan kayıtları bul, yapan kişinin adını (user.name) ekle ve en yeniden eskiye sırala
    const movements = await Movement.find({ product: id })
                                    .populate('user', 'name') 
                                    .sort({ createdAt: -1 }); 
                                    
    res.status(200).json(movements);
  } catch (error) {
    res.status(500).json({ message: 'Stok geçmişi getirilirken hata oluştu.', error: error.message });
  }
};