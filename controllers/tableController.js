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

const getTableById = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.id, 10);

  if (isNaN(tableId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    const table = await prisma.table.findUnique({
      where: {
        id: tableId,
        table: {
          connect: { id: userId },
        },
      },
    });
    res
      .status(200)
      .json({ message: `Table ${tableId} gotten sucessfully`, table: table });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error getting table ${tableId}` });
  }
};

module.exports = { getTablesByUser, getTableById };
