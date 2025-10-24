const express = require('express');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getUserStats,
  getAllApplications,
  getApplicationById,
  reviewApplication,
  getApplicationStats,
  getAllScholarships,
  getScholarshipStats,
  getAllOrganizations,
  getOrganizationStats,
  getDashboardStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(adminOnly);

// Dashboard overview
router.get('/dashboard/stats', getDashboardStats);

// User management routes
router.get('/users', getAllUsers);
router.get('/users/stats', getUserStats);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

// Application management routes
router.get('/applications', getAllApplications);
router.get('/applications/stats', getApplicationStats);
router.get('/applications/:id', getApplicationById);
router.put('/applications/:id/review', reviewApplication);

// Scholarship management routes
router.get('/scholarships', getAllScholarships);
router.get('/scholarships/stats', getScholarshipStats);

// Organization management routes
router.get('/organizations', getAllOrganizations);
router.get('/organizations/stats', getOrganizationStats);

module.exports = router;