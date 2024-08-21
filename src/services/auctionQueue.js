const Bull = require("bull");
const AppError = require("./AppError");
const Auction = require("../models/Auction");

// Create a Bull queue for auction completion
const auctionQueue = new Bull("auctionQueue", {
  redis: {
    host: "127.0.0.1", // Redis server
    port: 6379,
  },
});

// Process jobs in the queue
auctionQueue.process(async (job, done) => {
  try {
    const { auctionId } = job.data;
    const auction = await Auction.findById(auctionId);

    if (!auction) {
      throw new AppError("Auction not found.", 404);
    }

    if (auction.status === "ongoing") {
      auction.status = "completed";
      auction.winner = auction.highestBidder;
      await auction.save();
      console.log(`Auction ${auctionId} completed and winner determined.`);
    }

    done(); // Mark the job as completed
  } catch (error) {
    console.error(`Error completing auction: ${error.message}`);
    done(new Error("Failed to complete auction."));
  }
});

module.exports = auctionQueue;
