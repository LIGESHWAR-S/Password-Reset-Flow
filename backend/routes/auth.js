const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const User = require('../models/User');

// Helper to initialize Nodemailer transporter.
// If EMAIL_USER and EMAIL_PASS are not specified, it will dynamically create an Ethereal SMTP test account.
let transporterPromise = null;
const getTransporter = async () => {
  let emailUser = process.env.EMAIL_USER;
  let emailPass = process.env.EMAIL_PASS;
  let emailHost = process.env.EMAIL_HOST;
  let emailPort = parseInt(process.env.EMAIL_PORT) || 587;

  // Real Email Mode: If EMAIL_USER and EMAIL_PASS are set in backend/.env
  if (emailUser && emailPass) {
    if (emailUser.includes('@gmail.com') || process.env.EMAIL_SERVICE === 'gmail') {
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: emailUser,
          pass: emailPass
        }
      });
    }

    return nodemailer.createTransport({
      host: emailHost || 'smtp.gmail.com',
      port: emailPort,
      secure: emailPort === 465,
      auth: {
        user: emailUser,
        pass: emailPass
      }
    });
  }

  // Test Mode: Auto-generate Ethereal test credentials if no real credentials in .env
  if (!transporterPromise) {
    transporterPromise = (async () => {
      console.log('\n\x1b[36m[Mailer] EMAIL_USER/EMAIL_PASS not set in backend/.env. Generating test SMTP credentials...\x1b[0m');
      try {
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass
          }
        });
      } catch (err) {
        console.error('\x1b[31m[Mailer] Error creating test account:\x1b[0m', err.message);
      }
    })();
  }
  return transporterPromise;
};


// @route   POST /api/auth/register
// @desc    Register a new user (for testing)
// @access  Public
router.post('/register', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      password: hashedPassword
    });

    await user.save();
    res.status(201).json({ message: 'User registered successfully. You can now login or reset password.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields' });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    res.status(200).json({ 
      message: 'Login successful', 
      user: { id: user._id, email: user.email } 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Send password reset email
// @access  Public
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Please enter your email' });
  }

  let user = null;
  let resetLink = '';

  try {
    user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No account found with that email address' });
    }

    // Generate random secure token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Set expiry: 15 minutes from now
    const expiryTime = Date.now() + 15 * 60 * 1000;

    // Save to user model
    user.resetPasswordToken = token;
    user.resetPasswordExpires = expiryTime;
    await user.save();

    // Create reset URL
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    resetLink = `${clientUrl}/reset-password/${token}`;

    // Get transporter and send mail
    const transporter = await getTransporter();
    
    const mailOptions = {
      from: '"Security Support" <no-reply@auth-system.com>',
      to: user.email,
      subject: 'Password Reset Request',
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n` +
            `Please click on the following link, or paste this into your browser to complete the process within 15 minutes:\n\n` +
            `${resetLink}\n\n` +
            `If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4A90E2; text-align: center;">Reset Your Password</h2>
          <p>Hello,</p>
          <p>We received a request to reset the password for your account associated with <strong>${user.email}</strong>.</p>
          <p>To proceed, please click the button below. This link is valid for <strong>15 minutes</strong>.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #4A90E2; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Reset Password</a>
          </div>
          <p>If the button doesn't work, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; color: #888888; font-size: 13px;">${resetLink}</p>
          <hr style="border: none; border-top: 1px solid #eeeeee; margin: 20px 0;" />
          <p style="font-size: 12px; color: #aaaaaa;">If you did not make this request, you can safely ignore this email. Your password will remain unchanged.</p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`\n\x1b[32m[Mailer] Reset email dispatched to ${user.email}\x1b[0m`);
    console.log(`\x1b[36m[Mailer] 🔑 Direct Reset Link:\x1b[0m \x1b[33m${resetLink}\x1b[0m`);
    
    // If using Ethereal, log the preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`\x1b[35m[Mailer] Ethereal Test Mailbox Link: ${previewUrl}\x1b[0m\n`);
      return res.status(200).json({ 
        message: 'Password reset link sent! Check server terminal for direct reset URL or preview mailbox.', 
        previewUrl,
        resetLink
      });
    }

    res.status(200).json({ message: 'Password reset link sent to your email.' });

  } catch (err) {
    console.error('\x1b[31m[Mailer] Error sending via SMTP:\x1b[0m', err.message);
    if (resetLink) {
      console.log(`\x1b[36m[Mailer] 🔑 Direct Reset Link generated for ${email}:\x1b[0m \x1b[33m${resetLink}\x1b[0m\n`);
    }

    if (err.message && (err.message.includes('535') || err.message.includes('Username and Password not accepted'))) {
      return res.status(200).json({ 
        message: 'Password reset token created successfully!',
        resetLink,
        devNotice: 'Google requires a 16-character App Password to send real emails to your Gmail inbox.'
      });
    }
    res.status(500).json({ message: 'Server error while sending email: ' + err.message, resetLink });
  }



});

// @route   GET /api/auth/verify-token/:token
// @desc    Verify password reset token validity and expiry
// @access  Public
router.get('/verify-token/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() } // Must be in the future
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    res.status(200).json({ message: 'Token is valid', email: user.email });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error verifying token' });
  }
});

// @route   POST /api/auth/reset-password/:token
// @desc    Reset password using token
// @access  Public
router.post('/reset-password/:token', async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  if (!password || password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters long' });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Password reset token is invalid or has expired.' });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);
    
    // Clear token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await user.save();

    res.status(200).json({ message: 'Password updated successfully. You can now log in.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error resetting password' });
  }
});

module.exports = router;
