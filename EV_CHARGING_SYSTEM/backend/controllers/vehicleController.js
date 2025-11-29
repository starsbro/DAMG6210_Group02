const { getPool, sql } = require('../config/database');

// Get all vehicles for a user
const getUserVehicles = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT 
          vehicle_id,
          license_plate,
          brand,
          model,
          battery_capacity,
          connector_type
        FROM Vehicle
        WHERE user_id = @user_id
        ORDER BY vehicle_id
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
};

// Get vehicle by ID
const getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('vehicle_id', sql.Int, id)
      .query(`
        SELECT 
          vehicle_id,
          user_id,
          license_plate,
          brand,
          model,
          battery_capacity,
          connector_type
        FROM Vehicle
        WHERE vehicle_id = @vehicle_id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
};

// Add a new vehicle
const addVehicle = async (req, res) => {
  try {
    const { user_id, license_plate, brand, model, battery_capacity, connector_type } = req.body;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('license_plate', sql.NVarChar, license_plate)
      .input('brand', sql.NVarChar, brand)
      .input('model', sql.NVarChar, model)
      .input('battery_capacity', sql.Decimal(8, 2), battery_capacity)
      .input('connector_type', sql.NVarChar, connector_type)
      .query(`
        INSERT INTO Vehicle (user_id, license_plate, brand, model, battery_capacity, connector_type)
        VALUES (@user_id, @license_plate, @brand, @model, @battery_capacity, @connector_type);
        SELECT SCOPE_IDENTITY() AS vehicle_id;
      `);
    
    res.status(201).json({ 
      message: 'Vehicle added successfully', 
      vehicle_id: result.recordset[0].vehicle_id 
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
};

module.exports = {
  getUserVehicles,
  getVehicleById,
  addVehicle
};
