import express from "express";
import {
  createUser,
  getAllUsers,
  loginUser,
  logoutCurrentUser,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
} from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();
router
  .route("/")
  .post(createUser)
  // .get(authenticate, authorizeAdmin, getAllUsers);
  .get(getAllUsers);
router.post("/auth", loginUser);
router.post("/logout", logoutCurrentUser);
router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  // .put(authenticate, updateCurrentUserProfile);
  .put(updateCurrentUserProfile);

//admin routes
router
  .route("/:id")
  // .delete(authenticate, authorizeAdmin, deleteUserById)
  .delete(deleteUserById)
  // .get(authenticate, authorizeAdmin, getUserById)
  .get(getUserById)
  // .put(authenticate, authorizeAdmin, updateUserById);
  .put(updateUserById);

export default router;
