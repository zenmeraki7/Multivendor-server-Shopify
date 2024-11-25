import Log from "../models/Logs.js";

export const logMiddleware = async (req, res, next) => {
  const startTime = Date.now();

  // Capture the original send method
  const originalSend = res.send;

  // Intercept the response to capture response body
  res.send = async function (body) {
    // Log data
    const logData = {
      method: req.method,
      endpoint: req.originalUrl,
      requestBody: req.body || {},
      queryParams: req.query || {},
      headers: req.headers || {},
      responseStatus: res.statusCode,
      responseBody: body,
      user: req.user?.id || "Guest", // Add user info if available (e.g., from JWT middleware)
      ip: req.ip,
      timestamp: new Date(startTime),
    };

    // Save log to the database
    try {
      await Log.create(logData);
    } catch (err) {
      console.error("Failed to log API call:", err);
    }

    // Call the original send method
    return originalSend.call(this, body);
  };

  next();
};
