const express = require('express');
const {
  getMyApplications,
  getApplication,
  createApplication,
  updateApplication,
  submitApplication,
  getAllApplications,
  updateApplicationStatus
} = require('../controllers/applicationController');
const { protect } = require('../middleware/auth');
const { authorize, adminOnly, studentOnly } = require('../middleware/role');

const router = express.Router();

// Student routes - specific routes MUST come before parameterized routes
router.get('/my-applications', protect, studentOnly, getMyApplications);
router.get('/', protect, studentOnly, getMyApplications);
router.post('/', protect, studentOnly, createApplication);
router.post('/:id/submit', protect, studentOnly, submitApplication);
router.put('/:id', protect, studentOnly, updateApplication);

// Admin routes - specific routes MUST come before parameterized routes
router.get('/admin/all', protect, adminOnly, getAllApplications);
router.put('/:id/status', protect, adminOnly, updateApplicationStatus);

// Parameterized routes MUST come last to avoid conflicts
router.get('/:id', protect, getApplication);

module.exports = router;