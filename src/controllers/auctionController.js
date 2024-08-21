const Auction = require("../models/Auction");
const AppError = require("../services/AppError");

class AuctionController {
  static async createAuction(req, res, next) {
    try {
      const auction = await Auction.create(req.body);
      return res.status(200).json(auction);
    } catch (error) {
      next(error);
    }
  }
  static async getAuctionById(req, res, next) {
    try {
      const { auctionId } = req.params;
      const auction = await Auction.getById(auctionId);
      if (auction.status != "ongoing") {
        throw new AppError("This auction is completed", 400);
      }
      return res.status(200).json(auction);
    } catch (error) {
      next(error);
    }
  }
  static async getOngoingAuctions(req, res, next) {
    try {
      const auctions = await Auction.getAllOngoing();
      return res.status(200).json(auctions);
    } catch (error) {
      next(error);
    }
  }
  static async updateAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      const auction = await Auction.updateById(auctionId, req.body);
      res.status(200).json(auction);
    } catch (error) {
      next(error);
    }
  }
  static async placeBidOnAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      const { bid } = req.body;
      const auction = await Auction.placeBid(auctionId, req.user.id, bid);
      res.status(200).json(auction);
    } catch (error) {
      next(error);
    }
  }
  static async deleteAuction(req, res, next) {
    try {
      const { auctionId } = req.params;
      const auction = await Auction.deleteById(auctionId);
      res.status(200).json(auction);
    } catch (error) {
      next(error);
    }
  }
}
module.exports = AuctionController;
