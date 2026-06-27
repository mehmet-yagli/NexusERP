const express = require('express');
const { 
  getUsers, 
  updateUserRole, 
  updateProfile, 
  updatePassword, 
  updateNotifications 
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Giriş şartı
router.use(protect); 

// Kendi hesap ayarlarını yap
router.put('/profile', updateProfile);
router.put('/change-password', updatePassword);
router.put('/notifications', updateNotifications);

// Admine özel routes lar
router.get('/', authorize('Admin'), getUsers);
router.put('/:id/role', authorize('Admin'), updateUserRole);

module.exports = router;