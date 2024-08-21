const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const validator = require("validator");
const AppError = require("../services/AppError");

class User {
  constructor() {
    const userSchema = new mongoose.Schema(
      {
        username: {
          type: String,
          required: [true, "Username is required"],
          trim: true,
          minlength: [3, "Username must be at least 3 characters long"],
        },
        email: {
          type: String,
          required: [true, "Email is required"],
          unique: true,
          lowercase: true,
          validate: [validator.isEmail, "Please provide a valid email"],
        },
        password: {
          type: String,
          required: [true, "Password is required"],
          minlength: [8, "Password must be at least 8 characters long"],
          select: false, // This ensures that the password is not returned by default
        },
      },
      {
        timestamps: true,
      }
    );

    // Pre-save middleware to hash the password before saving
    userSchema.pre("save", async function (next) {
      if (!this.isModified("password")) return next();

      // Hash the password with cost of 12
      this.password = await bcrypt.hash(this.password, 12);

      next();
    });

    // Instance method to check if the entered password is correct
    userSchema.methods.correctPassword = async function (
      candidatePassword,
      userPassword
    ) {
      return await bcrypt.compare(candidatePassword, userPassword);
    };

    this.User = mongoose.model("User", userSchema);
  }

  async create(data) {
    try {
      // Check if email already exists
      const existingUser = await this.getByEmail(data.email);
      if (existingUser) {
        throw new AppError("Email is already in use", 400);
      }

      const user = new this.User(data);
      return await user.save();
    } catch (error) {
      throw new AppError(error.message || "Error creating user", 500);
    }
  }

  async getById(id) {
    try {
      return await this.User.findById(id).select("+password");
    } catch (error) {
      throw new AppError("Error finding user by ID", 500);
    }
  }

  async updateById(id, updateData) {
    try {
      // Find the user and update their data
      const user = await this.User.findByIdAndUpdate(id, updateData, {
        new: true, // Return the updated user
        runValidators: true, // Run validators on update
      });

      if (!user) {
        throw new AppError("No user found with that ID", 404);
      }

      return user;
    } catch (error) {
      throw new AppError(error.message || "Error updating user", 500);
    }
  }

  async deleteById(id) {
    try {
      const user = await this.User.findByIdAndDelete(id);

      if (!user) {
        throw new AppError("No user found with that ID", 404);
      }

      return user;
    } catch (error) {
      throw new AppError("Error deleting user", 500);
    }
  }

  async getByEmail(email) {
    try {
      return await this.User.findOne({ email }).select("+password");
    } catch (error) {
      throw new AppError("Error finding user by email", 500);
    }
  }
  async getAll() {
    try {
      return await this.User.find();
    } catch (error) {
      throw new AppError("Error finding users", 500);
    }
  }

  async validatePassword(inputPassword, storedPassword) {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch (error) {
      throw new AppError("Error validating password", 500);
    }
  }
}

module.exports = new User();
