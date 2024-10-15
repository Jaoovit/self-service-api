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
router.post("/order/table", orderController.postOrder); // Postman route test "/order/?tableId=id"

// Put
router.put("/order/add/?orderId/:productId", orderController.addItemToOrder);
router.put(
  "/order/remove/?orderId/:productId",
  orderController.removeItemFromOrder
);

module.exports = router;
