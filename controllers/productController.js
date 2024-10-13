const { PrismaClient } = require("@prisma/client");
const { connect } = require("../routes/productRoute");

const prisma = new PrismaClient();

const getAllProducts = async (req, res) => {
  try {
    const products = await prisma.product.findMany();

    res
      .status(200)
      .json({ message: "Products gotten sucessfully", products: products });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error getting products." });
  }
};

const getProductById = async (req, res) => {
  const productId = parseInt(req.params.id, 10);

  if (isNaN(postId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

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
  const productId = parseInt(req.params.id, 10);

  if (!productId) {
    return res.status(400).json({ message: "Invalid product Id" });
  }

  try {
    await prisma.product.delete({
      where: {
        id: productId,
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

const deleteAllProducts = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "Invalid" });
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
  const productId = parseInt(req.params.id, 10);

  if (!productId) {
    return res.status(400).json({ message: "Invalid product Id" });
  }

  try {
    const { newTitle, newPrice, newDescription, newImageUrl } = req.body;

    const updatedProduct = await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        title: newTitle,
        price: newPrice,
        description: newDescription,
        imageUrl: newImageUrl,
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

module.exports = {
  getAllProducts,
  getProductById,
  postProduct,
  deleteProductById,
  deleteAllProducts,
  updateProduct,
};
