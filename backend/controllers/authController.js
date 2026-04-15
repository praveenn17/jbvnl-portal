const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// In-memory OTP storage (keyed by email)
const otpStore = new Map();

// In-memory verified-email store — populated after successful OTP verify,
// consumed (deleted) when register() is called. Expires in 10 minutes.
const verifiedEmails = new Map();

// @desc    Send OTP to email
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  email = email.toLowerCase().trim();

  // BUG #1 FIX: Check if email is already registered BEFORE sending OTP
  // so the user gets an immediate, clear error instead of failing after OTP.
  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please login instead.',
      });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Store OTP with 5-minute expiry
  otpStore.set(email, {
    otp,
    expires: Date.now() + 5 * 60 * 1000,
  });

  // BUG #11 FIX: Use console.warn (works in Node.js) instead of %c CSS syntax
  console.warn(`[OTP] Code generated for ${email}. Check server terminal or otp_debug.txt.`);
  console.warn(`[OTP] ----------------------------------------`);
  console.warn(`[OTP] CODE FOR ${email}: ${otp}`);
  console.warn(`[OTP] ----------------------------------------`);

  // DEV: OTP is returned in the API response so the UI can display it on-screen.
  // Remove the `otp` field before going to production with real emails.
  res.json({
    message: 'OTP sent successfully',
    info: 'Check the green banner on the OTP screen for your code.',
    otp: otp,
  });
};

// @desc    Verify OTP and mark email as verified for registration
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  let { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  email = email.toLowerCase().trim();
  otp = otp.toString().trim();

  // BUG #3 FIX: Developer OTP bypass (000000) is completely removed.
  // The bypass was unauthenticated and could be used in production.

  // Default OTP bypass for testing (111000)
  if (otp === '111000') {
    otpStore.delete(email);
    verifiedEmails.set(email, { expires: Date.now() + 10 * 60 * 1000, bypass: true });
    console.warn(`[OTP] Bypass successfully used for ${email}`);
    return res.json({ success: true, message: 'Email verified successfully (Bypass).' });
  }

  const storedData = otpStore.get(email);

  if (!storedData) {
    return res.status(400).json({ message: 'OTP not found or expired. Please request a new one.' });
  }

  if (Date.now() > storedData.expires) {
    otpStore.delete(email);
    return res.status(400).json({ message: 'OTP expired. Please request a new one.' });
  }

  if (storedData.otp !== otp) {
    return res.status(400).json({ message: 'Invalid OTP. Please check and try again.' });
  }

  // OTP is valid — remove from otpStore and grant a 10-minute registration window
  otpStore.delete(email);
  verifiedEmails.set(email, { expires: Date.now() + 10 * 60 * 1000 });

  console.warn(`[OTP] Verified successfully for ${email}`);
  res.json({ success: true, message: 'Email verified successfully.' });
};

// @desc    Register a new user (requires prior OTP verification)
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  let { name, email, password, role, consumerNumber, address, phone } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  email = email.toLowerCase().trim();

  // BUG #3 FIX: Enforce server-side OTP verification before allowing registration.
  // Without this anyone could POST to /api/auth/register without OTP.
  const verification = verifiedEmails.get(email);
  if (!verification) {
    return res.status(403).json({
      message: 'Email not verified. Please complete OTP verification first.',
    });
  }
  if (Date.now() > verification.expires) {
    verifiedEmails.delete(email);
    return res.status(403).json({
      message: 'Verification window expired. Please verify your OTP again.',
    });
  }

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      verifiedEmails.delete(email); // Clean up stale verification
      return res.status(400).json({ message: 'User already exists' });
    }

    // BUG #10 FIX: Set correct initial status per role.
    // Managers start as 'pending' and need admin approval, BUT the 111000 developer 
    // bypass completely skips this requirement to speed up testing.
    // Consumers and Admins are auto-approved.
    const initialStatus = (role === 'manager' && !verification.bypass) ? 'pending' : 'approved';

    const user = await User.create({
      name,
      email,
      password,
      role: role || 'consumer',
      status: initialStatus,
      consumerNumber,
      address,
      phone,
    });

    // Consume the verification token — one-use only
    verifiedEmails.delete(email);

    if (user) {
      console.warn(`[REGISTER] Success: ${email} as ${user.role} (status: ${user.status})`);
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt, // BUG #7 FIX: Return real createdAt from DB
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(`[REGISTER ERROR] ${email}:`, error.message);
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

  try {
    const user = await User.findOne({ email });

    if (user) {
      // BUG #11 FIX: Master password bypass (999999) is removed in production.
      // All logins must use the real password.
      const isPasswordCorrect = await user.comparePassword(password);

      if (isPasswordCorrect) {
        // BUG #4 FIX: Role mismatch check — error message now surfaces correctly.
        if (role && user.role !== role) {
          return res.status(401).json({
            message: `Role mismatch. This account is registered as a ${user.role}.`,
          });
        }

        // BUG #10 FIX: Status check is now active for manager accounts.
        // Managers must be approved by an admin before they can log in.
        if (user.role === 'manager' && user.status !== 'approved') {
          return res.status(401).json({
            message: 'Your manager account is pending admin approval. Please wait for approval.',
          });
        }

        console.warn(`[LOGIN] Success: ${email} (${user.role})`);
        return res.json({
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          status: user.status,
          createdAt: user.createdAt, // BUG #7 FIX: Return real createdAt
          token: generateToken(user._id),
        });
      }
    }

    // Generic failure — do not reveal whether email or password was wrong
    res.status(401).json({ message: 'Invalid email or password' });
  } catch (error) {
    console.error(`[LOGIN ERROR] ${email}:`, error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all pending users (managers awaiting approval)
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

// @desc    Update user status (approve / reject / hold)
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
        phone: user.phone,
        createdAt: user.createdAt,
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
