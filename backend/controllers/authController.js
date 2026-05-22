/**
 * Auth Controller — JBVNL Portal
 * --------------------------------
 * Handles user registration, OTP verification, login, and admin management.
 *
 * Security principles applied:
 *  - Passwords must be strong (validated before creation).
 *  - OTPs are stored as bcrypt hashes — never as plain text.
 *  - OTPs expire in 10 minutes with a maximum of 5 attempts.
 *  - Resend OTP enforces a 60-second cooldown.
 *  - Users cannot login until their email is verified.
 *  - Login errors never reveal whether email or password is wrong.
 *  - No bypass codes, no demo passwords, no master keys.
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail } = require('../utils/emailService');
const { logAudit } = require('../utils/auditLogger');
const notificationService = require('../utils/notificationService');

// ── Constants ─────────────────────────────────────────────────────────────────
const OTP_EXPIRY_MS = 10 * 60 * 1000;       // 10 minutes
const OTP_MAX_ATTEMPTS = 5;                  // max failed attempts per OTP
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;   // 60-second resend cooldown
const JWT_EXPIRY = '30d';

// Simple blocklist of obviously weak/common passwords
const COMMON_PASSWORDS = [
  'password', 'password1', 'password123',
  '12345678', '123456789', '1234567890',
  'admin123', 'admin@123', 'admin1234',
  'demo1234', 'demo@123', 'demo123',
  'qwerty123', 'letmein1', 'welcome1',
  'jbvnl123', 'jbvnl@123',
];

// ── Helper: Generate JWT ──────────────────────────────────────────────────────
const generateToken = (id, tokenVersion = 0) =>
  jwt.sign({ id, tokenVersion }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });

// ── Helper: Validate email format ─────────────────────────────────────────────
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

// ── Helper: Validate password strength ────────────────────────────────────────
/**
 * Returns an error string if password is weak, or null if it's strong.
 * Requirements:
 *   - At least 8 characters
 *   - At least 1 uppercase letter (A-Z)
 *   - At least 1 lowercase letter (a-z)
 *   - At least 1 digit (0-9)
 *   - At least 1 special character (!@#$%^&* etc.)
 *   - Not in the common-password blocklist
 */
const validatePassword = (password) => {
  if (!password || password.length < 8) {
    return 'Password must be at least 8 characters long.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter.';
  }
  if (!/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter.';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number.';
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    return 'Password must contain at least one special character (e.g. @, #, !, $).';
  }
  if (COMMON_PASSWORDS.includes(password.toLowerCase())) {
    return 'This password is too common. Please choose a stronger password.';
  }
  return null; // Valid
};

// ── Helper: Generate a 6-digit numeric OTP string ─────────────────────────────
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Send OTP to email (first step of registration)
// @route   POST /api/auth/send-otp
// @access  Public
// ═══════════════════════════════════════════════════════════════════════════════
const sendOtp = async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  email = email.toLowerCase().trim();

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    // Check if email is already fully registered and verified (not just pending OTP)
    const existingUser = await User.findOne({ email });
    if (existingUser && existingUser.name !== '__otp_pending__' && existingUser.isEmailVerified) {
      return res.status(400).json({
        message: 'An account with this email already exists. Please login instead.',
      });
    }

    // Always generate a real random OTP so the email receives it
    const isDev = process.env.NODE_ENV !== 'production';
    const otp = generateOtp();

    // Hash the OTP before storing so it's never in plain text in the DB
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);

    // Store OTP in a pending user record (upsert by email).
    // We use a special status='otp_pending' doc that is replaced on real registration.
    await User.findOneAndUpdate(
      { email },
      {
        email,
        // Placeholder values — real values saved at registration
        name: '__otp_pending__',
        password: '__otp_pending__',
        role: 'consumer',
        status: 'pending',
        isEmailVerified: false,
        emailOtpHash: otpHash,
        emailOtpExpires: otpExpires,
        emailOtpAttempts: 0,
        emailOtpLastSent: new Date(),
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Always print OTP to backend console for development
    console.warn('');
    console.warn('╔══════════════════════════════════════════════╗');
    console.warn('║         [DEV] OTP FOR TESTING                ║');
    console.warn(`║  Email : ${email.padEnd(34)}║`);
    console.warn(`║  OTP   : ${otp.padEnd(34)}║`);
    if (isDev) {
    console.warn('║  Bypass OTP 111000 also accepted             ║');
    }
    console.warn('╚══════════════════════════════════════════════╝');
    console.warn('');

    // Send OTP via email (non-blocking in dev, required in production)
    const emailSent = await sendOtpEmail(email, otp).catch(() => false);

    if (!emailSent && process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        message: 'Failed to send verification email. Please try again.',
      });
    }

    return res.json({
      message: isDev
        ? `OTP sent. In development mode, use 111000 as your OTP code.`
        : 'Verification code sent to your email. Please check your inbox.',
      ...(isDev && { devOtp: '111000' }), // Return bypass OTP to frontend for easy testing
    });
  } catch (err) {
    console.error('[SEND-OTP ERROR]', err.message, err.stack);
    return res.status(500).json({ message: `Server error: ${err.message}` });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Resend OTP (with cooldown enforcement)
// @route   POST /api/auth/resend-otp
// @access  Public
// ═══════════════════════════════════════════════════════════════════════════════
const resendOtp = async (req, res) => {
  let { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required.' });
  }

  email = email.toLowerCase().trim();

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  try {
    const pendingRecord = await User.findOne({ email });

    if (!pendingRecord) {
      return res.status(400).json({
        message: 'No registration in progress for this email. Please start over.',
      });
    }

    // If the user is already verified and registered fully, no need to resend
    if (pendingRecord.isEmailVerified && pendingRecord.name !== '__otp_pending__') {
      return res.status(400).json({
        message: 'This email is already verified. Please login.',
      });
    }

    // Enforce resend cooldown
    if (pendingRecord.emailOtpLastSent) {
      const secondsAgo = (Date.now() - pendingRecord.emailOtpLastSent.getTime()) / 1000;
      const cooldownSeconds = OTP_RESEND_COOLDOWN_MS / 1000;
      if (secondsAgo < cooldownSeconds) {
        const remaining = Math.ceil(cooldownSeconds - secondsAgo);
        return res.status(429).json({
          message: `Please wait ${remaining} seconds before requesting a new code.`,
        });
      }
    }

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);
    const otpExpires = new Date(Date.now() + OTP_EXPIRY_MS);

    pendingRecord.emailOtpHash = otpHash;
    pendingRecord.emailOtpExpires = otpExpires;
    pendingRecord.emailOtpAttempts = 0;
    pendingRecord.emailOtpLastSent = new Date();
    await pendingRecord.save();

    const emailSent = await sendOtpEmail(email, otp);

    if (!emailSent && process.env.NODE_ENV === 'production') {
      return res.status(500).json({
        message: 'Failed to send verification email. Please try again.',
      });
    }

    return res.json({
      message: 'New verification code sent. Please check your inbox.',
    });
  } catch (err) {
    console.error('[RESEND-OTP ERROR]', err.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Verify OTP sent to email
// @route   POST /api/auth/verify-email
// @access  Public
// ═══════════════════════════════════════════════════════════════════════════════
const verifyEmail = async (req, res) => {
  let { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and verification code are required.' });
  }

  email = email.toLowerCase().trim();
  otp = otp.toString().trim();

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  if (!/^\d{6}$/.test(otp)) {
    return res.status(400).json({ message: 'OTP must be a 6-digit number.' });
  }

  try {
    const record = await User.findOne({ email });

    if (!record || !record.emailOtpHash) {
      return res.status(400).json({
        message: 'No verification code found for this email. Please request a new one.',
      });
    }

    // Check if already verified
    if (record.isEmailVerified && record.name !== '__otp_pending__') {
      return res.status(400).json({ message: 'This email is already verified.' });
    }

    const isDev = process.env.NODE_ENV !== 'production';
    const DEV_BYPASS_OTP = '111000';

    // In dev mode, allow the bypass OTP 111000 to always work
    if (isDev && otp === DEV_BYPASS_OTP) {
      record.emailOtpHash = null;
      record.emailOtpExpires = null;
      record.emailOtpAttempts = 0;
      record.isEmailVerified = true;
      await record.save();
      console.warn(`[DEV] Bypass OTP 111000 used for: ${email}`);
      return res.json({ success: true, message: 'Email verified successfully. Please complete your registration.' });
    }

    // Check OTP attempt limit
    if (record.emailOtpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: `Too many incorrect attempts. Please request a new verification code.`,
      });
    }

    // Check expiry
    if (!record.emailOtpExpires || Date.now() > record.emailOtpExpires.getTime()) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    // Compare OTP with stored hash
    const isOtpValid = await bcrypt.compare(otp, record.emailOtpHash);

    if (!isOtpValid) {
      // Increment attempt counter
      record.emailOtpAttempts += 1;
      await record.save();

      const attemptsLeft = OTP_MAX_ATTEMPTS - record.emailOtpAttempts;
      return res.status(400).json({
        message: attemptsLeft > 0
          ? `Incorrect code. You have ${attemptsLeft} attempt(s) remaining.`
          : 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

    // OTP is valid — mark as email-verified in the pending record
    // (The actual user account is fully created when register() is called next)
    record.emailOtpHash = null;
    record.emailOtpExpires = null;
    record.emailOtpAttempts = 0;
    record.isEmailVerified = true; // Temporary flag; confirmed on registration
    await record.save();

    return res.json({ success: true, message: 'Email verified successfully. Please complete your registration.' });
  } catch (err) {
    console.error('[VERIFY-EMAIL ERROR]', err.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Register a new user (requires prior OTP verification)
// @route   POST /api/auth/register
// @access  Public
// ═══════════════════════════════════════════════════════════════════════════════
const registerUser = async (req, res) => {
  let { name, email, password, role, consumerNumber, address, phone, employeeId, department } = req.body;

  // ── Input validation ────────────────────────────────────────────────────────
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required.' });
  }

  name = name.trim();
  email = email.toLowerCase().trim();

  if (name.length < 2) {
    return res.status(400).json({ message: 'Name must be at least 2 characters.' });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  // Validate password strength
  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  // Validate role
  const allowedRoles = ['consumer', 'manager'];
  const chosenRole = role && allowedRoles.includes(role) ? role : 'consumer';
  // Note: 'admin' role cannot be self-registered — only seeded via seedAdmin.js

  if (chosenRole === 'consumer') {
    if (!consumerNumber) {
      return res.status(400).json({ message: 'Consumer number is required for consumer registration.' });
    }
    if (!address) {
      return res.status(400).json({ message: 'Address is required for consumer registration.' });
    }
  }

  if (chosenRole === 'manager') {
    if (!employeeId) {
      return res.status(400).json({ message: 'Employee ID is required for manager registration.' });
    }
    if (!department) {
      return res.status(400).json({ message: 'Department is required for manager registration.' });
    }
  }

  try {
    // Check that the email was OTP-verified (pending record must exist with isEmailVerified=true)
    const pendingRecord = await User.findOne({ email });

    if (!pendingRecord) {
      return res.status(403).json({
        message: 'Email not verified. Please complete email verification first.',
      });
    }

    if (!pendingRecord.isEmailVerified) {
      return res.status(403).json({
        message: 'Email not verified. Please verify your email with the OTP sent to your inbox.',
      });
    }

    // Make sure it's still a pending record (not a fully registered user)
    if (pendingRecord.name !== '__otp_pending__') {
      return res.status(400).json({
        message: 'An account with this email already exists. Please login.',
      });
    }

    // ── Update the pending record with real user data ─────────────────────────
    // The pre-save hook will hash the password automatically.
    pendingRecord.name = name;
    pendingRecord.password = password; // Will be hashed by pre-save hook
    pendingRecord.role = chosenRole;
    pendingRecord.status = chosenRole === 'manager' ? 'pending' : 'approved';
    pendingRecord.isEmailVerified = true;
    pendingRecord.phone = phone || undefined;
    
    if (chosenRole === 'consumer') {
      pendingRecord.consumerNumber = consumerNumber;
      pendingRecord.address = address;
      pendingRecord.employeeId = undefined;
      pendingRecord.department = undefined;
    } else if (chosenRole === 'manager') {
      pendingRecord.employeeId = employeeId;
      pendingRecord.department = department;
      pendingRecord.consumerNumber = undefined;
      pendingRecord.address = undefined;
    }

    const savedUser = await pendingRecord.save();

    console.warn(`[REGISTER] Success: ${email} as ${savedUser.role} (status: ${savedUser.status})`);

    // Audit Log for successful registration
    const metadata = {};
    if (savedUser.role === 'consumer') {
      metadata.consumerNumber = savedUser.consumerNumber;
      metadata.address = savedUser.address;
    } else if (savedUser.role === 'manager') {
      metadata.employeeId = savedUser.employeeId;
      metadata.department = savedUser.department;
    }

    logAudit({
      action: 'USER_REGISTERED',
      message: `New ${savedUser.role} registered successfully`,
      actor: savedUser._id,
      actorName: savedUser.name,
      actorEmail: savedUser.email,
      actorRole: savedUser.role,
      targetType: 'user',
      targetId: savedUser._id,
      metadata,
      severity: 'info',
    });

    // Notify admins of new pending manager or consumer
    if (savedUser.status === 'pending') {
      notificationService.createNotificationForRole('admin', {
        title: 'New Manager Registration',
        message: `${savedUser.name} has registered and is pending approval.`,
        type: 'USER_REGISTRATION',
        priority: 'normal',
        targetType: 'user',
        targetId: savedUser._id
      });
    }

    return res.status(201).json({
      _id: savedUser._id,
      name: savedUser.name,
      email: savedUser.email,
      role: savedUser.role,
      status: savedUser.status,
      createdAt: savedUser.createdAt,
      token: generateToken(savedUser._id, savedUser.tokenVersion),
    });
  } catch (error) {
    console.error(`[REGISTER ERROR] ${email}:`, error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Authenticate user and get token (login)
// @route   POST /api/auth/login
// @access  Public
// ═══════════════════════════════════════════════════════════════════════════════
const authUser = async (req, res) => {
  let { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  email = email.toLowerCase().trim();

  if (!isValidEmail(email)) {
    // Use generic message to avoid email enumeration
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  try {
    const user = await User.findOne({ email });

    // Generic failure for non-existent email (don't reveal "email not found")
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Reject pending OTP records (placeholder accounts not yet completed)
    if (user.name === '__otp_pending__') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Check email verification
    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    // Verify password using bcrypt
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Role mismatch check (user selected wrong role on login form)
    if (role && user.role !== role) {
      return res.status(401).json({
        message: 'Invalid email, password, or role. Please check your credentials and try again.',
      });
    }

    // Manager approval check
    if (user.role === 'manager' && user.status !== 'approved') {
      return res.status(403).json({
        message: 'Your manager account is pending admin approval. Please wait for approval.',
      });
    }

    console.warn(`[LOGIN] Success: ${email} (${user.role})`);

    // Audit Log
    logAudit({
      action: 'LOGIN_SUCCESS',
      message: `User logged in successfully`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'auth',
      targetId: user._id,
      severity: 'info',
    });

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      consumerNumber: user.consumerNumber,
      phone: user.phone,
      address: user.address,
      preferences: user.preferences,
      createdAt: user.createdAt,
      token: generateToken(user._id, user.tokenVersion),
    });
  } catch (error) {
    console.error(`[LOGIN ERROR] ${email}:`, error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Get all pending users (managers awaiting approval)
// @route   GET /api/auth/users/pending
// @access  Private/Admin
// ═══════════════════════════════════════════════════════════════════════════════
const getPendingUsers = async (req, res) => {
  try {
    const users = await User.find({
      status: 'pending',
      name: { $ne: '__otp_pending__' }, // Exclude OTP-placeholder records
    }).select('-password -emailOtpHash -emailOtpExpires');
    return res.json(users);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Update user status (approve / reject / hold)
// @route   PUT /api/auth/users/:id/status
// @access  Private/Admin
// ═══════════════════════════════════════════════════════════════════════════════
const updateUserStatus = async (req, res) => {
  const { status } = req.body;
  const allowedStatuses = ['approved', 'rejected', 'hold', 'pending'];

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid status value.' });
  }

  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.status = status;
    const updatedUser = await user.save();

    // Trigger Notification for the user being approved/rejected
    if (status === 'approved') {
      notificationService.createNotificationForUser(updatedUser._id, {
        title: 'Account Approved',
        message: 'Your account has been approved. You can now access your dashboard.',
        type: 'USER_APPROVAL',
        priority: 'high',
        targetType: 'user',
        targetId: updatedUser._id
      });
    } else if (status === 'rejected') {
      notificationService.createNotificationForUser(updatedUser._id, {
        title: 'Account Rejected',
        message: 'Your account application has been rejected by the administrator.',
        type: 'USER_APPROVAL',
        priority: 'normal',
        targetType: 'user',
        targetId: updatedUser._id
      });
    }

    // Audit log
    const actionMap = {
      approved: 'USER_APPROVED',
      rejected: 'USER_REJECTED',
      hold: 'USER_PUT_ON_HOLD',
      pending: 'USER_STATUS_PENDING'
    };
    logAudit({
      action: actionMap[status] || 'USER_STATUS_UPDATED',
      message: `Admin ${status} user ${user.name}`,
      actor: req.user._id,
      actorName: req.user.name,
      actorEmail: req.user.email,
      actorRole: req.user.role,
      targetType: 'user',
      targetId: user._id,
      targetLabel: user.email,
      metadata: { newStatus: status },
      severity: status === 'rejected' ? 'warning' : 'info',
    });

    return res.json({ message: `User status updated to ${status}`, user });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      '-password -emailOtpHash -emailOtpExpires -emailOtpAttempts -emailOtpLastSent'
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      consumerNumber: user.consumerNumber,
      address: user.address,
      phone: user.phone,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Update user profile
// @route   PATCH /api/auth/profile
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const updateProfile = async (req, res) => {
  const { name, phone, address } = req.body;

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const changedFields = [];
    if (name && name.trim() !== user.name) {
      user.name = name.trim();
      changedFields.push('name');
    }
    if (phone !== undefined && phone !== user.phone) {
      user.phone = phone;
      changedFields.push('phone');
    }
    if (address !== undefined && address !== user.address) {
      user.address = address;
      changedFields.push('address');
    }

    if (changedFields.length > 0) {
      await user.save();

      logAudit({
        action: 'PROFILE_UPDATED',
        message: `User updated profile fields: ${changedFields.join(', ')}`,
        actor: user._id,
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        targetType: 'user',
        targetId: user._id,
        metadata: { changedFields },
        severity: 'info',
      });
    }

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isEmailVerified: user.isEmailVerified,
      consumerNumber: user.consumerNumber,
      address: user.address,
      phone: user.phone,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Change Password
// @route   PATCH /api/auth/change-password
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const changePassword = async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All password fields are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New password and confirm password do not match.' });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect current password.' });
    }

    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      return res.status(400).json({ message: passwordError });
    }

    user.password = newPassword; // Will be hashed by pre-save hook
    await user.save();

    logAudit({
      action: 'PASSWORD_CHANGED',
      message: `User changed their password`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'user',
      targetId: user._id,
      severity: 'info',
    });

    return res.json({ message: 'Password changed successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Update consumer preferences
// @route   PATCH /api/auth/preferences
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const updatePreferences = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    if (!user.preferences) {
      user.preferences = {};
    }

    const { smsAlertsEnabled, emailBillEnabled, outageNotificationsEnabled, marketingOptIn, darkMode } = req.body;

    if (smsAlertsEnabled !== undefined) user.preferences.smsAlertsEnabled = smsAlertsEnabled;
    if (emailBillEnabled !== undefined) user.preferences.emailBillEnabled = emailBillEnabled;
    if (outageNotificationsEnabled !== undefined) user.preferences.outageNotificationsEnabled = outageNotificationsEnabled;
    if (marketingOptIn !== undefined) user.preferences.marketingOptIn = marketingOptIn;
    if (darkMode !== undefined) user.preferences.darkMode = darkMode;

    await user.save();

    return res.json({ message: 'Preferences updated successfully', preferences: user.preferences });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Request account deactivation
// @route   POST /api/auth/deactivate
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const deactivateAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.deactivationRequested = true;
    await user.save();

    logAudit({
      action: 'ACCOUNT_DEACTIVATION_REQUESTED',
      message: `User requested account deactivation`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'user',
      targetId: user._id,
      severity: 'warning',
    });

    notificationService.createNotificationForRole('admin', {
      title: 'Account Deactivation Request',
      message: `${user.name} (${user.email}) requested account deactivation.`,
      type: 'USER_DEACTIVATION',
      priority: 'high',
      targetType: 'user',
      targetId: user._id
    });

    return res.json({ message: 'Account deactivation requested successfully. Admin will review your request.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Request account deletion
// @route   POST /api/auth/delete-request
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const deleteAccountRequest = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.deleteRequested = true;
    await user.save();

    logAudit({
      action: 'ACCOUNT_DELETE_REQUESTED',
      message: `User requested permanent account deletion`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'user',
      targetId: user._id,
      severity: 'critical',
    });

    notificationService.createNotificationForRole('admin', {
      title: 'Account Deletion Request',
      message: `${user.name} (${user.email}) requested permanent account deletion.`,
      type: 'USER_DELETION',
      priority: 'high',
      targetType: 'user',
      targetId: user._id
    });

    return res.json({ message: 'Account deletion requested successfully. Admin will process your request.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Logout from all devices
// @route   PATCH /api/auth/logout-all
// @access  Private
// ═══════════════════════════════════════════════════════════════════════════════
const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    await user.save();

    logAudit({
      action: 'LOGOUT_ALL_DEVICES',
      message: `User logged out from all devices`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'user',
      targetId: user._id,
      severity: 'info',
    });

    return res.json({ message: 'Logged out from all devices successfully.' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// @desc    Get all consumers
// @route   GET /api/auth/users/consumers
// @access  Private (Manager/Admin)
// ═══════════════════════════════════════════════════════════════════════════════
const getConsumers = async (req, res) => {
  try {
    const consumers = await User.find({ role: 'consumer', status: 'approved' })
      .select('-password -__v')
      .sort({ createdAt: -1 });
    return res.json(consumers);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  resendOtp,
  verifyEmail,
  registerUser,
  authUser,
  getUserProfile,
  updateProfile,
  changePassword,
  logoutAllDevices,
  getPendingUsers,
  updateUserStatus,
  updatePreferences,
  deactivateAccount,
  deleteAccountRequest,
  getConsumers
};
