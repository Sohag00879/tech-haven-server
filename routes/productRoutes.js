import express from "express";
import {
  addProduct,
  addProductCompare,
  addProductReview,
  fetchAllProducts,
  fetchNewProducts,
  fetchProducts,
  fetchSingleProducts,
  fetchTopProducts,
  filterProducts,
  flashSaleProducts,
  getProductByCategory,
  getProductsBySearch,
  productFilterByOffer,
  removeProduct,
  updateProductDetails,
} from "../controllers/productController.js";
const router = express.Router();

router
  .route("/")
  .get(fetchProducts)
  //   .post(authenticate, authorizeAdmin, ExpressFormidable(), addProduct);
  // .post(ExpressFormidable(), addProduct);
  .post(addProduct);

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
  // .put(ExpressFormidable(), updateProductDetails)
  .put(updateProductDetails)
  //   .delete(authenticate,authorizeAdmin,removeProduct);
  .delete(removeProduct);

router.route("/filtered-products").post(filterProducts);

router.route("/productByCategory/:category").get(getProductByCategory);

router.route("/search/search-products").post(getProductsBySearch);

export default router;
