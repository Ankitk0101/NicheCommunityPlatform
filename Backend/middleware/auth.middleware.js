const jwt = require("jsonwebtoken");
const User = require("../models/auth.model");

const authMiddleware = async (req, res, next) => {
  try {
    
    let token = req.cookies.token;
    
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
 
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      username: user.username
    };
    
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(403).json({ message: "Token expired" });
    }
    if (e.name === "JsonWebTokenError") {
      return res.status(403).json({ message: "Invalid token" });
    }
    return res.status(500).json({ message: "Authentication error", error: e.message });
  }
};

module.exports = authMiddleware;