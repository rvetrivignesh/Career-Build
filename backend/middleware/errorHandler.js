const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors || [];

  // Handle Mongoose Validation Error
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  }

  // Handle Mongoose CastError (e.g., invalid ObjectId)
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for ${err.path}`;
  }

  // Handle MongoDB Duplicate Key Error (e.g., unique constraints)
  if (err.code === 11000) {
    statusCode = 409;
    message = "Resource already exists";
    const key = Object.keys(err.keyValue || {})[0];
    errors = [`Duplicate value for field: ${key}`];
  }

  // Log internal server errors (500)
  if (statusCode === 500) {
    console.error("Internal Server Error:", err);
  }

  res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};

export default errorHandler;
