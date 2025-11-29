const express = require('express');
const router = express.Router();
const {
  getUserVehicles,
  getVehicleById
} = require('../controllers/vehicleController');

// GET /api/vehicles/user/:userId - Get all vehicles for a user
router.get('/user/:userId', getUserVehicles);

// GET /api/vehicles/:id - Get vehicle by ID
router.get('/:id', getVehicleById);

module.exports = router;
