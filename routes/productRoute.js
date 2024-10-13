const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const verifyToken = require("../config/token");

module.exports = router;
