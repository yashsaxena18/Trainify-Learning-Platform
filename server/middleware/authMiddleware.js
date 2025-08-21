// authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;
  
  console.log("🔍 Incoming Headers:", req.headers);
  
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1]; ///plit to get the bearer token
      console.log("🟢 Extracted Token:", token);
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("🧠 Decoded JWT:", decoded);
      
      // Check both 'id' and '_id' properties in case of inconsistency
      const userId = decoded.id || decoded._id || decoded.userId;
      console.log("🔍 Looking for user with ID:", userId);
      
      if (!userId) {
        console.log("❌ No user ID found in token");
        return res.status(401).json({ message: "Invalid token - No user ID" });
      }
      
      const user = await User.findById(userId).select("-password");
      console.log("✅ Database query result:", user);
      
      if (!user) {
        console.log("❌ User not found in database with ID:", userId);
        return res.status(401).json({ message: "Unauthorized - User not found in DB" });
      }
      
      req.user = user;
      console.log("✅ User attached to request:", req.user._id);
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
    console.log("🚫 No Bearer token in header");
    return res.status(401).json({ message: "Unauthorized - No token provided" });
  }
};

module.exports = { protect };
