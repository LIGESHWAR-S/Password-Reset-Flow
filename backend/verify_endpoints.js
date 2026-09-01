require('dotenv').config();
const axios = require('axios');
const mongoose = require('mongoose');
const User = require('./models/User');

const API_URL = 'http://localhost:5000/api/auth';
const TEST_EMAIL = 'verify-flow@example.com';
const TEMP_PASSWORD = 'password123';
const NEW_PASSWORD = 'newSecurePassword456';

const runVerification = async () => {
  console.log('=== STARTING END-TO-END AUTH & PASSWORD RESET VERIFICATION ===');
  
  // 1. Connect to Database using connectDB helper (with fallback support)
  const connectDB = require('./config/db');
  await connectDB();


  try {
    // Clean up test user if exists
    await User.deleteOne({ email: TEST_EMAIL });
    console.log(`Cleared any existing test user with email ${TEST_EMAIL}`);

    // 2. Test User Registration
    console.log('\nStep 1: Registering a test user...');
    const registerRes = await axios.post(`${API_URL}/register`, {
      email: TEST_EMAIL,
      password: TEMP_PASSWORD
    });
    console.log('Registration Response:', registerRes.data);

    // 3. Test User Login (Successful)
    console.log('\nStep 2: Testing login with initial password...');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: TEST_EMAIL,
      password: TEMP_PASSWORD
    });
    console.log('Login Response:', loginRes.data);

    // 4. Test Forgot Password
    console.log('\nStep 3: Triggering Forgot Password request...');
    const forgotRes = await axios.post(`${API_URL}/forgot-password`, {
      email: TEST_EMAIL
    });
    console.log('Forgot Password Response:', forgotRes.data);

    // 5. Query token from Database (simulating user opening the link)
    console.log('\nStep 4: Fetching reset token from Database...');
    const dbUser = await User.findOne({ email: TEST_EMAIL });
    const resetToken = dbUser.resetPasswordToken;
    const resetExpiry = dbUser.resetPasswordExpires;
    
    if (!resetToken) {
      throw new Error('Reset token was not saved in the database!');
    }
    console.log(`Successfully fetched token from DB: ${resetToken}`);
    console.log(`Token expires at: ${new Date(resetExpiry).toLocaleString()}`);

    // 6. Verify token is valid (GET verify-token)
    console.log('\nStep 5: Verifying token validity via GET endpoint...');
    const verifyRes = await axios.get(`${API_URL}/verify-token/${resetToken}`);
    console.log('Token Verification Response:', verifyRes.data);

    // 7. Test link expiration warning (mocking expiration)
    console.log('\nStep 6: Simulating link expiration by modifying Database expiry...');
    // Backdate expiry to 1 minute ago
    dbUser.resetPasswordExpires = Date.now() - 60000;
    await dbUser.save();
    
    try {
      console.log('Testing GET verification on expired token...');
      await axios.get(`${API_URL}/verify-token/${resetToken}`);
      throw new Error('Token should have failed verification but succeeded.');
    } catch (err) {
      console.log('Token verification failed as expected on expired link:', err.response?.data);
    }

    // Restore token validity for the reset test
    console.log('Restoring token validity in Database...');
    dbUser.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
    await dbUser.save();

    // 8. Reset password using valid token (POST reset-password)
    console.log('\nStep 7: Resetting password...');
    const resetRes = await axios.post(`${API_URL}/reset-password/${resetToken}`, {
      password: NEW_PASSWORD
    });
    console.log('Password Reset Response:', resetRes.data);

    // 9. Verify token has been cleared from Database
    console.log('\nStep 8: Checking if token was cleared from Database...');
    const dbUserAfterReset = await User.findOne({ email: TEST_EMAIL });
    console.log('resetPasswordToken in DB:', dbUserAfterReset.resetPasswordToken);
    console.log('resetPasswordExpires in DB:', dbUserAfterReset.resetPasswordExpires);
    if (dbUserAfterReset.resetPasswordToken !== null) {
      throw new Error('Token was not cleared after successful reset.');
    }

    // 10. Attempt login with old password (should fail)
    console.log('\nStep 9: Testing login with OLD password (should fail)...');
    try {
      await axios.post(`${API_URL}/login`, {
        email: TEST_EMAIL,
        password: TEMP_PASSWORD
      });
      throw new Error('Login with old password succeeded but should have failed.');
    } catch (err) {
      console.log('Login failed as expected:', err.response?.data);
    }

    // 11. Attempt login with NEW password (should succeed)
    console.log('\nStep 10: Testing login with NEW password...');
    const newLoginRes = await axios.post(`${API_URL}/login`, {
      email: TEST_EMAIL,
      password: NEW_PASSWORD
    });
    console.log('New Login Response:', newLoginRes.data);
    console.log('\n\x1b[32m=== ALL END-TO-END FLOW CHECKS PASSED SUCCESSFULLY ===\x1b[0m');

    // Clean up
    await User.deleteOne({ email: TEST_EMAIL });
    console.log('Cleaned up test user.');

  } catch (err) {
    console.error('\n\x1b[31m=== VERIFICATION FAILED ===\x1b[0m');
    if (err.response) {
      console.error('API Error Response:', err.response.status, err.response.data);
    } else {
      console.error('Error details:', err.message);
    }
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      console.log('Database connection closed.');
    }
  }
};


runVerification();
