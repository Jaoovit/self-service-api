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
        userId: userId,
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
        userId: userId,
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

const postTable = async (req, res) => {
  try {
    const { number } = req.body;

    if (typeof number !== "number" || isNaN(number)) {
      return res
        .status(400)
        .json({ message: "Number must be a valid integer." });
    }

    const userId = parseInt(req.session.passport.user, 10);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user Id" });
    }

    const newTable = await prisma.table.create({
      data: {
        number: number,
        user: {
          connect: { id: userId },
        },
      },
    });

    return res
      .status(201)
      .json({ message: "Table created successfully", table: newTable });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error creating new table" });
  }
};

const deleteTableById = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.id, 10);

  if (!tableId) {
    return res.status(400).json({ message: "Invalid table Id" });
  }

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.order.deleteMany({
        where: {
          tableId: tableId,
          userId: userId,
        },
      });

      await prisma.table.delete({
        where: {
          id: tableId,
          userId: userId,
        },
      });
    });

    res.status(200).json({
      message: "Table delited successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error deleting table ${tableId}` });
  }
};

const deleteAllUserTable = async (req, res) => {
  const userId = parseInt(req.session.passport.user);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  try {
    await prisma.$transaction(async (prisma) => {
      await prisma.order.deleteMany({
        where: {
          userId: userId,
        },
      });

      await prisma.table.deleteMany({
        where: {
          userId: userId,
        },
      });
    });

    res.status(200).json({
      message: "Tables delited successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error deleting tables" });
  }
};

const cleanUpTable = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.id, 10);

  if (isNaN(tableId) || tableId <= 0) {
    return res.status(400).json({ message: "Invalid table Id" });
  }

  try {
    const deletedOrders = await prisma.order.deleteMany({
      where: {
        tableId: tableId,
        userId: userId,
      },
    });

    return res.status(200).json({
      message: `${deletedOrders.count} orders deleted successfully from table ${tableId}.`,
    });
  } catch (error) {
    console.error("Error deleting orders:", error);
    return res
      .status(500)
      .json({ message: `Error cleaning up orders for table ${tableId}` });
  }
};

module.exports = {
  getTablesByUser,
  getTableById,
  postTable,
  deleteTableById,
  deleteAllUserTable,
  cleanUpTable,
};
