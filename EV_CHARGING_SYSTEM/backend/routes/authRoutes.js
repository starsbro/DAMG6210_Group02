const express = require('express');
const router = express.Router();
const { 
  sendLoginOTP, 
  verifyLoginOTP, 
  initiateSignup,
  verifySignupOTP,
  resendOTP
} = require('../controllers/authController');

// POST /api/auth/send-otp - Send OTP to email (for login)
router.post('/send-otp', sendLoginOTP);

// POST /api/auth/verify-otp - Verify OTP and login (for existing users)
router.post('/verify-otp', verifyLoginOTP);

// POST /api/auth/signup - Initiate signup (stores in memory, sends OTP)
router.post('/signup', initiateSignup);

// POST /api/auth/verify-signup - Verify OTP and save to database
router.post('/verify-signup', verifySignupOTP);

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', resendOTP);

module.exports = router;
