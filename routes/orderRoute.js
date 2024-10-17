const express = require("express");
const orderController = require("../controllers/orderController");
const router = express.Router();
const verifyToken = require("../config/token");

// Get
router.get("/orders", orderController.getOrdersByUser);
router.get("/order/:orderId", orderController.getOrdersById);
router.get("/orders/table/:tableId", orderController.getOrdersByTable);

// Delete
router.delete("/order/:orderId", orderController.deleteOrderById);
router.delete("/orders/table/:tableId", orderController.deleteOrderByTable);

// Post
router.post("/order/table/:tableId", orderController.postOrder);

// Put
router.put("/order/add/:productId/:orderId", orderController.addItemToOrder);
router.put(
  "/order/remove/:productId/:orderId",
  orderController.deleteItemFromOrder
);

module.exports = router;
