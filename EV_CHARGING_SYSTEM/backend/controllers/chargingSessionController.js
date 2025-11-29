const { getPool, sql } = require('../config/database');

// Get all charging sessions for a user
const getUserChargingSessions = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT 
          cs.session_id,
          cs.start_time,
          cs.end_time,
          cs.energy_consumed,
          cs.total_cost,
          v.license_plate,
          v.brand,
          v.model,
          cp.charger_type,
          cp.power_rating,
          s.station_name,
          a.city,
          a.state
        FROM Charging_Session cs
        JOIN User_Subscription us ON cs.user_subscription_id = us.user_subscription_id
        JOIN Vehicle v ON cs.vehicle_id = v.vehicle_id
        JOIN Charge_Point cp ON cs.charge_point_id = cp.charge_point_id
        JOIN Station s ON cp.station_id = s.station_id
        JOIN Address a ON s.address_id = a.address_id
        WHERE us.user_id = @user_id
        ORDER BY cs.start_time DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching charging sessions:', error);
    res.status(500).json({ error: 'Failed to fetch charging sessions' });
  }
};

// Get charging session by ID
const getChargingSessionById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('session_id', sql.Int, id)
      .query(`
        SELECT 
          cs.session_id,
          cs.start_time,
          cs.end_time,
          cs.energy_consumed,
          cs.total_cost,
          v.vehicle_id,
          v.license_plate,
          v.brand,
          v.model,
          cp.charge_point_id,
          cp.charger_type,
          cp.power_rating,
          s.station_id,
          s.station_name,
          a.street,
          a.city,
          a.state,
          a.postal_code
        FROM Charging_Session cs
        JOIN Vehicle v ON cs.vehicle_id = v.vehicle_id
        JOIN Charge_Point cp ON cs.charge_point_id = cp.charge_point_id
        JOIN Station s ON cp.station_id = s.station_id
        JOIN Address a ON s.address_id = a.address_id
        WHERE cs.session_id = @session_id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Charging session not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching charging session:', error);
    res.status(500).json({ error: 'Failed to fetch charging session' });
  }
};

module.exports = {
  getUserChargingSessions,
  getChargingSessionById
};
