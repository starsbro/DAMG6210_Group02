const express = require('express');
const router = express.Router();
const {
  getAllStations,
  getStationById,
  getChargePointsByStation
} = require('../controllers/stationController');

// GET /api/stations - Get all stations
router.get('/', getAllStations);

// GET /api/stations/:id - Get station by ID
router.get('/:id', getStationById);

// GET /api/stations/:id/charge-points - Get charge points for a station
router.get('/:id/charge-points', getChargePointsByStation);

module.exports = router;
