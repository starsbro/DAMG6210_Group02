const { getPool, sql } = require('../config/database');

// Get all stations with charge points
const getAllStations = async (req, res) => {
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
    console.error('Error fetching stations:', error);
    res.status(500).json({ error: 'Failed to fetch stations' });
  }
};

// Get station by ID with detailed charge point info
const getStationById = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    
    // Get station details
    const stationResult = await pool.request()
      .input('station_id', sql.Int, id)
      .query(`
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
          a.country
        FROM Station s
        JOIN Address a ON s.address_id = a.address_id
        WHERE s.station_id = @station_id
      `);

    if (stationResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Station not found' });
    }

    // Get charge points for this station
    const chargePointsResult = await pool.request()
      .input('station_id', sql.Int, id)
      .query(`
        SELECT 
          charge_point_id,
          charger_type,
          status,
          power_rating
        FROM Charge_Point
        WHERE station_id = @station_id
        ORDER BY charge_point_id
      `);

    const station = stationResult.recordset[0];
    station.charge_points = chargePointsResult.recordset;

    res.json(station);
  } catch (error) {
    console.error('Error fetching station:', error);
    res.status(500).json({ error: 'Failed to fetch station details' });
  }
};

// Get charge points for a specific station
const getChargePointsByStation = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('station_id', sql.Int, id)
      .query(`
        SELECT 
          charge_point_id,
          charger_type,
          status,
          power_rating
        FROM Charge_Point
        WHERE station_id = @station_id
        ORDER BY charge_point_id
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching charge points:', error);
    res.status(500).json({ error: 'Failed to fetch charge points' });
  }
};

module.exports = {
  getAllStations,
  getStationById,
  getChargePointsByStation
};
