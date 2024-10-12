import express from "express";
import ExpressFormidable from "express-formidable";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";
import checkId from "../middlewares/checkid.js";
import {
  addProduct,
  updateProductDetails,
  removeProduct,
  fetchProducts,
  fetchSingleProducts,
  fetchAllProducts,
  addProductReview,
  fetchTopProducts,
  fetchNewProducts,
  filterProducts,
  flashSaleProducts,
  productFilterByOffer,
  addProductCompare,
  getProductByCategory,
  // getProductsBySearch,
} from "../controllers/productController.js";
const router = express.Router();

router
  .route("/")
  .get(fetchProducts)
  //   .post(authenticate, authorizeAdmin, ExpressFormidable(), addProduct);
  .post(ExpressFormidable(), addProduct);

router.route("/allProducts").get(fetchAllProducts);

router
  .route("/:id/reviews")
  // .post(authenticate, authorizeAdmin, addProductReview);
  .put(addProductReview);
router.put("/:id/compare", addProductCompare);

router.get("/top", fetchTopProducts);
router.get("/new", fetchNewProducts);
router.get("/flash-sale", flashSaleProducts);
router.get("/offer-products/:percentage", productFilterByOffer);

router
  .route("/:id")
  .get(fetchSingleProducts)
  //   .put(authenticate, authorizeAdmin, ExpressFormidable(), updateProductDetails);
  .put(ExpressFormidable(), updateProductDetails)
  //   .delete(authenticate,authorizeAdmin,removeProduct);
  .delete(removeProduct);

router.route("/filtered-products").post(filterProducts);

router.route("/productByCategory/:category").get(getProductByCategory);

// router.route("/search/search-products").post(getProductsBySearch);

export default router;
