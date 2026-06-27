const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. Kullanıcı Kaydı (Register)
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // E-posta var mı
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Bu e-posta adresi zaten kullanımda.' });
    }

    // Hashing şifreye
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Yeni kullanıcıyı oluşturma
    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      role
    });

    const savedUser = await newUser.save();
    res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu.' });

  } catch (error) {
    res.status(500).json({ message: 'Kullanıcı kaydedilirken hata oluştu.', error: error.message });
  }
};

// 2. Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Kullanıcı var mı
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
    }

    // Şifre doğru mu 
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: 'Geçersiz şifre.' });
    }

    // JWT Token Oluşturma
    // Tokenla sisteme giriş yaptı mı testi derste gördük
    const token = jwt.sign(
      { id: user._id, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' } // 1 gün token süresi
    );

    res.status(200).json({ 
      message: 'Giriş başarılı.', 
      token, 
      user: { id: user._id, name: user.name, email: user.email, role: user.role } 
    });

  } catch (error) {
    res.status(500).json({ message: 'Giriş yapılırken hata oluştu.', error: error.message });
  }
};