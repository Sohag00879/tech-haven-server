import { isAbsolute } from "path";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

function calcPrices(orderItems) {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );

  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxRate = 0.15;
  const taxPrice = (itemsPrice * taxRate).toFixed(2);

  const totalPrice = (
    itemsPrice +
    shippingPrice +
    parseFloat(taxPrice)
  ).toFixed(2);

  return {
    itemsPrice: itemsPrice.toFixed(2),
    shippingPrice: shippingPrice.toFixed(2),
    taxPrice,
    totalPrice,
  };
}

const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod, user } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400);
      throw new Error("No order items");
    }

    const itemsFromDB = await Product.find({
      _id: { $in: orderItems.map((x) => x._id) },
    });

    const dbOrderItems = orderItems.map((itemFromClient) => {
      const matchingItemFromDB = itemsFromDB.find(
        (itemFromDB) => itemFromDB._id.toString() === itemFromClient._id
      );

      return {
        ...itemFromClient,
        product: itemFromClient._id,
        price: matchingItemFromDB.price,
        _id: undefined,
      };
    });

    // const { itemsPrice, taxPrice, shippingPrice, totalPrice } =
    //   calcPrices(dbOrderItems);
    const { itemsPrice, taxPrice, shippingPrice, totalPrice } = req.body;

    const order = new Order({
      orderItems: dbOrderItems,
      // user: req.user._id,
      user,
      shippingAddress,
      paymentMethod,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
    });

    const createdOrder = await order.save();
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getAllOrders = async (req, res) => {
  const orders = await Order.find({})
    .populate("user", "id userName email")
    .sort({ _id: -1 });
  res.json(orders);
  try {
    res.status(500).json({ error: error.message });
  } catch (error) {}
};

const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.params.userId })
      .sort({
        _id: -1,
      })
      .populate("user", "id userName email");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalOrders = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const countTotalSales = async (req, res) => {
  try {
    const orders = await Order.find();
    const totalSales = orders.reduce((sum, order) => sum + order.totalPrice, 0);
    res.json({ totalSales });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const totalSalesByDate = async (req, res) => {
  try {
    const salesByDate = await Order.aggregate([
      {
        $match: {
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$paidAt" },
          },
          totalSales: { $sum: "$totalPrice" },
        },
      },
    ]);
    res.json(salesByDate);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const findOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "user",
      "userName email"
    );

    if (order) {
      res.json(order);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsPaid = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      const updateOrder = await order.save();
      res.status(200).json(updateOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const markOrderAsDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404);
      throw new Error("Order not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const fetchOrdersByTimeFrame = async (req, res) => {
  try {
    const { timeFrame } = req.params;
    const { page = 1, limit = 10 } = req.query; // Pagination parameters
    const today = new Date();
    let startDate = null;

    // Ensure we handle time zone correctly by creating a UTC date for comparison
    const utcToday = new Date(
      Date.UTC(today.getFullYear(), today.getMonth(), today.getDate())
    );

    // Determine the start date based on the time frame
    if (timeFrame === "day") {
      // Get the start of the current day (last 24 hours)
      startDate = new Date(utcToday);
    } else if (timeFrame === "week") {
      // Get the start of the current week (starting on Sunday)
      const startOfWeek = new Date(utcToday);
      startOfWeek.setUTCDate(utcToday.getUTCDate() - utcToday.getUTCDay()); // Set to last Sunday
      startDate = startOfWeek;
    } else if (timeFrame === "month") {
      // Get the start of the current month
      startDate = new Date(
        Date.UTC(utcToday.getUTCFullYear(), utcToday.getUTCMonth(), 1)
      );
    } else if (timeFrame === "year") {
      // Get the start of the current year
      startDate = new Date(Date.UTC(utcToday.getUTCFullYear(), 0, 1));
    }

    // MongoDB aggregate pipeline
    const matchStage = startDate
      ? { createdAt: { $gte: startDate } } // Filter by start date
      : {}; // No filter for "all" option

    const orders = await Order.aggregate([
      {
        $match: matchStage, // Apply match condition based on the selected time frame
      },
      {
        $sort: { createdAt: -1 }, // Sort by creation date (newest first)
      },
      {
        $skip: (page - 1) * limit, // Skip documents for pagination
      },
      {
        $limit: parseInt(limit), // Limit number of documents
      },
      {
        $project: {
          _id: 1,
          user: 1, // Keep user ID for now, will populate below
          orderItems: 1,
          totalPrice: 1,
          isPaid: 1,
          isDelivered: 1,
          createdAt: 1,
        }, // Select fields to return
      },
    ]).exec();

    // Populate the user field to get full user details
    const populatedOrders = await Order.populate(orders, {
      path: "user", // Path to the user field
      select: "userName email", // Select specific user fields to populate
    });

    // Count total orders (for pagination)
    const totalOrders = await Order.countDocuments(matchStage);

    res.json({
      currentPage: page,
      totalPages: Math.ceil(totalOrders / limit),
      totalOrders,
      items: populatedOrders, // Return populated orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
};

// Update Paid and Delivered Status
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { isPaid, isDelivered } = req.body; // Receiving status updates from the request body

    // Find the order by ID
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Update the status
    if (isPaid !== undefined) order.isPaid = isPaid;
    if (isDelivered !== undefined) order.isDelivered = isDelivered;

    // If marking as paid, set the `paidAt` date
    if (isPaid && !order.paidAt) {
      order.paidAt = new Date();
    }

    // If marking as delivered, set the `deliveredAt` date
    if (isDelivered && !order.deliveredAt) {
      order.deliveredAt = new Date();
    }

    // Save the updated order
    const updatedOrder = await order.save();

    res
      .status(200)
      .json({ message: "Order updated successfully", order: updatedOrder });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  countTotalSales,
  totalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
  fetchOrdersByTimeFrame,
  updateOrderStatus,
};
