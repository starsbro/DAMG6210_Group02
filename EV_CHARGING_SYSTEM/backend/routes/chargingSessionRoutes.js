const express = require('express');
const router = express.Router();
const {
  getUserChargingSessions,
  getChargingSessionById
} = require('../controllers/chargingSessionController');

// GET /api/charging-sessions/user/:userId - Get user sessions
router.get('/user/:userId', getUserChargingSessions);

// GET /api/charging-sessions/:id - Get session by ID
router.get('/:id', getChargingSessionById);

module.exports = router;
