const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendOtpEmail, sendPasswordResetEmail } = require('../utils/emailService');
const { logAudit } = require('../utils/auditLogger');
const notificationService = require('../utils/notificationService');
const OTP_EXPIRY_MS = 10 * 60 * 1000;       // 10 minutes
const OTP_MAX_ATTEMPTS = 5;                  // max failed attempts per OTP
const OTP_RESEND_COOLDOWN_MS = 60 * 1000;   // 60-second resend cooldown
const JWT_EXPIRY = '30d';
const RESET_TOKEN_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes
const COMMON_PASSWORDS = [
  'password', 'password1', 'password123',
  '12345678', '123456789', '1234567890',
  'admin123', 'admin@123', 'admin1234',
  'demo1234', 'demo@123', 'demo123',
  'qwerty123', 'letmein1', 'welcome1',
  'jbvnl123', 'jbvnl@123',
];
const generateToken = (id, tokenVersion = 0, activeSessionId = null) =>
  jwt.sign({ id, tokenVersion, activeSessionId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRY });
const isValidEmail = (email) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);

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
const generateOtp = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const parseBrowser = (userAgent) => {
  if (!userAgent) return 'Unknown Browser';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Edg/')) return 'Edge';
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Safari')) return 'Safari';
  return 'Unknown Browser';
};
const parseDevice = (userAgent) => {
  if (!userAgent) return 'Unknown Device';
  if (userAgent.includes('Mobi')) return 'Mobile';
  if (userAgent.includes('Tablet') || userAgent.includes('iPad')) return 'Tablet';
  if (userAgent.includes('Windows')) return 'Windows PC';
  if (userAgent.includes('Mac')) return 'Mac';
  if (userAgent.includes('Linux')) return 'Linux PC';
  return 'Desktop';
};
const getClientIp = (req) => {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
};
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

    if (record.emailOtpAttempts >= OTP_MAX_ATTEMPTS) {
      return res.status(429).json({
        message: `Too many incorrect attempts. Please request a new verification code.`,
      });
    }

    if (!record.emailOtpExpires || Date.now() > record.emailOtpExpires.getTime()) {
      return res.status(400).json({
        message: 'Verification code has expired. Please request a new one.',
      });
    }

    const isOtpValid = await bcrypt.compare(otp, record.emailOtpHash);

    if (!isOtpValid) {
      record.emailOtpAttempts += 1;
      await record.save();

      const attemptsLeft = OTP_MAX_ATTEMPTS - record.emailOtpAttempts;
      return res.status(400).json({
        message: attemptsLeft > 0
          ? `Incorrect code. You have ${attemptsLeft} attempt(s) remaining.`
          : 'Too many incorrect attempts. Please request a new verification code.',
      });
    }

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
const registerUser = async (req, res) => {
  let { name, email, password, role, consumerNumber, address, phone, employeeId, department } = req.body;
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

  const passwordError = validatePassword(password);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

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

    if (pendingRecord.name !== '__otp_pending__') {
      return res.status(400).json({
        message: 'An account with this email already exists. Please login.',
      });
    }
    pendingRecord.name = name;
    pendingRecord.password = password; // Will be hashed by pre-save hook
    pendingRecord.role = chosenRole;
    let assignedStatus = 'pending';

    if (chosenRole === 'consumer') {
      const AdminSettings = require('../models/AdminSettings');
      const settings = await AdminSettings.findOne().sort({ createdAt: 1 });
      const threshold = settings?.autoApprovalThreshold ?? 5;

      // Count current pending consumers (exclude OTP placeholder records)
      const pendingCount = await User.countDocuments({
        role: 'consumer',
        status: 'pending',
        name: { $ne: '__otp_pending__' }
      });

      if (pendingCount < threshold) {
        assignedStatus = 'approved';
      } else {
        assignedStatus = 'pending';
      }
    } else if (chosenRole === 'manager') {
      assignedStatus = 'pending';
    }

    pendingRecord.status = assignedStatus;
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

    if (savedUser.status === 'pending') {
      const title = savedUser.role === 'manager' ? 'New Manager Registration' : 'New Consumer Pending Approval';
      const message = savedUser.role === 'manager'
        ? `${savedUser.name} has registered as a manager and is pending approval.`
        : `${savedUser.name} has registered as a consumer but exceeded the auto-approval threshold. Manual approval required.`;

      notificationService.createNotificationForRole('admin', {
        title,
        message,
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
      token: generateToken(savedUser._id, savedUser.tokenVersion, savedUser.activeSessionId),
    });
  } catch (error) {
    console.error(`[REGISTER ERROR] ${email}:`, error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
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

    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    // Reject pending OTP records (placeholder accounts not yet completed)
    if (user.name === '__otp_pending__') {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (!user.isEmailVerified) {
      return res.status(403).json({
        message: 'Please verify your email before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        message: 'Invalid email, password, or role. Please check your credentials and try again.',
      });
    }

    if (user.role === 'manager' && user.status !== 'approved') {
      return res.status(403).json({
        message: 'Your manager account is pending admin approval. Please wait for approval.',
      });
    }

    if (user.activeSessionId) {
      // Stale session protection: if the last heartbeat is older than 30 minutes, automatically replace
      const THIRTY_MINUTES = 30 * 60 * 1000;
      const isStale = user.lastSeenAt && (Date.now() - user.lastSeenAt.getTime() > THIRTY_MINUTES);

      if (!isStale) {
        // Active session exists and is not stale. Prompt for takeover.
        logAudit({
          action: 'SESSION_TAKEOVER_REQUESTED',
          message: `Login attempted but an active session exists`,
          actor: user._id,
          actorName: user.name,
          actorEmail: user.email,
          actorRole: user.role,
          targetType: 'auth',
          targetId: user._id,
          severity: 'info',
        });

        return res.json({
          requiresSessionTakeover: true,
          sessionInfo: {
            loginTime: user.lastLoginAt,
            ipAddress: user.lastLoginIp,
            deviceInfo: user.lastLoginDevice,
            browser: user.lastLoginBrowser,
            location: user.lastLoginLocation
          }
        });
      }

      // If stale, log the automatic replacement and fall through to create a new session
      logAudit({
        action: 'SESSION_STALE_AUTO_REPLACED',
        message: `Stale session (last seen ${user.lastSeenAt}) automatically replaced`,
        actor: user._id,
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        targetType: 'auth',
        targetId: user._id,
        severity: 'info',
      });
    }

    // No active session or session was stale. Create a new session.
    const newSessionId = crypto.randomUUID();
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const browser = parseBrowser(userAgent);
    const device = parseDevice(userAgent);
    // Location fallback to IP if true geolocation isn't available
    const location = clientIp !== 'unknown' ? `IP: ${clientIp}` : 'Unknown Location';

    user.activeSessionId = newSessionId;
    user.lastLoginAt = new Date();
    user.lastLoginIp = clientIp;
    user.lastLoginDevice = device;
    user.lastLoginBrowser = browser;
    user.lastLoginLocation = location;
    user.lastSeenAt = new Date(); // initialize heartbeat

    await user.save();

    console.warn(`[LOGIN] Success: ${email} (${user.role})`);

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
      token: generateToken(user._id, user.tokenVersion, user.activeSessionId),
    });
  } catch (error) {
    console.error(`[LOGIN ERROR] ${email}:`, error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
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
      employeeId: user.employeeId,
      department: user.department,
      preferences: user.preferences,
      createdAt: user.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
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
const logoutAllDevices = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    user.tokenVersion = (user.tokenVersion || 0) + 1;
    user.activeSessionId = null;
    user.lastSeenAt = null;
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

const forgotPassword = async (req, res) => {
  // Generic message — used in ALL branches to prevent email enumeration.
  const GENERIC_MSG = 'If an account with that email exists and is eligible, a password reset link has been sent.';

  let { email, role } = req.body;

  if (!email || !role) {
    return res.status(400).json({ message: 'Email and role are required.' });
  }

  email = email.toLowerCase().trim();
  role = role.toLowerCase().trim();

  if (!['consumer', 'manager'].includes(role)) {
    // Return generic message even for admin — never reveal exclusion.
    return res.json({ message: GENERIC_MSG });
  }

  if (!isValidEmail(email)) {
    return res.json({ message: GENERIC_MSG });
  }

  // Resolve FRONTEND_URL — never hardcode URLs.
  const frontendUrl = process.env.FRONTEND_URL
    || (process.env.NODE_ENV !== 'production' ? 'http://localhost:8080' : null);

  if (!frontendUrl) {
    console.error('[FORGOT-PWD] FRONTEND_URL is not set in environment variables.');
    return res.status(500).json({ message: 'Server configuration error. Please contact support.' });
  }

  try {

    const user = await User.findOne({
      email,
      role,
      status: 'approved',
      name: { $ne: '__otp_pending__' },
    });

    if (!user) {
      // Always return generic message — log silently for observability.
      console.warn(`[FORGOT-PWD] Ignored request for email=${email} role=${role} (not found / not approved).`);
      return res.json({ message: GENERIC_MSG });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');

    // Hash the raw token with SHA-256 before persisting — prevents DB leakage.
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);
    await user.save();

    // Build the reset URL using the environment variable (never hardcoded).
    const resetUrl = `${frontendUrl}/reset-password/${rawToken}`;

    const emailSent = await sendPasswordResetEmail(user.email, user.name, resetUrl);

    if (!emailSent && process.env.NODE_ENV === 'production') {
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await user.save();
      return res.status(500).json({ message: 'Failed to send reset email. Please try again.' });
    }

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    logAudit({
      action: 'PASSWORD_RESET_REQUESTED',
      message: `Password reset requested for ${user.name} (${user.email})`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'user',
      targetId: user._id,
      metadata: { ip: clientIp, role: user.role },
      severity: 'info',
    });

    notificationService.createNotificationForUser(user._id, {
      title: 'Password Reset Requested',
      message: 'A password reset link has been sent to your registered email address. It expires in 15 minutes.',
      type: 'SECURITY',
      priority: 'high',
      targetType: 'user',
      targetId: user._id,
    });

    console.warn(`[FORGOT-PWD] Reset email sent to ${user.email}`);
    return res.json({ message: GENERIC_MSG });
  } catch (err) {
    console.error('[FORGOT-PWD ERROR]', err.message, err.stack);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword, confirmPassword } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Reset token is required.' });
  }

  if (!newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'New password and confirmation are required.' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) {
    return res.status(400).json({ message: passwordError });
  }

  try {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() },
      role: { $in: ['consumer', 'manager'] }, // Admin can never reset via this flow.
    });

    if (!user) {
      return res.status(400).json({
        message: 'Password reset link is invalid or has expired. Please request a new one.',
      });
    }

    user.password = newPassword;

    // Clear the reset token fields to prevent reuse.
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    user.tokenVersion = (user.tokenVersion || 0) + 1;

    user.activeSessionId = null;
    user.lastSeenAt = null;

    await user.save();

    const clientIp = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
    logAudit({
      action: 'PASSWORD_RESET_COMPLETED',
      message: `Password successfully reset for ${user.name} (${user.email})`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'user',
      targetId: user._id,
      metadata: { ip: clientIp, role: user.role },
      severity: 'info',
    });

    notificationService.createNotificationForUser(user._id, {
      title: 'Password Changed Successfully',
      message: 'Your password was changed successfully. All active sessions have been signed out.',
      type: 'SECURITY',
      priority: 'high',
      targetType: 'user',
      targetId: user._id,
    });

    console.warn(`[RESET-PWD] Password reset completed for ${user.email}`);
    return res.json({ message: 'Password updated successfully. Please log in again.' });
  } catch (err) {
    console.error('[RESET-PWD ERROR]', err.message, err.stack);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
const takeoverSession = async (req, res) => {
  let { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: 'Email, password, and role are required.' });
  }

  email = email.toLowerCase().trim();

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    // Must explicitly verify the password again before allowing a takeover
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect || user.role !== role) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const newSessionId = crypto.randomUUID();
    const clientIp = getClientIp(req);
    const userAgent = req.headers['user-agent'];
    const browser = parseBrowser(userAgent);
    const device = parseDevice(userAgent);
    const location = clientIp !== 'unknown' ? `IP: ${clientIp}` : 'Unknown Location';

    user.activeSessionId = newSessionId;
    user.lastLoginAt = new Date();
    user.lastLoginIp = clientIp;
    user.lastLoginDevice = device;
    user.lastLoginBrowser = browser;
    user.lastLoginLocation = location;
    user.lastSeenAt = new Date();

    await user.save();

    logAudit({
      action: 'SESSION_TAKEOVER_COMPLETED',
      message: `Session takeover completed. Previous session terminated.`,
      actor: user._id,
      actorName: user.name,
      actorEmail: user.email,
      actorRole: user.role,
      targetType: 'auth',
      targetId: user._id,
      severity: 'warning',
    });

    notificationService.createNotificationForUser(user._id, {
      title: 'Session Taken Over',
      message: 'Your account was logged into from another device. Your previous session was terminated.',
      type: 'SESSION_TERMINATED',
      priority: 'high',
      targetType: 'user',
      targetId: user._id,
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
      token: generateToken(user._id, user.tokenVersion, user.activeSessionId),
    });
  } catch (error) {
    console.error(`[TAKEOVER ERROR] ${email}:`, error.message);
    return res.status(500).json({ message: 'Server error. Please try again.' });
  }
};
const getSessionStatus = async (req, res) => {
  try {
    const user = req.user; // populated by authMiddleware which already checks activeSessionId

    user.lastSeenAt = new Date();
    await user.save();

    return res.json({ valid: true });
  } catch (error) {
    return res.status(500).json({ valid: false, message: error.message });
  }
};
const logoutUser = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.activeSessionId = null;
      user.lastSeenAt = null;
      await user.save();

      logAudit({
        action: 'USER_LOGOUT',
        message: `User explicitly logged out`,
        actor: user._id,
        actorName: user.name,
        actorEmail: user.email,
        actorRole: user.role,
        targetType: 'auth',
        targetId: user._id,
        severity: 'info',
      });
    }

    return res.json({ message: 'Logged out successfully.' });
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
  getConsumers,
  forgotPassword,
  resetPassword,
  takeoverSession,
  getSessionStatus,
  logoutUser,
};
