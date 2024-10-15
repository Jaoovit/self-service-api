const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const getOrdersByUser = async (req, res) => {
  try {
    const userId = parseInt(req.session?.passport?.user, 10);

    if (!userId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const orders = await prisma.order.findMany({
      where: {
        userId: userId,
      },
      include: {
        products: true,
        table: true,
      },
    });

    if (orders.length === 0) {
      return res
        .status(404)
        .json({ message: "No orders found for this restaurant." });
    }

    return res.status(200).json({
      message: `Orders retrieved successfully for restaurant with user ID ${userId}`,
      orders: orders,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error retrieving orders for the restaurant.",
      error: error.message,
    });
  }
};

const getOrdersByTable = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.tableId, 10);

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
        id: orderId,
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

const postOrder = async (req, res) => {
  const tableId = parseInt(req.query.tableId, 10);

  if (isNaN(tableId)) {
    return res.status(400).send("Invalid table id");
  }

  try {
    const table = await prisma.table.findUnique({
      where: { id: tableId },
      select: { userId: true },
    });

    if (!table) {
      return res.status(404).send("Table not found");
    }

    const newOrder = await prisma.order.create({
      data: {
        userId: table.userId,
        table: {
          connect: {
            id: tableId,
          },
        },
      },
    });

    res.status(200).json({
      message: `New order created for table ${tableId} successfully`,
      newOrder: newOrder,
    });
  } catch (error) {
    console.error("Error details:", error);
    res.status(500).json({
      message: `Error creating order for table ${tableId}`,
      error: error.message,
    });
  }
};

const removeItemFromOrder = async (req, res) => {
  const orderId = parseInt(req.query.orderId, 10);

  if (isNaN(orderId)) {
    return res.status(400).send("Invalid order id");
  }

  const productId = parseInt(req.params.productId, 10);

  if (isNaN(productId)) {
    return res.status(400).send("Invalid product id");
  }

  try {
    const updatedOrder = await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        products: {
          disconnect: { id: productId },
        },
      },
      include: {
        products: true,
      },
    });

    return res.status(200).json({
      message: `Product ${productId} removed from the order ${orderId} successfully`,
      order: updatedOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: `Error removing product ${productId} from the order ${orderId}`,
      error: error.message,
    });
  }
};

const sendOrderFromTable = async (req, res) => {
  try {
    const { products } = req.body;
    const tableId = parseInt(req.query.tableId, 10);

    if (isNaN(tableId)) {
      return res.status(400).json({ message: "Invalid table ID from QR code" });
    }

    if (!Array.isArray(products) || products.length === 0) {
      return res
        .status(400)
        .json({ message: "Products must be a non-empty array" });
    }

    const table = await prisma.table.findUnique({
      where: {
        id: tableId,
      },
    });

    if (!table) {
      return res.status(404).json({ message: "Table not found" });
    }

    const newOrder = await prisma.order.create({
      data: {
        user: { connect: { id: table.userId } },
        table: { connect: { id: tableId } },
        products: {
          connect: products.map((productId) => ({ id: productId })),
        },
      },
      include: {
        products: true,
        table: true,
      },
    });

    return res.status(201).json({
      message: `Order placed successfully for table ${tableId}`,
      order: newOrder,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Error placing order for table",
      error: error.message,
    });
  }
};

module.exports = {
  getOrdersByUser,
  getOrdersByTable,
  getOrdersById,
  postOrder,
  deleteOrderByTable,
  deleteOrderById,
  addItemToOrder,
  removeItemFromOrder,
  sendOrderFromTable,
};
