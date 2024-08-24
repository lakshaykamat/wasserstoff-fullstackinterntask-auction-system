const express = require("express");
const AuctionController = require("../controllers/auctionController");
const { isAuthenticated } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

const router = express.Router();

router.route("/").post(isAdmin, AuctionController.createAuction);
router.route("/").get(isAuthenticated, AuctionController.getOngoingAuctions);
router
  .route("/:auctionId")
  .get(isAuthenticated, AuctionController.getAuctionById);

router
  .route("/bid/:auctionId")
  .post(isAuthenticated, AuctionController.placeBidOnAuction);

router.route("/:auctionId").put(isAdmin, AuctionController.updateAuction);
router.route("/:auctionId").delete(isAdmin, AuctionController.deleteAuction);

module.exports = router;
