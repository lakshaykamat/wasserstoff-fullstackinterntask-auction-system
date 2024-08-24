const express = require("express");
const UserController = require("../controllers/UserController");
const { isAuthenticated } = require("../middlewares/isAuth");
const isAdmin = require("../middlewares/isAdmin");

const router = express.Router();

router.route("/register").post(UserController.registerUser);

router.route("/login").post(UserController.loginUser);

router.route("/").get(isAdmin, UserController.getUsers);
router.route("/:userId").get(isAdmin, UserController.getUserById);
router.route("/:userId").put(isAdmin, UserController.updateUser);
router.route("/:userId").delete(isAdmin, UserController.deleteUser);

module.exports = router;
