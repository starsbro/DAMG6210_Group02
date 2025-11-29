const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY);

async function testResend() {
  console.log('Testing Resend with API key:', process.env.RESEND_API_KEY?.slice(0, 10) + '...');
  
  try {
    const { data, error } = await resend.emails.send({
      from: 'EV Charging <onboarding@resend.dev>',
      to: 'kashyap.sau@northeastern.edu',
      subject: 'Test Email from EV Charging System',
      html: '<h1>Hello! This is a test email.</h1><p>Your OTP is: <strong>123456</strong></p>'
    });

    if (error) {
      console.error('❌ Error:', error);
    } else {
      console.log('✅ Email sent successfully!', data);
    }
  } catch (err) {
    console.error('❌ Exception:', err);
  }
}

testResend();
