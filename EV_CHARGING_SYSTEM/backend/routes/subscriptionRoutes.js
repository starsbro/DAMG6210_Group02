const express = require('express');
const router = express.Router();
const {
  getAllPlans,
  getUserSubscription
} = require('../controllers/subscriptionController');

// GET /api/subscriptions/plans - Get all subscription plans
router.get('/plans', getAllPlans);

// GET /api/subscriptions/user/:userId - Get user subscription
router.get('/user/:userId', getUserSubscription);

module.exports = router;
