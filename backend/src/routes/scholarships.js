const express = require('express');
const {
  getScholarships,
  getScholarship,
  createScholarship,
  updateScholarship,
  deleteScholarship,
  saveScholarship,
  unsaveScholarship,
  getFilters
} = require('../controllers/scholarshipController');
const { protect, optionalAuth } = require('../middleware/auth');
const { authorize, adminOnly, studentOnly } = require('../middleware/role');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, getScholarships);
router.get('/filters', getFilters);
router.get('/:id', getScholarship);

// Protected routes - Admin only
router.post('/', protect, adminOnly, createScholarship);
router.put('/:id', protect, adminOnly, updateScholarship);
router.delete('/:id', protect, adminOnly, deleteScholarship);

// Protected routes - Students only
router.post('/:id/save', protect, studentOnly, saveScholarship);
router.delete('/:id/save', protect, studentOnly, unsaveScholarship);

module.exports = router;