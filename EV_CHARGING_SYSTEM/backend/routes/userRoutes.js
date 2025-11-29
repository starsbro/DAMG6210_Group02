const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  getUserAddresses,
  getUserDashboard
} = require('../controllers/userController');

// GET /api/users/:id - Get user profile by ID
router.get('/:id/profile', getUserProfile);

// GET /api/users/:id - Get user profile by ID (duplicate for compatibility)
router.get('/:id', getUserProfile);

// GET /api/users/:id/addresses - Get user addresses
router.get('/:id/addresses', getUserAddresses);

// GET /api/users/:id/dashboard - Get user dashboard stats
router.get('/:id/dashboard', getUserDashboard);

module.exports = router;
