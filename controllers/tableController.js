const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getTablesByUser = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  try {
    const tables = await prisma.table.findMany({
      where: {
        table: {
          connect: { id: userId },
        },
      },
    });
    res
      .status(200)
      .json({ message: "Tables gotten sucessfully", table: tables });
  } catch (error) {
    console.error(error).status(500).json({ message: "Error getting tables." });
  }
};

module.exports = { getTablesByUser };
