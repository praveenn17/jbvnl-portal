const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// In-memory OTP storage (for demo purposes)
const otpStore = new Map();

// @desc    Send OTP to email (logs to console for testing)
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  let { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  email = email.toLowerCase().trim();

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Store OTP with 5-minute expiry
  otpStore.set(email, {
    otp,
    expires: Date.now() + 5 * 60 * 1000
  });

  // LOG TO TERMINAL - This is what the user is looking for
  console.log('-----------------------------------------');
  console.log(`[DEBUG] OTP GENERATED FOR ${email}: ${otp}`);
  console.log('-----------------------------------------');

  // Also write to a file in the ROOT PROJECT DIRECTORY for easy access
  fs.writeFileSync(path.join(__dirname, '../../otp_debug.txt'), `VERIFICATION CODE FOR ${email}: ${otp}\nLast Generated: ${new Date().toLocaleString()}`);

  res.json({ 
    message: 'OTP sent successfully', 
    debugOtp: process.env.NODE_ENV === 'development' ? otp : undefined,
    info: 'Check otp_debug.txt in the main folder or server terminal'
  });
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  let { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  email = email.toLowerCase().trim();
  otp = otp.toString().trim();

  // DEVELOPER BYPASS (Only in dev mode to handle server restarts during testing)
  if (process.env.NODE_ENV === 'development' && otp === '000000') {
    console.log(`[DEBUG] OTP Bypass used for ${email}`);
    return res.json({ success: true, message: 'Email verified (Developer Bypass)' });
  }

  const storedData = otpStore.get(email);

  if (!storedData) {
    console.log(`[DEBUG] OTP Verification failed: No OTP found for ${email}`);
    return res.status(400).json({ message: 'OTP not found or expired' });
  }

  if (Date.now() > storedData.expires) {
    otpStore.delete(email);
    console.log(`[DEBUG] OTP Verification failed: OTP expired for ${email}`);
    return res.status(400).json({ message: 'OTP expired' });
  }

  console.log(`[DEBUG] Comparing OTP for ${email}: Received "${otp}", Stored "${storedData.otp}"`);

  if (storedData.otp !== otp) {
    console.log(`[DEBUG] OTP Verification failed: Mismatch for ${email}`);
    return res.status(400).json({ message: 'Invalid OTP' });
  }

  // OTP is valid
  otpStore.delete(email);
  console.log(`[DEBUG] OTP Verified successfully for ${email}`);
  res.json({ success: true, message: 'Email verified' });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  let { name, email, password, role, consumerNumber, address, phone } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  email = email.toLowerCase().trim();
  console.log(`[DEBUG] Attempting to register user: ${email}`);

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log(`[DEBUG] Registration failed: User already exists - ${email}`);
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'consumer',
      status: 'approved', // Auto-approve all for easier testing
      consumerNumber,
      address,
      phone
    });

    if (user) {
      console.log(`[DEBUG] User registered successfully: ${email}`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        token: generateToken(user._id),
      });
    } else {
      console.log(`[DEBUG] Registration failed: Invalid user data for ${email}`);
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`[DEBUG] Registration error for ${email}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = async (req, res) => {
  let { email, password, role } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  email = email.toLowerCase().trim();
  console.log(`[DEBUG] Login attempt: ${email} as ${role}`);

  try {
    const user = await User.findOne({ email });

    if (user) {
      // MASTER BYPASS for developer testing ONLY
      const isMasterPassword = process.env.NODE_ENV !== 'production' && password === '999999';
      const isPasswordCorrect = await user.comparePassword(password);

      if (isMasterPassword || isPasswordCorrect) {
        if (isMasterPassword) {
          console.log(`%c[BYPASS] Developer Master Password used for: ${email}`, 'color: orange; font-weight: bold');
        }

        // Check if role matches
        if (role && user.role !== role) {
          console.log(`[DEBUG] Login failed: Role mismatch for ${email}. Expected ${role}, got ${user.role}`);
          return res.status(401).json({ message: `Role mismatch. This account is registered as a ${user.role}.` });
        }

        // Check status - Disabled to allow all users to login immediately
        // if (user.status !== 'approved') {
        //   console.log(`[DEBUG] Login failed: Account pending approval for ${email}`);
        //   return res.status(401).json({ message: 'Account is pending approval. Please contact a manager.' });
        // }

        console.log(`[DEBUG] Login successful: ${email}`);
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          token: generateToken(user._id),
        });
      }
    }

    // Default failure
    console.log(`[DEBUG] Login failed: Invalid email or password for ${email}`);
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error(`[DEBUG] Auth error for ${email}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending users
// @route   GET /api/auth/users/pending
// @access  Private/Admin
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ status: 'pending' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      user.status = status;
      await user.save();
      res.json({ message: `User status updated to ${status}`, user });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        consumerNumber: user.consumerNumber,
        address: user.address,
        phone: user.phone
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  registerUser,
  authUser,
  getUserProfile,
  sendOtp,
  verifyOtp,
  getPendingUsers,
  updateUserStatus,
};
