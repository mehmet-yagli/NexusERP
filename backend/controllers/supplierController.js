const Supplier = require('../models/Supplier');

// Tüm Tedarikçileri Getir
exports.getSuppliers = async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });
    res.status(200).json(suppliers);
  } catch (error) {
    res.status(500).json({ message: "Tedarikçiler getirilemedi." });
  }
};

// Yeni Tedarikçi Oluştur
exports.createSupplier = async (req, res) => {
  try {
    const newSupplier = new Supplier(req.body);
    const savedSupplier = await newSupplier.save();
    res.status(201).json(savedSupplier);
  } catch (error) {
    console.log("Tedarikçi Kayıt Hatası:", error);
    res.status(500).json({ message: "Sunucu hatası: Tedarikçi kaydedilemedi." });
  }
};

// Tedarikçi Güncelle
exports.updateSupplier = async (req, res) => {
  try {
    const updatedSupplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedSupplier);
  } catch (error) {
    res.status(500).json({ message: "Tedarikçi güncellenemedi." });
  }
};

// Tedarikçi Sil
exports.deleteSupplier = async (req, res) => {
  try {
    await Supplier.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Tedarikçi başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ message: "Tedarikçi silinemedi." });
  }
};