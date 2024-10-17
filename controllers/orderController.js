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

const postOrder = async (req, res) => {
  const tableId = parseInt(req.params.tableId, 10);

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

const deleteOrderByTable = async (req, res) => {
  const userId = parseInt(req.session.passport.user, 10);

  if (!userId) {
    return res.status(400).json({ message: "User Id Invalid" });
  }

  const tableId = parseInt(req.params.tableId, 10);

  if (isNaN(tableId)) {
    res.status(400).send("Invalid product id");
  }

  try {
    await prisma.order.deleteMany({
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
        id: orderId,
      },
    });
    res.status(200).json({ message: `Order ${orderId} deleted sucessfully` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: `Error deleting order ${orderId}` });
  }
};

const addItemToOrder = async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(orderId)) {
    return res.status(400).send("Invalid order id");
  }

  if (isNaN(productId)) {
    return res.status(400).send("Invalid product id");
  }

  try {
    const existingOrderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: orderId,
        productId: productId,
      },
    });

    let updatedOrderItem;

    if (existingOrderItem) {
      updatedOrderItem = await prisma.orderItem.update({
        where: {
          id: existingOrderItem.id,
        },
        data: {
          quantity: existingOrderItem.quantity + 1,
        },
      });
    } else {
      updatedOrderItem = await prisma.orderItem.create({
        data: {
          orderId: orderId,
          productId: productId,
          quantity: 1,
        },
      });
    }

    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while adding item to order");
  }
};

const deleteItemFromOrder = async (req, res) => {
  const orderId = parseInt(req.params.orderId, 10);
  const productId = parseInt(req.params.productId, 10);

  if (isNaN(orderId)) {
    return res.status(400).send("Invalid order id");
  }

  if (isNaN(productId)) {
    return res.status(400).send("Invalid product id");
  }

  try {
    // Check if the product exists in the order
    const existingOrderItem = await prisma.orderItem.findFirst({
      where: {
        orderId: orderId,
        productId: productId,
      },
    });

    if (!existingOrderItem) {
      return res.status(404).send("Product not found in the order");
    }

    if (existingOrderItem.quantity > 1) {
      // If the quantity is greater than 1, decrement the quantity
      await prisma.orderItem.update({
        where: {
          id: existingOrderItem.id,
        },
        data: {
          quantity: existingOrderItem.quantity - 1,
        },
      });
    } else {
      // If the quantity is 1, remove the product from the order (delete the OrderItem)
      await prisma.orderItem.delete({
        where: {
          id: existingOrderItem.id,
        },
      });
    }

    // Fetch the updated order with its products and quantities
    const updatedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    res.status(200).json(updatedOrder);
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while deleting item from order");
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
  deleteItemFromOrder,
};
