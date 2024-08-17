import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

const addProduct = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand } = req.fields;

    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
    }

    const product = new Product({ ...req.fields });
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const { name, description, price, category, quantity, brand } = req.fields;

    switch (true) {
      case !name:
        return res.json({ error: "Name is required" });
      case !description:
        return res.json({ error: "Description is required" });
      case !price:
        return res.json({ error: "Price is required" });
      case !category:
        return res.json({ error: "Category is required" });
      case !quantity:
        return res.json({ error: "Quantity is required" });
      case !brand:
        return res.json({ error: "Brand is required" });
    }
    const previousProduct = await Product.findById(req.params.id);

    const finalPrice = (
      previousProduct.price -
      (previousProduct.discount / 100) * previousProduct.price
    ).toFixed(0);
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        ...req.fields,
        finalPrice,
      },
      { new: true }
    );
    await product.save();
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const removeProduct = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchProducts = asyncHandler(async (req, res) => {
  try {
    const pageSize = 6;
    const keyword = req.query.keyword
      ? { name: { $regex: req.query.keyword, $options: "i" } }
      : {};
    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword }).limit(pageSize);
    res.json({
      products,
      page: 1,
      pages: Math.ceil(count / pageSize),
      hasMore: false,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

const fetchSingleProducts = asyncHandler(async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      return res.json(product);
    } else {
      res.status(404);
      throw new Error("Product not found!");
    }
  } catch (error) {
    console.error(error);
    res.status(404).json({ error: "Product not found!" });
  }
});

const fetchAllProducts = asyncHandler(async (req, res) => {
  try {
    const prodcuts = await Product.find({})
      .populate("category")
      .limit(12)
      .sort({ createdAt: -1 });

    res.json(prodcuts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Serve error" });
  }
});

const addProductReview = asyncHandler(async (req, res) => {
  try {
    const { rating, comment, user, name } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      // const alreadyReviewed = product.reviews.find(
      //   (r) => r.user.toString() === req.user._id.toString()
      // );
      const alreadyReviewed = product.reviews.filter(
        (item) => item.user === user
      );
      if (alreadyReviewed.length > 0) {
        res.status(400);
        throw new Error("Product already reviewed");
      }
      // const review = {
      //       //   name: req.user.userName,
      //       //   rating: Number(rating),
      // comment,
      //       //   user: req.user._id,
      //       // };

      const review = {
        name,
        rating: Number(rating),
        comment,
        user,
      };

      product.reviews.push(review);

      product.numReviews = product.reviews.length;

      product.rating =
        product.reviews.reduce((acc, item) => item.rating + acc, 0) /
        product.reviews.length;

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404);
      throw new Error("Product not found");
    }
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchTopProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ rating: -1 }).limit(4);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const fetchNewProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({}).sort({ _id: -1 }).limit(5);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const filterProducts = asyncHandler(async (req, res) => {
  try {
    const { checked, radio } = req.body;
    let args = {};
    if (checked.length > 0) args.category = checked;
    if (radio.length) args.price = { $gte: radio[0], $lte: radio[1] };
    const products = await Product.find(args);
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server Error" });
  }
});
const flashSaleProducts = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ flashSale: "true" });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const productFilterByOffer = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ discount: req.params.percentage });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const addProductCompare = asyncHandler(async (req, res) => {
  console.log(req.params.id);
  try {
    const { compareSiteName, comparePrice, compareDescription } = req.body;
    const product = await Product.findById(req.params.id);

    const compareData = {
      compareSiteName,
      comparePrice,
      compareDescription,
    };

    product.compares.push(compareData);

    await product.save();
    res.status(201).json({ message: "Added" });
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const getProductByCategory = asyncHandler(async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.category });
    res.json(products);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

export {
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
};
