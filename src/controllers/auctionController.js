const Auction = require("../models/Auction");
const AppError = require("../services/AppError");

class AuctionController {
  // Create a new auction
  static async createAuction(req, res, next) {
    try {
      // Create auction using request body data
      const auction = await Auction.create(req.body);
      return res.status(200).json(auction);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }

  // Get auction by ID
  static async getAuctionById(req, res, next) {
    try {
      const { auctionId } = req.params;
      // Retrieve auction by ID
      const auction = await Auction.getById(auctionId);
      // Check if the auction is ongoing
      if (auction.status != "ongoing") {
        throw new AppError("This auction is completed", 400);
      }
      return res.status(200).json(auction);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }

  // Get all ongoing auctions
  static async getOngoingAuctions(req, res, next) {
    try {
      // Retrieve all auctions with status 'ongoing'
      const auctions = await Auction.getAllOngoing();
      return res.status(200).json(auctions);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }

  // Update an auction by ID
  static async updateAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      // Update auction with the provided data
      const auction = await Auction.updateById(auctionId, req.body);
      res.status(200).json(auction);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }

  // Place a bid on an auction
  static async placeBidOnAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      const { bid } = req.body;
      // Place bid on the auction
      const auction = await Auction.placeBid(auctionId, req.user.id, bid);
      res.status(200).json(auction);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }

  // Delete an auction by ID
  static async deleteAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      // Delete the auction
      const auction = await Auction.deleteById(auctionId);
      res.status(200).json(auction);
    } catch (error) {
      next(error); // Pass error to global error handler
    }
  }
}

module.exports = AuctionController;
