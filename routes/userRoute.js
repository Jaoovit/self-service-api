const express = require("express");
const userController = require("../controllers/userController");
const router = express.Router();

// Post
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);
router.post("/logout", userController.logoutUser);

module.exports = router;
