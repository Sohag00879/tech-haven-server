import express from "express";
const router = express.Router();

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import {
  createCategory,
  updateCategory,
  removeCategory,
  listCategory,
  categoryDetails,
} from "../controllers/categoryController.js";

// router.route("/").post(authenticate, authorizeAdmin, createCategory);
router.route("/").post(createCategory);
// router.route("/:categoryId").put(authenticate, authorizeAdmin, updateCategory);
router.route("/:categoryId").put(updateCategory);
// router
//   .route("/:categoryId")
//   .delete(authenticate, authorizeAdmin, removeCategory);
router.route("/:categoryId").delete(removeCategory);

router.route("/all-categories").get(listCategory);
router.route("/:id").get(categoryDetails);

export default router;
