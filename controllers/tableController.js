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

    const userId = parseInt(req.session.passport.user, 10);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user Id" });
    }

    if (!number) {
      return res.status(400).json({ message: "Number is mandatory" });
    }

    const newTable = await prisma.table.create({
      data: {
        data: {
          number: number,
          user: {
            connect: { id: userId },
          },
        },
      },
    });

    res
      .status(200)
      .json({ message: "Table created sucessfully", table: newTable });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creating new table" });
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
  const userId = parseInt(req.session.passport.user);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.id, 10);

  if (!tableId) {
    return res.status(400).json({ message: "Invalid table Id" });
  }

  try {
    await prisma.table.deleteMany({
      where: {
        tableId: tableId,
        userId: userId,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error clening up table ${tableId}` });
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
