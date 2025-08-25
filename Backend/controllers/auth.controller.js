const User = require("../models/auth.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/sendEmail.util");


const JWT_SECRET = process.env.JWT_SECRET || "Ankit";

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Please provide all details" });
    }

   
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

  
    const existUsername = await User.findOne({ username });
    if (existUsername) {
      return res.status(400).json({ message: "Username already taken" });
    }

    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.status(400).json({ message: "User already registered with this email" });
    }

    const hashPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ 
      username, 
      email, 
      password: hashPassword 
    });

    // Remove password from response
    const userResponse = {
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      createdAt: newUser.createdAt
    };

    res.status(201).json({ 
      message: "Register successful", 
      user: userResponse 
    });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: "Username or email already exists" });
    }
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Please provide email and password" });
    }

    const existUser = await User.findOne({ email }).select("+password");
    if (!existUser) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const validPassword = await bcrypt.compare(password, existUser.password);
    if (!validPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: existUser._id, email: existUser.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Remove password from response
    const userResponse = {
      _id: existUser._id,
      username: existUser.username,
      email: existUser.email,
      profilePicture: existUser.profilePicture,
      interests: existUser.interests,
      createdAt: existUser.createdAt
    };

    res.status(200).json({ 
      message: "Login successful",
      user: userResponse,
      token // Also send token in response for mobile apps
    });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};

const logout = async (req, res) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict"
    });
    
    res.status(200).json({ message: "Logout successful" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    res.status(200).json({ user });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};

const forgetPassword = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res.status(400).json({ message: "Please provide email" });
    }

    const existUser = await User.findOne({ email });
    if (!existUser) {
      return res.status(200).json({ message: "If the email exists, a reset link has been sent" });
    }

    // JWT token with expiry 15 min
    const resetToken = jwt.sign(
      { id: existUser._id, email: existUser.email },
      JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetUrl =`${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

     console.log(resetUrl)
   await sendEmail(email, "Password Reset Request", message);

    res.status(200).json({ message: "Password reset link sent to email" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};

// ==========================
// Reset Password
// ==========================
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { newPassword } = req.body;

    if (!newPassword) {
      return res.status(400).json({ message: "New password is required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    const existUser = await User.findById(decoded.id);
    if (!existUser) {
      return res.status(400).json({ message: "User not found" });
    }

    const hashPassword = await bcrypt.hash(newPassword, 10);
    existUser.password = hashPassword;
    await existUser.save();

    res.status(200).json({ message: "Password changed successfully" });
  } catch (e) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};


const validateResetToken = async (req, res) => {
  try {
    const { token } = req.params;

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return res.status(200).json({ message: "Valid reset token", userId: decoded.id });
    } catch (err) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }
  } catch (e) {
    res.status(500).json({ message: "Something went wrong", error: e.message });
  }
};

module.exports = { 
  register, 
  login, 
  logout, 
  getCurrentUser,
  forgetPassword, 
  resetPassword,
  validateResetToken
};