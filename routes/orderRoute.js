const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();
const verifyToken = require("../config/token");

// Get
router.get("/orders", orderController.getOrdersByUser);
router.get("/order/:orderId", orderController.getOrdersById);
router.get("/orders/:tableId", orderController.getOrdersByTable);

// Delete
router.delete("/order/:orderId", orderController.deleteOrderById);
router.delete("/orders/:tableId", orderController.deleteOrderByTable);

// Put
router.put("/order/add/?orderId/:productId", orderController.addItemToOrder);
router.put(
  "/order/remove/?orderId/:productId",
  orderController.removeItemFromOrder
);

module.exports = router;
