const express = require("express");
const tableController = require("../controllers/tableController");
const router = express.Router();
const verifyToken = require("../config/token");

// Get
router.get("/tables", verifyToken, tableController.getTablesByUser);
router.get("/table/:id", verifyToken, tableController.getTableById);

// Post
router.post("/table", verifyToken, tableController.postTable);

// Delete
router.delete("/tables", verifyToken, tableController.deleteAllUserTable);
router.delete("/table/:id", verifyToken, tableController.deleteTableById);
router.delete(
  "/table/cleanUpTable/:id",
  verifyToken,
  tableController.cleanUpTable
);

module.exports = router;
