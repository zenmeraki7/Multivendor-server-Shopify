import Log from "../models/Logs.js"; // Import your Log model

export const errorMiddleware = async (err, req, res, next) => {
  // Determine the status code
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  // Log the error to the database
  const logData = {
    method: req.method,
    endpoint: req.originalUrl,
    requestBody: req.body || {},
    queryParams: req.query || {},
    headers: req.headers || {},
    responseStatus: statusCode,
    error: {
      message: err.message,
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    },
    user: req.user?.id || "Guest", // Assuming `req.user` is populated by authentication middleware
    ip: req.ip,
    timestamp: new Date(),
  };

  try {
    await Log.create(logData); // Save log to the database
  } catch (logError) {
    console.error("Failed to log error:", logError.message);
  }

  // Respond with a consistent error structure
  res.status(statusCode).json({
    success: false,
    message: err.message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }), // Include stack trace only in development
  });
};
