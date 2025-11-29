const { getPool, sql } = require('../config/database');
const { 
  generateOTP, 
  sendOTP, 
  storeOTP, 
  verifyOTP,
  storePendingRegistration,
  getPendingRegistration,
  clearPendingRegistration
} = require('../services/authService');

// Send OTP to user's email (for login)
const sendLoginOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const pool = getPool();
    
    // Check if user exists in database
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .query(`
        SELECT 
          p.person_id,
          p.first_name,
          p.last_name,
          p.email,
          u.user_id,
          u.account_type
        FROM Person p
        LEFT JOIN [User] u ON p.person_id = u.user_id
        WHERE LOWER(p.email) = @email
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'No account found with this email' });
    }

    const user = result.recordset[0];
    
    // Check if this person is actually a User
    if (!user.user_id) {
      return res.status(403).json({ error: 'This email is not registered as a user account' });
    }

    // Generate and store OTP
    const otp = generateOTP();
    storeOTP(email, otp);
    
    // Send OTP via email
    const emailSent = await sendOTP(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ 
      success: true,
      message: 'OTP sent to your email',
      email: email
    });
  } catch (error) {
    console.error('Error in sendLoginOTP:', error);
    res.status(500).json({ error: 'Failed to send OTP' });
  }
};

// Step 1: Store signup data and send OTP (DON'T save to DB yet!)
const initiateSignup = async (req, res) => {
  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone, 
      date_of_birth, 
      account_type,
      vehicle
    } = req.body;

    // Validate required fields
    if (!first_name || !last_name || !email || !phone || !date_of_birth || !vehicle) {
      return res.status(400).json({ 
        error: 'All fields are required'
      });
    }

    const pool = getPool();

    // Check if email already exists
    const existingUser = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .query('SELECT person_id FROM Person WHERE LOWER(email) = @email');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Check if license plate already exists
    const existingPlate = await pool.request()
      .input('license_plate', sql.NVarChar, vehicle.license_plate)
      .query('SELECT vehicle_id FROM Vehicle WHERE license_plate = @license_plate');

    if (existingPlate.recordset.length > 0) {
      return res.status(409).json({ error: 'License plate already registered' });
    }

    // Generate OTP
    const otp = generateOTP();
    
    // Store signup data in memory (NOT in database yet!)
    storePendingRegistration(email, {
      first_name,
      last_name,
      email,
      phone,
      date_of_birth,
      account_type: account_type || 'Standard'
    }, vehicle);
    
    // Store OTP
    storeOTP(email, otp);
    
    // Send OTP via email
    const emailSent = await sendOTP(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email. Verify to complete registration.',
      email: email
    });

  } catch (error) {
    console.error('Error in initiateSignup:', error);
    res.status(500).json({ 
      error: 'Failed to initiate signup',
      details: error.message 
    });
  }
};

// Step 2: Verify OTP and save to database
const verifySignupOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP
    const verification = verifyOTP(email, otp);
    
    if (!verification.valid) {
      return res.status(401).json({ error: verification.message });
    }

    // Get pending registration data
    const pending = getPendingRegistration(email);
    
    if (!pending) {
      return res.status(404).json({ 
        error: 'Registration data not found or expired. Please sign up again.' 
      });
    }

    const { userData, vehicleData } = pending;
    const pool = getPool();

    // Start transaction to save everything
    const transaction = pool.transaction();
    await transaction.begin();

    try {
      // Insert into Person table
      const personResult = await transaction.request()
        .input('first_name', sql.NVarChar, userData.first_name)
        .input('last_name', sql.NVarChar, userData.last_name)
        .input('email', sql.NVarChar, userData.email.toLowerCase())
        .input('phone', sql.NVarChar, userData.phone)
        .input('date_of_birth', sql.Date, userData.date_of_birth)
        .query(`
          INSERT INTO Person (first_name, last_name, email, phone, date_of_birth)
          VALUES (@first_name, @last_name, @email, @phone, @date_of_birth);
          SELECT SCOPE_IDENTITY() AS person_id;
        `);

      const person_id = personResult.recordset[0].person_id;

      // Insert into User table
      await transaction.request()
        .input('user_id', sql.Int, person_id)
        .input('account_type', sql.NVarChar, userData.account_type)
        .query(`
          INSERT INTO [User] (user_id, account_type)
          VALUES (@user_id, @account_type);
        `);

      // Insert Vehicle
      await transaction.request()
        .input('user_id', sql.Int, person_id)
        .input('license_plate', sql.NVarChar, vehicleData.license_plate)
        .input('brand', sql.NVarChar, vehicleData.brand || null)
        .input('model', sql.NVarChar, vehicleData.model || null)
        .input('battery_capacity', sql.Decimal(8, 2), vehicleData.battery_capacity || null)
        .input('connector_type', sql.NVarChar, vehicleData.connector_type)
        .query(`
          INSERT INTO Vehicle (user_id, license_plate, brand, model, battery_capacity, connector_type)
          VALUES (@user_id, @license_plate, @brand, @model, @battery_capacity, @connector_type);
        `);

      // Create default payment method (Card) for new user
      const pmResult = await transaction.request()
        .input('user_id', sql.Int, person_id)
        .input('method_type', sql.NVarChar, 'Credit Card')
        .query(`
          INSERT INTO Payment_Method (user_id, method_type)
          VALUES (@user_id, @method_type);
          SELECT SCOPE_IDENTITY() AS payment_method_id;
        `);

      const paymentMethodId = pmResult.recordset[0].payment_method_id;

      // Create default credit card entry
      await transaction.request()
        .input('payment_method_id', sql.Int, paymentMethodId)
        .input('card_number', sql.NVarChar, '****-****-****-' + Math.floor(1000 + Math.random() * 9000))
        .input('expiry_date', sql.Date, '2027-12-31')
        .input('card_holder_name', sql.NVarChar, userData.first_name + ' ' + userData.last_name)
        .query(`
          INSERT INTO Credit_Card (payment_method_id, card_number, expiry_date, card_holder_name)
          VALUES (@payment_method_id, @card_number, @expiry_date, @card_holder_name);
        `);

      await transaction.commit();

      // Clear pending registration
      clearPendingRegistration(email);

      // Return user data for login
      res.json({
        success: true,
        message: 'Registration successful! You are now logged in.',
        user: {
          user_id: person_id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          email: userData.email,
          account_type: userData.account_type
        }
      });

    } catch (error) {
      await transaction.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Error in verifySignupOTP:', error);
    res.status(500).json({ 
      error: 'Failed to complete registration',
      details: error.message 
    });
  }
};

// Resend OTP
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    // Generate new OTP
    const otp = generateOTP();
    storeOTP(email, otp);
    
    // Send OTP via email
    const emailSent = await sendOTP(email, otp);
    
    if (!emailSent) {
      return res.status(500).json({ error: 'Failed to send OTP email' });
    }

    res.json({ 
      success: true,
      message: 'New OTP sent to your email'
    });

  } catch (error) {
    console.error('Error in resendOTP:', error);
    res.status(500).json({ error: 'Failed to resend OTP' });
  }
};

// Verify OTP and login user (for existing users)
const verifyLoginOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    
    if (!email || !otp) {
      return res.status(400).json({ error: 'Email and OTP are required' });
    }

    // Verify OTP
    const verification = verifyOTP(email, otp);
    
    if (!verification.valid) {
      return res.status(401).json({ error: verification.message });
    }

    const pool = getPool();
    
    // Get user details
    const result = await pool.request()
      .input('email', sql.NVarChar, email.toLowerCase())
      .query(`
        SELECT 
          p.person_id,
          p.first_name,
          p.last_name,
          p.email,
          u.user_id,
          u.account_type
        FROM Person p
        JOIN [User] u ON p.person_id = u.user_id
        WHERE LOWER(p.email) = @email
      `);
    
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.recordset[0];

    res.json({
      success: true,
      message: 'Login successful',
      user: {
        user_id: user.user_id,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        account_type: user.account_type
      }
    });
  } catch (error) {
    console.error('Error in verifyLoginOTP:', error);
    res.status(500).json({ error: 'Failed to verify OTP' });
  }
};

module.exports = {
  sendLoginOTP,
  verifyLoginOTP,
  initiateSignup,
  verifySignupOTP,
  resendOTP
};
