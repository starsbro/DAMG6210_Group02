const { getPool, sql } = require('../config/database');

// Get all reservations for a user
const getUserReservations = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT 
          r.reservation_id,
          r.start_time,
          r.end_time,
          r.status,
          cp.charge_point_id,
          cp.charger_type,
          cp.power_rating,
          cp.status as charge_point_status,
          s.station_id,
          s.station_name,
          a.street,
          a.city,
          a.state
        FROM Reservation r
        JOIN Charge_Point cp ON r.charge_point_id = cp.charge_point_id
        JOIN Station s ON cp.station_id = s.station_id
        JOIN Address a ON s.address_id = a.address_id
        WHERE r.user_id = @user_id
        ORDER BY r.start_time DESC
      `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Error fetching reservations:', error);
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};

// Create a new reservation using stored procedure
const createReservation = async (req, res) => {
  try {
    const { user_id, charge_point_id, start_time, end_time } = req.body;
    const pool = getPool();
    
    const result = await pool.request()
      .input('user_id', sql.Int, user_id)
      .input('charge_point_id', sql.Int, charge_point_id)
      .input('start_time', sql.DateTime2, start_time)
      .input('end_time', sql.DateTime2, end_time)
      .output('new_reservation_id', sql.Int)
      .execute('CreateReservation');
    
    res.status(201).json({ 
      message: 'Reservation created successfully', 
      reservation_id: result.output.new_reservation_id 
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({ 
      error: 'Failed to create reservation',
      details: error.message
    });
  }
};

// Cancel a reservation
const cancelReservation = async (req, res) => {
  try {
    const { id } = req.params;
    const pool = getPool();
    
    const result = await pool.request()
      .input('reservation_id', sql.Int, id)
      .query(`
        UPDATE Reservation
        SET status = 'Cancelled'
        WHERE reservation_id = @reservation_id AND status IN ('Pending', 'Confirmed')
      `);
    
    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ error: 'Reservation not found or cannot be cancelled' });
    }
    
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
};

// Start charging session
const startChargingSession = async (req, res) => {
  try {
    const { reservation_id, vehicle_id } = req.body;
    const pool = getPool();

    // Get reservation and user details
    const reservation = await pool.request()
      .input('reservation_id', sql.Int, reservation_id)
      .query(`
        SELECT r.*, us.user_subscription_id
        FROM Reservation r
        JOIN [User] u ON r.user_id = u.user_id
        LEFT JOIN User_Subscription us ON u.user_id = us.user_id 
          AND (us.end_date IS NULL OR us.end_date >= CAST(GETDATE() AS DATE))
        WHERE r.reservation_id = @reservation_id
      `);

    if (reservation.recordset.length === 0) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    const resData = reservation.recordset[0];

    // Check if reservation is in valid status
    if (resData.status === 'Cancelled') {
      return res.status(400).json({ error: 'Reservation is cancelled' });
    }

    if (resData.status === 'Completed') {
      return res.status(400).json({ error: 'Reservation already completed' });
    }

    // If no active subscription, create a default one or use null
    let subscriptionId = resData.user_subscription_id;
    
    if (!subscriptionId) {
      // Create a basic subscription for this user
      const subResult = await pool.request()
        .input('user_id', sql.Int, resData.user_id)
        .query(`
          INSERT INTO User_Subscription (user_id, plan_id, start_date)
          VALUES (@user_id, 1, CAST(GETDATE() AS DATE));
          SELECT SCOPE_IDENTITY() AS user_subscription_id;
        `);
      subscriptionId = subResult.recordset[0].user_subscription_id;
    }

    // Create charging session
    const sessionResult = await pool.request()
      .input('user_subscription_id', sql.Int, subscriptionId)
      .input('vehicle_id', sql.Int, vehicle_id)
      .input('charge_point_id', sql.Int, resData.charge_point_id)
      .input('start_time', sql.DateTime, new Date())
      .input('end_time', sql.DateTime, new Date()) // Will update when stopped
      .input('energy_consumed', sql.Decimal(8, 2), 0)
      .input('total_cost', sql.Decimal(10, 2), 0)
      .query(`
        INSERT INTO Charging_Session 
        (user_subscription_id, vehicle_id, charge_point_id, start_time, end_time, energy_consumed, total_cost)
        VALUES (@user_subscription_id, @vehicle_id, @charge_point_id, @start_time, @end_time, @energy_consumed, @total_cost);
        SELECT SCOPE_IDENTITY() AS session_id;
      `);

    const sessionId = sessionResult.recordset[0].session_id;

    // Update reservation status
    await pool.request()
      .input('reservation_id', sql.Int, reservation_id)
      .query(`UPDATE Reservation SET status = 'Confirmed' WHERE reservation_id = @reservation_id`);

    // Update charge point status
    await pool.request()
      .input('charge_point_id', sql.Int, resData.charge_point_id)
      .query(`UPDATE Charge_Point SET status = 'In Use' WHERE charge_point_id = @charge_point_id`);

    res.json({
      success: true,
      message: 'Charging session started',
      session_id: sessionId,
      reservation_id: reservation_id
    });

  } catch (error) {
    console.error('Error starting charging session:', error);
    res.status(500).json({ 
      error: 'Failed to start charging session',
      details: error.message 
    });
  }
};

// Stop charging session and generate invoice
const stopChargingSession = async (req, res) => {
  try {
    const { session_id, energy_consumed } = req.body;
    const pool = getPool();

    // Get session details
    const session = await pool.request()
      .input('session_id', sql.Int, session_id)
      .query(`
        SELECT cs.*, us.user_id, us.plan_id, sp.discount_rate
        FROM Charging_Session cs
        JOIN User_Subscription us ON cs.user_subscription_id = us.user_subscription_id
        LEFT JOIN Subscription_Plan sp ON us.plan_id = sp.plan_id
        WHERE cs.session_id = @session_id
      `);

    if (session.recordset.length === 0) {
      return res.status(404).json({ error: 'Charging session not found' });
    }

    const sessionData = session.recordset[0];
    const endTime = new Date();
    const startTime = new Date(sessionData.start_time);
    
    // Calculate duration in hours
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    
    // Calculate cost based on BOTH time and energy
    // Pricing: $0.50 per kWh + $2.00 per hour
    const energyCost = energy_consumed * 0.50;
    const timeCost = durationHours * 2.00;
    const baseCost = energyCost + timeCost;
    const discount = sessionData.discount_rate || 0;
    const totalCost = baseCost * (1 - discount / 100);

    console.log(' Pricing Calculation:');
    console.log('  Duration:', durationHours.toFixed(2), 'hours');
    console.log('  Energy:', energy_consumed, 'kWh');
    console.log('  Energy Cost: $', energyCost.toFixed(2), '(', energy_consumed, 'kWh  $0.50)');
    console.log('  Time Cost: $', timeCost.toFixed(2), '(', durationHours.toFixed(2), 'hrs  $2.00)');
    console.log('  Base Cost: $', baseCost.toFixed(2));
    console.log('  Discount:', discount, '%');
    console.log('  Total Cost: $', totalCost.toFixed(2));

    const transaction = pool.transaction();
    await transaction.begin();

    try {
      console.log('Step 1: Updating charging session...');
      // Update charging session
      await transaction.request()
        .input('session_id', sql.Int, session_id)
        .input('end_time', sql.DateTime, endTime)
        .input('energy_consumed', sql.Decimal(8, 2), energy_consumed)
        .input('total_cost', sql.Decimal(10, 2), totalCost)
        .query(`
          UPDATE Charging_Session
          SET end_time = @end_time,
              energy_consumed = @energy_consumed,
              total_cost = @total_cost
          WHERE session_id = @session_id
        `);
      console.log(' Step 1 complete');

      console.log('Step 2: Updating charge point to Available...');
      // Update charge point back to Available
      await transaction.request()
        .input('charge_point_id', sql.Int, sessionData.charge_point_id)
        .query(`UPDATE Charge_Point SET status = 'Available' WHERE charge_point_id = @charge_point_id`);
      console.log(' Step 2 complete');

      console.log('Step 3: Updating reservation end_time...');
      // Update reservation end_time to actual end_time
      await transaction.request()
        .input('user_id', sql.Int, sessionData.user_id)
        .input('charge_point_id', sql.Int, sessionData.charge_point_id)
        .input('end_time', sql.DateTime2, endTime)
        .query(`
          UPDATE Reservation
          SET end_time = @end_time
          WHERE reservation_id = (
            SELECT TOP 1 reservation_id
            FROM Reservation
            WHERE user_id = @user_id 
              AND charge_point_id = @charge_point_id
              AND status = 'Confirmed'
            ORDER BY start_time DESC
          )
        `);
      console.log(' Step 3 complete');

      console.log('Step 4: Creating invoice...');
      // Create invoice
      const invoiceResult = await transaction.request()
        .input('user_id', sql.Int, sessionData.user_id)
        .input('issue_date', sql.Date, new Date())
        .input('total_amount', sql.Decimal(10, 2), totalCost)
        .input('user_subscription_id', sql.Int, sessionData.user_subscription_id)
        .input('charging_session_id', sql.Int, session_id)
        .query(`
          INSERT INTO Invoice (user_id, issue_date, total_amount, user_subscription_id, charging_session_id)
          VALUES (@user_id, @issue_date, @total_amount, @user_subscription_id, @charging_session_id);
          SELECT SCOPE_IDENTITY() AS invoice_id;
        `);

      const invoiceId = invoiceResult.recordset[0].invoice_id;
      console.log(' Step 4 complete - Invoice ID:', invoiceId);

      console.log('Step 5: Getting payment method...');
      // Get user's first payment method
      const paymentMethod = await transaction.request()
        .input('user_id', sql.Int, sessionData.user_id)
        .query(`SELECT TOP 1 payment_method_id FROM Payment_Method WHERE user_id = @user_id`);

      let paymentMethodId = paymentMethod.recordset[0]?.payment_method_id;
      console.log('Payment method ID found:', paymentMethodId);

      // If no payment method exists, create a default one
      if (!paymentMethodId) {
        console.log('No payment method found, creating default...');
        const newPaymentMethod = await transaction.request()
          .input('user_id', sql.Int, sessionData.user_id)
          .input('method_type', sql.NVarChar, 'Credit Card')
          .query(`
            INSERT INTO Payment_Method (user_id, method_type)
            VALUES (@user_id, @method_type);
            SELECT SCOPE_IDENTITY() AS payment_method_id;
          `);
        
        paymentMethodId = newPaymentMethod.recordset[0].payment_method_id;
        console.log('Created payment method ID:', paymentMethodId);

        // Create dummy credit card entry
        await transaction.request()
          .input('payment_method_id', sql.Int, paymentMethodId)
          .input('card_number', sql.NVarChar, '****-****-****-0000')
          .input('expiry_date', sql.Date, '2027-12-31')
          .input('card_holder_name', sql.NVarChar, 'Default Card')
          .query(`
            INSERT INTO Credit_Card (payment_method_id, card_number, expiry_date, card_holder_name)
            VALUES (@payment_method_id, @card_number, @expiry_date, @card_holder_name);
          `);
        console.log(' Default credit card created');
      }
      console.log(' Step 5 complete');

      console.log('Step 6: Creating pending payment...');
      // Create pending payment (now paymentMethodId is guaranteed to exist)
      const paymentResult = await transaction.request()
        .input('invoice_id', sql.Int, invoiceId)
        .input('payment_method_id', sql.Int, paymentMethodId)
        .input('amount', sql.Decimal(10, 2), totalCost)
        .input('status', sql.NVarChar, 'Pending')
        .query(`
          INSERT INTO Payment (invoice_id, payment_method_id, amount, status, payment_date)
          VALUES (@invoice_id, @payment_method_id, @amount, @status, SYSDATETIME());
          SELECT SCOPE_IDENTITY() AS payment_id;
        `);
      const paymentId = paymentResult.recordset[0].payment_id;
      console.log(' Step 6 complete - Payment ID:', paymentId);

      console.log('Step 7: Committing transaction...');
      await transaction.commit();
      console.log(' Transaction committed successfully!');

      res.json({
        success: true,
        message: 'Charging session completed',
        invoice: {
          invoice_id: invoiceId,
          payment_id: paymentId,
          total_amount: totalCost,
          energy_consumed: energy_consumed,
          duration_hours: durationHours.toFixed(2)
        }
      });

    } catch (error) {
      console.error(' Transaction error at step:', error.message);
      console.error('Full error:', error);
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error stopping charging session:', error);
    res.status(500).json({ 
      error: 'Failed to stop charging session',
      details: error.message 
    });
  }
};

// Get active charging session for a user
const getActiveSession = async (req, res) => {
  try {
    const { userId } = req.params;
    const pool = getPool();

    const result = await pool.request()
      .input('user_id', sql.Int, userId)
      .query(`
        SELECT TOP 1
          cs.session_id,
          cs.start_time,
          cs.vehicle_id,
          cs.charge_point_id,
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
          AND cs.energy_consumed = 0
          AND cs.total_cost = 0
        ORDER BY cs.start_time DESC
      `);

    res.json(result.recordset[0] || null);
  } catch (error) {
    console.error('Error fetching active session:', error);
    res.status(500).json({ error: 'Failed to fetch active session' });
  }
};

module.exports = {
  getUserReservations,
  createReservation,
  cancelReservation,
  startChargingSession,
  stopChargingSession,
  getActiveSession
};
