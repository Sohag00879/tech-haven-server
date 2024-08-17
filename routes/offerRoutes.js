import express from "express";
import {
  createOffer,
  getOffer,
  removeOffer,
  updateOffer,
} from "../controllers/offerController.js";

const router = express.Router();

router.get("/", getOffer);
router.post("/", createOffer);
router.put("/:id", updateOffer);
router.delete("/:id", removeOffer);

export default router;
