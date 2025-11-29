const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// In-memory storage for OTPs and pending registrations
const otpStorage = new Map();
const pendingRegistrations = new Map(); // Store signup data before verification

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email
const sendOTP = async (email, otp) => {
  try {
    console.log(' ==========================================');
    console.log(' OTP FOR', email, ':', otp);
    console.log(' ==========================================');
    
    const { data, error } = await resend.emails.send({
      from: 'EV Charging System <onboarding@resend.dev>',
      to: email,
      subject: 'Your Login OTP - EV Charging System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #10b981;"> Your Login OTP</h2>
          <p>Hello!</p>
          <p>Your One-Time Password (OTP) for logging into the EV Charging System is:</p>
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h1 style="color: #059669; font-size: 36px; margin: 0; letter-spacing: 8px;">${otp}</h1>
          </div>
          <p style="color: #6b7280;">This OTP will expire in <strong>5 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't request this OTP, please ignore this email.</p>
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="color: #9ca3af; font-size: 12px;">EV Charging System - Sustainable Transportation</p>
        </div>
      `
    });

    if (error) {
      console.error('Error sending email:', error);
      return false;
    }

    console.log(' OTP email sent successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in sendOTP:', error);
    return false;
  }
};

// Store OTP with 5-minute expiration
const storeOTP = (email, otp) => {
  const expiresAt = Date.now() + 5 * 60 * 1000;
  otpStorage.set(email.toLowerCase(), { otp, expiresAt });
  
  setTimeout(() => {
    otpStorage.delete(email.toLowerCase());
  }, 5 * 60 * 1000);
};

// Verify OTP
const verifyOTP = (email, otp) => {
  const stored = otpStorage.get(email.toLowerCase());
  
  if (!stored) {
    return { valid: false, message: 'OTP not found or expired' };
  }
  
  if (Date.now() > stored.expiresAt) {
    otpStorage.delete(email.toLowerCase());
    return { valid: false, message: 'OTP expired' };
  }
  
  if (stored.otp !== otp) {
    return { valid: false, message: 'Invalid OTP' };
  }
  
  otpStorage.delete(email.toLowerCase());
  return { valid: true, message: 'OTP verified successfully' };
};

// Store pending registration data (before OTP verification)
const storePendingRegistration = (email, userData, vehicleData) => {
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
  pendingRegistrations.set(email.toLowerCase(), { 
    userData, 
    vehicleData, 
    expiresAt 
  });
  
  setTimeout(() => {
    pendingRegistrations.delete(email.toLowerCase());
  }, 10 * 60 * 1000);
};

// Get pending registration data
const getPendingRegistration = (email) => {
  const pending = pendingRegistrations.get(email.toLowerCase());
  
  if (!pending) {
    return null;
  }
  
  if (Date.now() > pending.expiresAt) {
    pendingRegistrations.delete(email.toLowerCase());
    return null;
  }
  
  return pending;
};

// Clear pending registration after successful signup
const clearPendingRegistration = (email) => {
  pendingRegistrations.delete(email.toLowerCase());
};

module.exports = {
  generateOTP,
  sendOTP,
  storeOTP,
  verifyOTP,
  storePendingRegistration,
  getPendingRegistration,
  clearPendingRegistration
};
