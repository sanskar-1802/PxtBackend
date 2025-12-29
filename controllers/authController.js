const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');
const { sendMail } = require('../utils/mailer');

// ------------------ TOKEN HELPERS ------------------ //
const signAccess = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRE || '15m' }
  );

const signRefresh = (user) =>
  jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || '7d' }
  );

// ------------------ AUTH CONTROLLERS ------------------ //

// REGISTER
exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password });
    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    await RefreshToken.create({ user: user._id, token: refreshToken });
    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Register Error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const accessToken = signAccess(user);
    const refreshToken = signRefresh(user);

    await RefreshToken.create({ user: user._id, token: refreshToken });
    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ message: 'Server error during login' });
  }
};

// REFRESH TOKEN
exports.refresh = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });

  try {
    const payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    const existing = await RefreshToken.findOne({ user: payload.id, token });
    if (!existing) return res.status(403).json({ message: 'Invalid refresh token' });

    const user = await User.findById(payload.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Issue a new access token
    const accessToken = signAccess(user);
    res.json({ accessToken });
  } catch (err) {
    console.error('Refresh Error:', err);
    res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
};

// LOGOUT
exports.logout = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: 'No token provided' });

  await RefreshToken.deleteOne({ token });
  res.json({ message: 'Logged out successfully' });
};

// ------------------ PASSWORD RESET ------------------ //

// STEP 1: Request reset email
exports.requestPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Generate temporary token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min expiry

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetTokenExpiry;
    await user.save({ validateBeforeSave: false });

    const resetLink = `https:/pxt-frontend.vercel.app/reset-password?token=${resetToken}&id=${user._id}`;
    await sendMail({
      to: user.email,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Click the link below:\n${resetLink}`
    });
    // console.log("Reset Password Link:", resetLink);


    res.json({ message: 'Password reset email sent successfully' });
  }
  catch (err) {
    console.error('Request Password Error:', err);
    res.status(500).json({ message: 'Failed to send password reset email' });
  }

};

// STEP 2: Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { id, token, password } = req.body;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.resetPasswordToken || user.resetPasswordToken !== token)
      return res.status(400).json({ message: 'Invalid or expired token' });

    if (user.resetPasswordExpires < Date.now())
      return res.status(400).json({ message: 'Reset token expired' });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};
