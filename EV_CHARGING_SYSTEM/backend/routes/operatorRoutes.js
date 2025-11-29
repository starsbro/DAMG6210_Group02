const express = require('express');
const router = express.Router();
const operatorController = require('../controllers/operatorController');

// Get all stations for operator dashboard
router.get('/stations', operatorController.getStationsForOperator);

// Get charge points for a specific station
router.get('/stations/:stationId/charge-points', operatorController.getChargePointsByStation);

// Update charge point status
router.put('/charge-points/:chargePointId/status', operatorController.updateChargePointStatus);

// Get maintenance records for a station
router.get('/stations/:stationId/maintenance', operatorController.getMaintenanceRecords);

module.exports = router;
