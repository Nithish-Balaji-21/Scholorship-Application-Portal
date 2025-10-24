const express = require('express');
const {
  getOrganizations,
  getOrganization,
  createOrganization,
  updateOrganization,
  deleteOrganization
} = require('../controllers/organizationController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/role');

const router = express.Router();

// Public routes
router.get('/', getOrganizations);
router.get('/:id', getOrganization);

// Protected routes - Admin only
router.post('/', protect, adminOnly, createOrganization);
router.put('/:id', protect, adminOnly, updateOrganization);
router.delete('/:id', protect, adminOnly, deleteOrganization);

module.exports = router;