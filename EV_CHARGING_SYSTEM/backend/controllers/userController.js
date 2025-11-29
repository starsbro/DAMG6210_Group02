const { getPool, sql } = require('../config/database');

// Get user profile with all details
const getUserProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, id)
      .query(`
        SELECT 
          u.user_id,
          u.account_type,
          p.first_name,
          p.last_name,
          p.email,
          p.phone,
          p.date_of_birth
        FROM [User] u
        JOIN Person p ON u.user_id = p.person_id
        WHERE u.user_id = @user_id
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
};

// Get user addresses
const getUserAddresses = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, id)
      .query(`
        SELECT 
          a.address_id,
          a.street,
          a.city,
          a.state,
          a.postal_code,
          a.country,
          pa.address_type
        FROM Person_Address pa
        JOIN Address a ON pa.address_id = a.address_id
        WHERE pa.person_id = @user_id
        ORDER BY 
          CASE pa.address_type 
            WHEN 'Home' THEN 1 
            WHEN 'Work' THEN 2 
            WHEN 'Billing' THEN 3 
            ELSE 4 
          END
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching user addresses:', error);
    res.status(500).json({ error: 'Failed to fetch user addresses' });
  }
};

// Get user dashboard stats
const getUserDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();

    
    // Get user stats
    const result = await pool.request()
      .input('user_id', sql.Int, id)
      .query(`
        SELECT 
          (SELECT COUNT(*) FROM Vehicle WHERE user_id = @user_id) as total_vehicles,
          (SELECT COUNT(*) FROM Reservation r 
           WHERE r.user_id = @user_id AND r.status = 'Pending') as pending_reservations,
          (SELECT COUNT(*) FROM Reservation r 
           WHERE r.user_id = @user_id AND r.status = 'Confirmed') as confirmed_reservations,
          (SELECT COUNT(DISTINCT cs.session_id) 
           FROM Charging_Session cs
           JOIN User_Subscription us ON cs.user_subscription_id = us.user_subscription_id
           WHERE us.user_id = @user_id) as total_sessions,
          (SELECT ISNULL(SUM(cs.energy_consumed), 0)
           FROM Charging_Session cs
           JOIN User_Subscription us ON cs.user_subscription_id = us.user_subscription_id
           WHERE us.user_id = @user_id) as total_energy_consumed,
          (SELECT ISNULL(SUM(i.total_amount), 0)
           FROM Invoice i
           WHERE i.user_id = @user_id) as total_billed,
          (SELECT ISNULL(SUM(p.amount), 0)
           FROM Payment p
           JOIN Invoice i ON p.invoice_id = i.invoice_id
           WHERE i.user_id = @user_id AND p.status = 'Completed') as total_paid
      `);
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching user dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch user dashboard' });
  }
};

module.exports = {
  getUserProfile,
  getUserAddresses,
  getUserDashboard
};
