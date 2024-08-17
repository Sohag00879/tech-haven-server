import express from "express";
const router = express.Router();
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getAllOrders,
  getUserOrders,
  countTotalOrders,
  countTotalSales,
  totalSalesByDate,
  findOrderById,
  markOrderAsPaid,
  markOrderAsDelivered,
} from "../controllers/orderController.js";

router
  .route("/")
  // post(authenticate, createOrder);
  .post(createOrder)
  //   .get(authenticate,authorizeAdmin,getAllOrders);
  .get(getAllOrders);

// router.route("/mine").get(authenticate,getUserOrders);
router.route("/mine/:userId").get(getUserOrders);

router.route("/total-orders").get(countTotalOrders);
router.route("/total-sales").get(countTotalSales);
router.route("/total-sales-by-date").get(totalSalesByDate);
// router.route("/:id").get(authenticate,findOrderById);
router.route("/:id").get(findOrderById);
// router.route("/:id/pay").put(authenticate,markOrderAsPaid);
router.route("/:id/pay").put(markOrderAsPaid);
// router.route("/:id/deliver").put(authenticate, authorizeAdmin, markOrderAsDelivered);
router.route("/:id/deliver").put(markOrderAsDelivered);

export default router;
