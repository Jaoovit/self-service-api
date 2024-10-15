const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getOrdersByTable = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.id, 10);

  if (isNaN(tableId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
        tableId: tableId,
      },
    });

    res.status(200).json({
      message: `Table ${tableId} orders gotten suceessfully`,
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error getting orders for table ${tableId}` });
  }
};

const getOrdersById = async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);

  if (isNaN(orderId)) {
    res.status(400).send("Invalid order id");
  }

  try {
    const order = await prisma.order.findUnique({
      where: {
        orderId: orderId,
      },
    });
    res
      .status(200)
      .json({ message: `Order ${orderId} gotten sucessfully`, order: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error getting order ${orderId}` });
  }
};

const deleteOrderByTable = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.id, 10);

  if (isNaN(tableId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    await prisma.order.delete({
      where: {
        userId: userId,
        tableId: tableId,
      },
    });

    res.status(200).json({
      message: `Table ${tableId} orders deleted suceessfully`,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: `Error deleting orders for table ${tableId}` });
  }
};

const deleteOrderById = async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);

  if (isNaN(orderId)) {
    res.status(400).send("Invalid order id");
  }

  try {
    await prisma.order.delete({
      where: {
        orderId: orderId,
      },
    });
    res.status(200).json({ message: `Order ${orderId} deleted sucessfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error deleting order ${orderId}` });
  }
};

const addItemToOrder = async (req, res) => {
  const orderId = parseInt(req.query.orderId, 10);

  if (isNaN(orderId)) {
    res.status(400).send("Invalid order id");
  }

  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        products: {
          connect: { id: productId },
        },
      },
      include: {
        products: true,
      },
    });

    return res.status(200).json({
      message: `Product ${productId} added to the order ${orderId} successfully`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: `Erro adding product ${productId} to the order ${orderId}`,
    });
  }
};

module.exports = {
  getOrdersByTable,
  getOrdersById,
  deleteOrderByTable,
  deleteOrderById,
  addItemToOrder,
};
