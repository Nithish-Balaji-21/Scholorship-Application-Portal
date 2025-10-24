const express = require('express');
const {
  getProfile,
  updateProfile,
  deleteProfile,
  getSavedScholarships,
  getApplications,
  uploadAvatar,
  changePassword
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// Profile routes
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.delete('/profile', deleteProfile);
router.post('/upload-avatar', uploadAvatar);
router.put('/change-password', changePassword);

// User data routes
router.get('/saved-scholarships', getSavedScholarships);
router.get('/applications', getApplications);

module.exports = router;