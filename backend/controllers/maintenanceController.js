const Maintenance = require('../models/Maintenance');
const Asset = require('../models/Asset');

// 1. Bir Demirbaşa Yeni Bakım Kaydı Ekleme 
exports.createMaintenance = async (req, res) => {
  try {
    const { assetId, description, cost, performedBy } = req.body;

    // Veritabanında var mı bu demirbaş
    const assetExists = await Asset.findById(assetId);
    if (!assetExists) {
      return res.status(404).json({ message: 'Bakım eklenecek demirbaş bulunamadı.' });
    }

    const newMaintenance = new Maintenance({
      asset: assetId,
      description,
      cost,
      performedBy
    });

    const savedMaintenance = await newMaintenance.save();

    assetExists.status = 'Aktif'; 
    await assetExists.save();

    res.status(201).json({ message: 'Bakım kaydı başarıyla eklendi.', maintenance: savedMaintenance });
  } catch (error) {
    res.status(500).json({ message: 'Bakım kaydı eklenirken hata oluştu.', error: error.message });
  }
};

// 2. Belirli Bir Demirbaşın Tüm Bakım Geçmişini Getirme 
exports.getMaintenancesByAsset = async (req, res) => {
  try {
    const { assetId } = req.params;

    // Sadece o assetId'ye ait bakım kayıtlarını getirir ve tarihe göre en yenisi üstte olacak şekilde sıralar
    const maintenances = await Maintenance.find({ asset: assetId }).sort({ maintenanceDate: -1 });
    
    res.status(200).json(maintenances);
  } catch (error) {
    res.status(500).json({ message: 'Bakım kayıtları getirilirken hata oluştu.', error: error.message });
  }
};