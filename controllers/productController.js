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

module.exports = { getAllProducts };
