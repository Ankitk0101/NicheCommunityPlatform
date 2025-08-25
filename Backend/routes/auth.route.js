const express = require("express");
const {
  register, 
  login, 
  logout, 
  getCurrentUser,
  forgetPassword, 
  resetPassword,
  validateResetToken
} = require('../controllers/auth.controller');
const validateEmail = require('../middleware/validateEmail.middleware');
const authMiddleware = require('../middleware/auth.middleware');
const authRoutes = express.Router();

authRoutes.post("/signup", validateEmail, register);
authRoutes.post("/login", validateEmail, login);
authRoutes.post("/logout", logout);
authRoutes.get("/me", authMiddleware, getCurrentUser);
authRoutes.post("/forgot-password", validateEmail, forgetPassword);
authRoutes.post("/reset-password/:token", resetPassword);
authRoutes.get("/validate-reset-token/:token", validateResetToken);

module.exports = authRoutes;