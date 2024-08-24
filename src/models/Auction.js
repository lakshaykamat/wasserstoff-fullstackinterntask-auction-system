const mongoose = require("mongoose");
const AppError = require("../services/AppError");
const auctionQueue = require("../services/auctionQueue");

class Auction {
  constructor() {
    const auctionSchema = new mongoose.Schema(
      {
        itemName: {
          type: String,
          required: [true, "Item name is required"],
          minlength: [
            4,
            "Item name length should be greater than 3 characters",
          ],
          trim: true,
        },
        startTime: {
          type: Date,
          required: [true, "Start time is required"],
          validate: {
            validator: function (value) {
              return value > Date.now();
            },
            message: "Start time must be in the future.",
          },
        },
        endTime: {
          type: Date,
          required: [true, "End time is required"],
          validate: {
            validator: function (value) {
              return value > this.startTime;
            },
            message: "End time must be greater than start time.",
          },
        },
        startPrice: {
          type: Number,
          required: [true, "Start price is required"],
          min: [0, "Start price can't be less than zero"],
        },
        currentBid: {
          type: Number,
          default: 0,
          min: [0, "Current bid can't be less than zero"],
        },
        highestBidder: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
        status: {
          type: String,
          enum: ["ongoing", "completed"],
          default: "ongoing",
        },
        winner: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          default: null,
        },
      },
      {
        timestamps: true,
      }
    );

    this.Auction = mongoose.model("Auction", auctionSchema);
  }

  async create(data) {
    try {
      const auction = await this.Auction.create(data);

      // Schedule the auction completion task
      this.scheduleAuctionCompletion(auction._id, auction.endTime);

      return auction;
    } catch (err) {
      if (err.name === "ValidationError") {
        throw new AppError(
          Object.values(err.errors)
            .map((e) => e.message)
            .join(", "),
          400
        );
      }
      throw new AppError("Error creating auction", 500);
    }
  }

  scheduleAuctionCompletion(auctionId, endTime) {
    const delay = new Date(endTime) - new Date(); // Calculate delay in milliseconds

    auctionQueue.add(
      { auctionId }, // Data to pass to the job
      { delay } // Delay until the job should be processed
    );

    console.log(`Scheduled auction ${auctionId} to complete at ${endTime}`);
  }

  async getById(id) {
    try {
      const auction = await this.Auction.findById(id);
      if (!auction) {
        throw new AppError("No auction found with that ID", 404);
      }
      return auction;
    } catch (err) {
      throw new AppError("Error fetching auction", 500);
    }
  }

  async getAllOngoing() {
    try {
      return await this.Auction.find({ status: "ongoing" });
    } catch (error) {
      throw new AppError("Error fetching auctions", 500);
    }
  }

  async updateById(id, updateData) {
    try {
      const auction = await this.Auction.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (!auction) {
        throw new AppError("No auction found with that ID", 404);
      }

      // If the endTime was changed, reschedule the job
      if (updateData.endTime) {
        await auctionQueue.removeJobs({ auctionId: id });
        this.scheduleAuctionCompletion(auction._id, updateData.endTime);
      }

      return auction;
    } catch (error) {
      throw new AppError(error.message || "Error updating auction", 500);
    }
  }

  async deleteById(id) {
    try {
      // Remove scheduled job for this auction
      await auctionQueue.removeJobs({ auctionId: id });
      const auction = await this.Auction.findByIdAndDelete(id);
      if (!auction) {
        throw new AppError("No auction found with that ID", 404);
      }
      return auction;
    } catch (error) {
      throw new AppError("Error deleting auction", 500);
    }
  }

  async placeBid(auctionId, userId, bidAmount) {
    try {
      if (bidAmount <= 0) {
        throw new AppError("Bid amount must be greater than zero.", 400);
      }

      const auction = await this.getById(auctionId);
      if (!auction) {
        throw new AppError("Auction not found.", 404);
      }

      const currentTime = new Date();
      if (currentTime < auction.startTime) {
        throw new AppError("The auction has not started yet.", 400);
      }
      if (currentTime > auction.endTime || auction.status === "completed") {
        throw new AppError("The auction has already ended.", 400);
      }

      if (bidAmount <= auction.startPrice || bidAmount <= auction.currentBid) {
        throw new AppError(
          `Bid must be higher than the current bid of ${Math.max(
            auction.startPrice,
            auction.currentBid
          )}.`,
          400
        );
      }

      auction.currentBid = bidAmount;
      auction.highestBidder = userId;

      // If the auction time has ended, mark it as completed and set the winner
      if (currentTime >= auction.endTime) {
        auction.status = "completed";
        auction.winner = userId;
      }

      await auction.save();
      return auction;
    } catch (err) {
      if (err instanceof AppError) {
        throw err;
      } else {
        throw new AppError("Error placing bid. Please try again later.", 500);
      }
    }
  }

  /**
   * Manually complete auctions that should have ended.
   * This method checks for auctions where the end time has passed,
   * and updates their status to 'completed' and sets the winner.
   */
  async completeAuctions() {
    try {
      // Get the current time
      const currentTime = new Date();

      // Find all auctions that have ended but are still marked as 'ongoing'
      const auctionsToComplete = await this.Auction.find({
        endTime: { $lt: currentTime },
        status: "ongoing",
      });

      // Loop through each auction and complete it
      for (const auction of auctionsToComplete) {
        // Set the status to 'completed'
        auction.status = "completed";

        // Set the winner to the highestBidder
        auction.winner = auction.highestBidder;

        // Save the auction with the updated status and winner
        await auction.save();
      }

      return auctionsToComplete.length; // Return the number of auctions completed
    } catch (err) {
      throw new AppError("Error completing auctions", 500);
    }
  }
}

module.exports = new Auction();
