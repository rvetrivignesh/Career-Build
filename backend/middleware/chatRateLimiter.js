// In-memory rate limiting store
const rateLimitMap = new Map();

export const chatRateLimiter = (req, res, next) => {
  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
      errors: ["User session is missing or expired"],
    });
  }

  const userId = req.user._id.toString();
  const now = Date.now();
  const oneMinuteAgo = now - 60 * 1000;

  // Retrieve current timestamps for the user
  let timestamps = rateLimitMap.get(userId) || [];

  // Filter out any timestamps older than one minute
  timestamps = timestamps.filter((timestamp) => timestamp > oneMinuteAgo);

  if (timestamps.length >= 20) {
    return res.status(429).json({
      success: false,
      message: "Too Many Requests",
      errors: ["Rate limit exceeded. You can only send 20 chat messages per minute."],
    });
  }

  // Record current message timestamp
  timestamps.push(now);
  rateLimitMap.set(userId, timestamps);

  next();
};

// Helper for testing purposes to reset the rate limiter map
export const resetRateLimiter = () => {
  rateLimitMap.clear();
};
