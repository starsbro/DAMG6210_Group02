const { getPool, sql } = require('../config/database');

// Get all available subscription plans
const getAllPlans = async (req, res) => {
  try {
    const pool = getPool();
    
    const result = await pool.request().query(`
      SELECT 
        plan_id,
        plan_name,
        plan_description,
        monthly_fee,
        discount_rate
      FROM Subscription_Plan
      ORDER BY monthly_fee
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching subscription plans:', error);
    res.status(500).json({ error: 'Failed to fetch subscription plans' });
  }
};

// Get user's current subscription
const getUserSubscription = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT TOP 1
          us.user_subscription_id,
          us.start_date,
          us.end_date,
          sp.plan_id,
          sp.plan_name,
          sp.plan_description,
          sp.monthly_fee,
          sp.discount_rate
        FROM User_Subscription us
        JOIN Subscription_Plan sp ON us.plan_id = sp.plan_id
        WHERE us.user_id = @user_id
        AND (us.end_date IS NULL OR us.end_date >= CAST(GETDATE() AS DATE))
        ORDER BY us.start_date DESC
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No active subscription found' });
    }
    
    res.json(result.recordset[0]);
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    res.status(500).json({ error: 'Failed to fetch user subscription' });
  }
};

module.exports = {
  getAllPlans,
  getUserSubscription
};
