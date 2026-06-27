const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Rotaları İçe Aktar 
const productRoutes = require('./routes/productRoutes');
const assetRoutes = require('./routes/assetRoutes'); 
const authRoutes = require('./routes/authRoutes'); 
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const supplierRoutes = require('./routes/supplierRoutes'); 
const aiRoutes = require('./routes/aiRoutes'); 
const userRoutes = require('./routes/userRoutes'); 
const auditRoutes = require('./routes/auditRoutes'); 

const app = express();

// Middleware'ler
app.use(cors()); // Frontend ile backend'in haberleşmesi
app.use(express.json()); // Gelen JSON verilerini okumamızı sağlar

// Rotaları Kullan 
app.use('/api/products', productRoutes);
app.use('/api/assets', assetRoutes); 
app.use('/api/auth', authRoutes); 
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/suppliers', supplierRoutes); 
app.use('/api/ai', aiRoutes); 
app.use('/api/users', userRoutes); 
app.use('/api/audit-logs', auditRoutes); 

//kontrol
app.get('/', (req, res) => {
  res.send('Envanter ve Demirbaş Yönetim API çalışıyor!');
});

// Hata yönetimi
app.use((err, req, res, next) => {
  console.error("Sistem Hatası:", err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Sunucu tarafında beklenmeyen bir hata oluştu.',
  });
});

// MongoDB Bağlantısı
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB veritabanına başarıyla bağlanıldı.');
    // Sunucuyu başlat
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`🚀 Sunucu ${PORT} portunda çalışıyor.`);
    });
  })
  .catch((error) => {
    console.log('❌ MongoDB bağlantı hatası:', error.message);
  });