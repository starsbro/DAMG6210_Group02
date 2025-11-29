const { getPool, sql } = require('../config/database');

// Get all invoices for a user
const getUserInvoices = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT 
          i.invoice_id,
          i.issue_date,
          i.total_amount,
          cs.session_id,
          cs.start_time,
          cs.end_time,
          cs.energy_consumed,
          p.payment_id,
          p.amount AS payment_amount,
          p.status AS payment_status,
          p.payment_date
        FROM Invoice i
        LEFT JOIN Charging_Session cs ON i.charging_session_id = cs.session_id
        LEFT JOIN Payment p ON i.invoice_id = p.invoice_id
        WHERE i.user_id = @user_id
        ORDER BY i.issue_date DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching invoices:', error);
    res.status(500).json({ error: 'Failed to fetch invoices' });
  }
};

// Get payment methods for a user
const getUserPaymentMethods = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT 
          pm.payment_method_id,
          pm.method_type,
          CASE 
            WHEN pm.method_type = 'Credit Card' THEN 
              CONCAT('****', RIGHT(cc.card_number, 4))
            WHEN pm.method_type = 'Debit Card' THEN 
              CONCAT('****', RIGHT(dc.card_number, 4))
            WHEN pm.method_type = 'Wallet' THEN 
              w.wallet_provider
            ELSE 'Unknown'
          END AS display_info
        FROM Payment_Method pm
        LEFT JOIN Credit_Card cc ON pm.payment_method_id = cc.payment_method_id
        LEFT JOIN Debit_Card dc ON pm.payment_method_id = dc.payment_method_id
        LEFT JOIN Wallet w ON pm.payment_method_id = w.payment_method_id
        WHERE pm.user_id = @user_id
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching payment methods:', error);
    res.status(500).json({ error: 'Failed to fetch payment methods' });
  }
};

// Complete a payment using stored procedure
const completePayment = async (req, res) => {
  try {
    const { payment_id, payment_method_id } = req.body;
    const pool = getPool();
    
    const result = await pool.request()
      .input('payment_id', sql.Int, payment_id)
      .input('payment_method_id', sql.Int, payment_method_id)
      .output('invoice_total', sql.Decimal(10, 2))
      .execute('CompletePayment');
    
    // After payment completes, mark the reservation as "Completed"
    // Find the reservation linked to this payment
    const reservationUpdate = await pool.request()
      .input('payment_id', sql.Int, payment_id)
      .query(`
        UPDATE Reservation
        SET status = 'Completed'
        WHERE reservation_id = (
          SELECT TOP 1 r.reservation_id
          FROM Payment p
          JOIN Invoice i ON p.invoice_id = i.invoice_id
          JOIN Charging_Session cs ON i.charging_session_id = cs.session_id
          JOIN Reservation r ON r.charge_point_id = cs.charge_point_id 
            AND r.user_id = i.user_id
            AND r.status = 'Confirmed'
          WHERE p.payment_id = @payment_id
          ORDER BY r.start_time DESC
        )
      `);
    
    console.log(' Reservation status updated to Completed. Rows affected:', reservationUpdate.rowsAffected[0]);
    
    res.json({ 
      message: 'Payment completed successfully', 
      invoice_total: result.output.invoice_total 
    });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ 
      error: 'Failed to complete payment',
      details: error.message
    });
  }
};

module.exports = {
  getUserInvoices,
  getUserPaymentMethods,
  completePayment
};
