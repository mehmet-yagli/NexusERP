const User = require('../models/User');
const bcrypt = require('bcryptjs'); // Şifreleri şifrelemek için indirdiğim kütüphane kullanımı 

// 1. Admine özel tüm kullanıcıları getir
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Şifreler hariç 
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Kullanıcılar getirilemedi.' });
  }
};

// 2. Kullanıcı Rolünü Güncelle (Sadece Admin)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    
    // Admin kendi kendini personel yapamasın (Sistem adminsiz kalmasın)
    if (req.params.id === req.user.id.toString() && role !== 'Admin') {
      return res.status(400).json({ success: false, message: 'Kendi admin yetkinizi kaldıramazsınız.' });
    }

    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true, runValidators: true });
    
    if (!user) return res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı.' });
    res.status(200).json({ success: true, data: user, message: 'Yetki güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Yetki güncellenemedi.' });
  }
};

// 3. Profil Bilgilerini Güncelle (Herkes kendi profilini)
exports.updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(req.user.id, { name, email }, { new: true, runValidators: true });
    res.status(200).json({ success: true, data: user, message: 'Profil başarıyla güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Profil güncellenemedi.' });
  }
};

// 4. Şifre Değiştir (Herkes kendi şifresini)
exports.updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Kullanıcıyı şifresiyle birlikte bul
    const user = await User.findById(req.user.id).select('+password');

    // Mevcut şifreyi kontrol et
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Mevcut şifreniz yanlış.' });
    }

    // Yeni şifreyi hash'le ve kaydet
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.status(200).json({ success: true, message: 'Şifreniz başarıyla değiştirildi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Şifre güncellenirken sunucu hatası.' });
  }
};

// 5. Bildirim Tercihlerini Kaydet
exports.updateNotifications = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.user.id, { notifications: req.body }, { new: true });
    res.status(200).json({ success: true, data: user.notifications, message: 'Bildirimler güncellendi.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Ayarlar kaydedilemedi.' });
  }
};