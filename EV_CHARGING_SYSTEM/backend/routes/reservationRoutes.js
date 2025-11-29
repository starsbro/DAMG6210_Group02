const express = require('express');
const router = express.Router();
const {
  getUserReservations,
  createReservation,
  cancelReservation,
  startChargingSession,
  stopChargingSession,
  getActiveSession
} = require('../controllers/reservationController');

// GET /api/reservations/user/:userId - Get user reservations
router.get('/user/:userId', getUserReservations);

// GET /api/reservations/user/:userId/active-session - Get active charging session
router.get('/user/:userId/active-session', getActiveSession);

// POST /api/reservations - Create new reservation
router.post('/', createReservation);

// POST /api/reservations/start-charging - Start charging session
router.post('/start-charging', startChargingSession);

// POST /api/reservations/stop-charging - Stop charging session and generate invoice
router.post('/stop-charging', stopChargingSession);

// DELETE /api/reservations/:id - Cancel reservation
router.delete('/:id', cancelReservation);

module.exports = router;
