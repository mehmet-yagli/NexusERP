const AuditLog = require('../models/AuditLog');

// Tüm Sistem İz Kayıtlarını (Audit Logs) Getir
exports.getAuditLogs = async (req, res) => {
  try {
    // Logları tarihe göre en yeniden eskiye sırala (.sort)
    // İşlemi yapan kullanıcının adını getir (.populate)
    // Performans için son 100 kaydı getir (.limit)
    const logs = await AuditLog.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(100); 

    res.status(200).json(logs);
  } catch (error) {
    res.status(500).json({ message: 'Sistem logları getirilirken hata oluştu.', error: error.message });
  }
};