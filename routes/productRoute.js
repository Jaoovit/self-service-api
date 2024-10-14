const express = require("express");
const productController = require("../controllers/productController");
const router = express.Router();
const verifyToken = require("../config/token");

// Get
router.get("/products", productController.getProductsByUser);
router.get("/product/:id", productController.getProductById);

// Post
router.post("/product", verifyToken, productController.postProduct);

// Put
router.put(
  "/product/switchStatus/:id",
  verifyToken,
  productController.switchProductStatus
);
router.put("/product/:id", verifyToken, productController.updateProduct);

// Delete
router.delete(
  "/products",
  verifyToken,
  productController.deleteAllUserProducts
);
router.delete("/product/:id", verifyToken, productController.deleteProductById);

module.exports = router;
