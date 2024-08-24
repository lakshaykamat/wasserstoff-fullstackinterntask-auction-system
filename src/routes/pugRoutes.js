const express = require("express");
const Auction = require("../models/Auction");
const isAdmin = require("../middlewares/isAdmin");
const User = require("../models/User");
const router = express.Router();
router.route("/").get(async (req, res) => {
  try {
    const auctions = await Auction.getAllOngoing(); // Assuming getAllOngoing() fetches all ongoing auctions
    res.render("auctions", { auctions });
  } catch (err) {
    res.status(500).send("Error fetching auctions");
  }
});
router.route("/create").get(async (req, res) => {
  try {
    res.render("create-auctions");
  } catch (err) {
    res.status(500).send("Error fetching auctions");
  }
});
module.exports = router;
