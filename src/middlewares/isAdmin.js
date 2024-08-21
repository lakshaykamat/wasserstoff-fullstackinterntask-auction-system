const AppError = require("../services/AppError");

const isAdmin = (req, res, next) => {
  const apiSecret = req.headers["admin-api-key"];

  if (!apiSecret) {
    return next(new AppError("API secret is missing", 401));
  }

  if (apiSecret !== process.env.ADMIN_API_SECRET) {
    return next(new AppError("Unauthorized: Invalid API secret", 403));
  }

  next(); // User is a Admin, proceed to the next middleware or route handler
};

module.exports = isAdmin;
