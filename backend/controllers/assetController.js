const Asset = require('../models/Asset');

// 1. Yeni Demirbaş Ekleme 
exports.createAsset = async (req, res) => {
  try {
    const assetData = req.body;
    
    // Aynı SKU kodu var mı kontrol et
    const existingAsset = await Asset.findOne({ sku: assetData.sku });
    if (existingAsset) {
      return res.status(400).json({ message: 'Bu demirbaş kodu ile zaten bir kayıt var.' });
    }

    const newAsset = new Asset(assetData);
    const savedAsset = await newAsset.save();
    
    res.status(201).json({ message: 'Demirbaş başarıyla eklendi.', asset: savedAsset });
  } catch (error) {
    res.status(500).json({ message: 'Demirbaş eklenirken hata oluştu.', error: error.message });
  }
};

// 2. Tüm Demirbaşları Listeleme ve Amortisman Hesaplama excel ve pdf için mantıklı olur
exports.getAssets = async (req, res) => {
  try {
    const assets = await Asset.find().sort({ createdAt: -1 });
    
    // Her bir demirbaş için anlık değer hesaplaması (Amortisman Algoritması sonuçta bir hurda değeri ekledik anasayfada güzel ve doğru grafik çıktı)
    const assetsWithDepreciation = assets.map(asset => {
      // Mongoose dökümanını normal JSON objesine çeviriyoruz ki içine yeni alan ekleyebileyim
      const assetObj = asset.toObject(); 
      
      const currentDate = new Date();
      const purchaseDate = new Date(asset.purchaseDate);
      
      const elapsedYears = (currentDate - purchaseDate) / (1000 * 60 * 60 * 24 * 365.25);
      
      // Değer hesaplama algosu
      const yearlyDepreciation = (asset.purchasePrice - asset.salvageValue) / asset.usefulLife;
      
      // Toplam birikmiş amortisman (Değer kaybı)
      let accumulatedDepreciation = yearlyDepreciation * elapsedYears;
      
      // Hurda değerine düşmüşse 
      if (elapsedYears >= asset.usefulLife) {
        accumulatedDepreciation = asset.purchasePrice - asset.salvageValue;
      }
      
      // Şu anki değer
      const currentValue = asset.purchasePrice - accumulatedDepreciation;
      
      // Frontende veri gönderiyoruz grafik içinde
      assetObj.currentValue = Math.max(currentValue, asset.salvageValue).toFixed(2);
      assetObj.accumulatedDepreciation = accumulatedDepreciation.toFixed(2);
      
      return assetObj;
    });

    res.status(200).json(assetsWithDepreciation);
  } catch (error) {
    res.status(500).json({ message: 'Demirbaşlar getirilirken hata oluştu.', error: error.message });
  }
};