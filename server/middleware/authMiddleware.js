// authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const isDev = process.env.NODE_ENV === 'development';

const protect = async (req, res, next) => {
  let token;
  
  if (isDev) console.log("🔍 Auth middleware triggered");
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; // split to get the bearer token
      if (isDev) console.log("🟢 Token extracted (length:", token.length, ")");
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (isDev) console.log("🧠 Decoded JWT for user:", decoded._id || decoded.id);
      
      // Check both 'id' and '_id' properties in case of inconsistency
      const userId = decoded.id || decoded._id || decoded.userId;
      if (isDev) console.log("🔍 Looking for user with ID:", userId);
      
      if (!userId) {
        console.log("❌ No user ID found in token");
        return res.status(401).json({ message: "Invalid token - No user ID" });
      }
      
      const user = await User.findById(userId).select("-password");
      if (isDev) console.log("✅ User found:", user?._id);
      
      if (!user) {
        console.log("❌ User not found in database with ID:", userId);
        return res.status(401).json({ message: "Unauthorized - User not found in DB" });
      }

      // 🔒 Reject blocked users even if their JWT is still valid
      if (user.isBlocked) {
        return res.status(403).json({ message: "Your account has been blocked. Contact support." });
      }
      
      req.user = user;
      if (isDev) console.log("✅ User attached to request:", req.user._id);
      next();
      
    } catch (error) {
      console.error("❌ Token Decode Error:", error.message);
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: "Invalid token format" });
      } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "Token expired" });
      } else if (error.name === 'CastError') {
        return res.status(401).json({ message: "Invalid user ID in token" });
      }
      return res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    if (isDev) console.log("🚫 No Bearer token in header");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
};

module.exports = { protect };
