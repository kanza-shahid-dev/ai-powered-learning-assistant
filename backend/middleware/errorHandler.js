const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode || 500;
  let message = err.message || "Server Error";

  //Mongoose bad ObjectId
  if (err.name === "CastError" && err.kind === "ObjectId") {
    message = "Resource not found";
    statusCode = 404;
  }

  //Mongoose duplicate key
  if (err.code === 11000) {
    const field = err.keyValue && Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for ${field}`;
    statusCode = 400;
  }
  //Mongoose validation error
  if (err.name === "ValidationError") {
    message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    statusCode = 400;
  }

  //Multer file size error
  if (err.code === "LIMIT_FILE_SIZE") {
    message = "File size is too large";
    statusCode = 400;
  }

  //JWT errors
  if (err.name === "JsonWebTokenError") {
    message = "Invalid token, authorization denied";
    statusCode = 401;
  }
  if (err.name === "TokenExpiredError") {
    message = "Token expired, authorization denied";
    statusCode = 401;
  }

  console.error("Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });

  res.status(statusCode).json({
    success: false,
    error: message,
    statusCode,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};
export default errorHandler;
