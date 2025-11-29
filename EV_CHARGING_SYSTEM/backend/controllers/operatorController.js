const { getPool, sql } = require('../config/database');

// Get all stations with detailed status for operator dashboard
const getStationsForOperator = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        s.station_id,
        s.station_name,
        s.gps_coordinates,
        s.opening_time,
        s.closing_time,
        a.street,
        a.city,
        a.state,
        a.postal_code,
        a.country,
        COUNT(cp.charge_point_id) as total_charge_points,
        SUM(CASE WHEN cp.status = 'Available' THEN 1 ELSE 0 END) as available_points,
        SUM(CASE WHEN cp.status = 'In Use' THEN 1 ELSE 0 END) as in_use_points,
        SUM(CASE WHEN cp.status = 'Out of Service' THEN 1 ELSE 0 END) as out_of_service_points
      FROM Station s
      JOIN Address a ON s.address_id = a.address_id
      LEFT JOIN Charge_Point cp ON s.station_id = cp.station_id
      GROUP BY s.station_id, s.station_name, s.gps_coordinates, s.opening_time, s.closing_time,
               a.street, a.city, a.state, a.postal_code, a.country
      ORDER BY s.station_name
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching stations for operator:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

// Get all charge points for a specific station
const getChargePointsByStation = async (req, res) => {
  try {
    const { stationId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('station_id', sql.Int, stationId)
      .query(`
        SELECT 
          cp.charge_point_id,
          cp.station_id,
          cp.charger_type,
          cp.status,
          cp.power_rating,
          s.station_name
        FROM Charge_Point cp
        JOIN Station s ON cp.station_id = s.station_id
        WHERE cp.station_id = @station_id
        ORDER BY cp.charge_point_id
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching charge points:', error);
    res.status(500).json({ error: 'Failed to fetch charge points' });
  }
};

// Update charge point status (Available/Out of Service)
const updateChargePointStatus = async (req, res) => {
  try {
    const { chargePointId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['Available', 'Out of Service'].includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status. Must be "Available" or "Out of Service"' 
      });
    }

    const pool = getPool();
    
    // Check if charge point exists
    const checkResult = await pool.request()
      .input('charge_point_id', sql.Int, chargePointId)
      .query(`
        SELECT charge_point_id, status 
        FROM Charge_Point 
        WHERE charge_point_id = @charge_point_id
      `);

    if (checkResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Charge point not found' });
    }

    // Update status
    await pool.request()
      .input('charge_point_id', sql.Int, chargePointId)
      .input('status', sql.NVarChar(20), status)
      .query(`
        UPDATE Charge_Point 
        SET status = @status 
        WHERE charge_point_id = @charge_point_id
      `);

    // Fetch updated charge point
    const updatedResult = await pool.request()
      .input('charge_point_id', sql.Int, chargePointId)
      .query(`
        SELECT 
          cp.charge_point_id,
          cp.station_id,
          cp.charger_type,
          cp.status,
          cp.power_rating
        FROM Charge_Point cp
        WHERE cp.charge_point_id = @charge_point_id
      `);

    res.json({
      message: 'Charge point status updated successfully',
      chargePoint: updatedResult.recordset[0]
    });
  } catch (error) {
    console.error('Error updating charge point status:', error);
    res.status(500).json({ error: 'Failed to update charge point status' });
  }
};

// Get maintenance records for a station
const getMaintenanceRecords = async (req, res) => {
  try {
    const { stationId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('station_id', sql.Int, stationId)
      .query(`
        SELECT 
          mr.record_id,
          mr.charge_point_id,
          mr.maintenance_date,
          mr.description,
          mr.status,
          cp.charger_type,
          cp.power_rating,
          p.first_name + ' ' + p.last_name as technician_name
        FROM Maintenance_Record mr
        JOIN Charge_Point cp ON mr.charge_point_id = cp.charge_point_id
        JOIN Technician t ON mr.technician_id = t.technician_id
        JOIN Person p ON t.technician_id = p.person_id
        WHERE cp.station_id = @station_id
        ORDER BY mr.maintenance_date DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching maintenance records:', error);
    res.status(500).json({ error: 'Failed to fetch maintenance records' });
  }
};

module.exports = {
  getStationsForOperator,
  getChargePointsByStation,
  updateChargePointStatus,
  getMaintenanceRecords
};
