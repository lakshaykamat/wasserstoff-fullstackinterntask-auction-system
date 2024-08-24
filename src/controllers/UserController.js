const User = require("../models/User");
const jwt = require("jsonwebtoken");
const AppError = require("../services/AppError");

class UserController {
  /**
   * Registers a new user
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async registerUser(req, res, next) {
    try {
      // Creates a new user with the provided data
      const user = await User.create(req.body);
      return res.status(201).json({
        user,
        message: "User registered successfully",
      });
    } catch (error) {
      next(error); // Passes errors to the global error handler
    }
  }

  /**
   * Logs in a user and returns a JWT token
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async loginUser(req, res, next) {
    try {
      const { email, password } = req.body;

      // Check if email and password are provided
      if (!email || !password) {
        return next(new AppError("Please provide email and password", 400));
      }

      // Find the user by email
      const user = await User.getByEmail(email);

      // Validate the password
      const isPasswordValid = await User.validatePassword(
        password,
        user.password
      );
      if (!isPasswordValid) {
        return next(new AppError("Incorrect email or password", 401));
      }

      // Generate a JWT token for the user
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET,
        {
          expiresIn: process.env.JWT_EXPIRES_IN,
        }
      );

      // Return the token and user data
      return res.status(200).json({
        token,
        user,
        message: "User logged in successfully",
      });
    } catch (error) {
      console.log(error);
      next(error); // Passes errors to the global error handler
    }
  }

  /**
   * Retrieves a user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getUserById(req, res, next) {
    try {
      // Retrieves a user by their ID
      const user = await User.getById(req.params.userId);
      return res.status(200).json({ user });
    } catch (error) {
      next(error); // Passes errors to the global error handler
    }
  }

  /**
   * Retrieves all users
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async getUsers(req, res, next) {
    try {
      // Retrieves all users from the database
      const users = await User.getAll();
      return res.status(200).json(users);
    } catch (error) {
      next(error); // Passes errors to the global error handler
    }
  }

  /**
   * Updates a user's information
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async updateUser(req, res, next) {
    try {
      // Updates user data by ID with the provided information
      const updatedUser = await User.updateById(req.params.id, req.body);
      return res.status(200).json({
        user: updatedUser,
        message: "User updated successfully",
      });
    } catch (error) {
      next(error); // Passes errors to the global error handler
    }
  }

  /**
   * Deletes a user by ID
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  static async deleteUser(req, res, next) {
    try {
      // Deletes a user by their ID
      const deletedUser = await User.deleteById(req.params.id);
      if (!deletedUser) {
        return next(new AppError("User not found", 404));
      }
      return res.status(204).json({
        message: "User deleted successfully",
      });
    } catch (error) {
      next(error); // Passes errors to the global error handler
    }
  }
}

module.exports = UserController;
