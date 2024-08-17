import asyncHandler from "../middlewares/asyncHandler.js";
import Offer from "../models/offerModel.js";

const createOffer = asyncHandler(async (req, res) => {
  try {
    const offer = await new Offer(req.body);
    await offer.save();
    res.json(offer);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const getOffer = asyncHandler(async (req, res) => {
  try {
    const offer = await Offer.find({});
    res.json(offer);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const updateOffer = asyncHandler(async (req, res) => {
  try {
    const offer = await Offer.findOne({ _id: req.params.id });
    if (offer) {
      offer.percentage = req.body.percentage || offer.percentage;
      offer.offerReason = req.body.offerReason || offer.offerReason;
    }
    const updatedOffer = await offer.save();
    res.json(updatedOffer);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const removeOffer = asyncHandler(async (req, res) => {
  try {
    await Offer.deleteOne({ _id: req.params.id });
    res.json({ message: "Offer Removed" });
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

export { createOffer, getOffer, updateOffer, removeOffer };
