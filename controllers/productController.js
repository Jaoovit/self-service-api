const { PrismaClient } = require("@prisma/client");
const { broadcastToClients } = require("../config/websocket");

const prisma = new PrismaClient();

const getProductsByUser = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        userId: userId,
      },
    });

    res
      .status(200)
      .json({ message: "Products gotten sucessfully", products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting products." });
  }
};

const getProductById = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }
  const productId = parseInt(req.params.id, 10);

  if (isNaN(productId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
        userId: userId,
      },
    });

    if (!product) {
      return res.status(404).json({
        error: `Product with ID ${productId} not found`,
      });
    }

    res.status(200).json({
      message: `Product ${productId} gotten sucessfully`,
      product: product,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error getting product ${productId}` });
  }
};

const postProduct = async (req, res) => {
  try {
    const { title, price, description, imageUrl } = req.body;

    if (!title || !price || !description || !imageUrl) {
      return res.status(400).json({ message: "All form fields are mandatory" });
    }

    const userId = parseInt(req.session.passport.user, 10);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user Id" });
    }

    const newProduct = await prisma.product.create({
      data: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
        user: {
          connect: { id: userId },
        },
      },
    });
    res
      .status(200)
      .json({ message: "Product created sucessfully", product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating new product" });
  }
};

const deleteProductById = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }
  const productId = parseInt(req.params.id, 10);

  if (!productId) {
    return res.status(400).json({ message: "Invalid product Id" });
  }

  try {
    await prisma.product.delete({
      where: {
        id: productId,
        userId: userId,
      },
    });

    res
      .status(200)
      .json({ message: `Product ${productId} deleted sucessfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error deleting product ${productId}` });
  }
};

const deleteAllUserProducts = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  try {
    await prisma.product.deleteMany({
      where: {
        userId: userId,
      },
    });
    res
      .status(200)
      .json({ message: `All user ${userId} products was deleted` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error deleting products for user ${userId}` });
  }
};

const updateProduct = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }
  const productId = parseInt(req.params.id, 10);

  if (!productId) {
    return res.status(400).json({ message: "Invalid product Id" });
  }

  try {
    const { title, price, description, imageUrl } = req.body;

    if (!title || !price || !description || !imageUrl) {
      return res.status(400).json({ message: "All form fields are mandatory" });
    }

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
        userId: userId,
      },
      data: {
        title: title,
        price: price,
        description: description,
        imageUrl: imageUrl,
      },
    });
    res.status(200).json({
      message: `Product ${productId} updated sucessfully`,
      product: updatedProduct,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error deleting product ${productId}` });
  }
};

const switchProductStatus = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }
  const productId = parseInt(req.params.id, 10);

  if (!productId) {
    return res.status(400).json({ message: "Invalid product Id" });
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      return res
        .status(404)
        .json({ message: `Product ${productId} not found` });
    }

    const newAvailability = !product.available;

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
        userId: userId,
      },
      data: {
        available: newAvailability,
      },
    });

    // Send HTTP response
    res.status(200).json({
      message: `Product availability switched to ${newAvailability}`,
      product: updatedProduct,
    });

    // Broadcast product update via WebSocket
    broadcastToClients({
      type: "PRODUCT_STATUS_UPDATE",
      product: {
        id: productId,
        available: newAvailability,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({});
  }
};

module.exports = {
  getProductsByUser,
  getProductById,
  postProduct,
  deleteProductById,
  deleteAllUserProducts,
  updateProduct,
  switchProductStatus,
};
