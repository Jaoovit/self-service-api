const { PrismaClient } = require("@prisma/client");

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

module.exports = { getAllProducts, getProductById };
