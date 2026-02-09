import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protect = async (req, res, next) => {
  let token;

  // Check if token exists in authorization headers
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(" ")[1];
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get user from the token
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res.status(401).json({
          success: false,
          error: "Unauthorized",
          statusCode: 401,
          message: "Unauthorized",
        });
      }
      next();
      return;
    } catch (error) {
      console.error("Auth middleware error:", error.message);

      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: "Token expired",
          statusCode: 401,
          message: "Token has expired, please log in again",
        });
      }

      return res.status(401).json({
        success: false,
        error: "Unauthorized",
        statusCode: 401,
        message: "Unauthorized",
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized",
      statusCode: 401,
      message: "Unauthorized",
    });
  }
};

export { protect };
