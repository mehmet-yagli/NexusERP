const jwt = require('jsonwebtoken');
const User = require('../models/User');

// 1. Kullanıcı Giriş Yapmış mı Kontrolü
exports.protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Bu işlem için giriş yapmalısınız.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'gizli_anahtariniz_buraya');
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Oturum süreniz dolmuş veya geçersiz token.' });
  }
};

// 2. Rol Bazlı Yetkilendirme (Sadece Admin girebilir)
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `${req.user.role} rolü bu işleme erişmek için yetkisizdir.` 
      });
    }
    next();
  };
};