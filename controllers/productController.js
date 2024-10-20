import cloudinary from "cloudinary";
import dotenv from "dotenv";
import asyncHandler from "../middlewares/asyncHandler.js";
import Product from "../models/productModel.js";

dotenv.config();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
const addProduct = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      brand,
      countInStock,
    } = req.body;

    // start

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.json({ error: "Product Image Required" });
    }
    const { docAvatar } = req.files;
    const allowedFormats = [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/jpg",
    ];
    if (!allowedFormats.includes(docAvatar.mimetype)) {
      return res.json({ error: '"File Format Not Supported!"' });
    }
    const cloudinaryResponse = await cloudinary.uploader.upload(
      docAvatar.tempFilePath
    );
    if (!cloudinaryResponse || cloudinaryResponse.error) {
      console.error(
        "Cloudinary Error:",
        cloudinaryResponse.error || "Unknown Cloudinary error"
      );
      return res.json({
        error: "Failed To Upload Product Avatar To Cloudinary",
      });
    }
    // end

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
      case !countInStock:
        return res.json({ error: "CountInStok is required" });
    }

    // const product = new Product({ ...req.fields });
    // await product.save();
    // res.json(product);

    const product = await Product.create({
      name,
      description,
      price,
      category,
      quantity,
      brand,
      countInStock,

      docAvatar: {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      },
    });
    res.json(product);
  } catch (error) {
    console.error(error);
    res.status(400).json(error.message);
  }
});

const updateProductDetails = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category,
      quantity,
      brand,
      discount,
      countInStock,
    } = req.body;

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !category ||
      !quantity ||
      !brand ||
      !countInStock
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Retrieve the existing product
    const previousProduct = await Product.findById(req.params.id);
    if (!previousProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    let finalPrice;
    // Calculate final price based on discount, if provided
    if (discount && discount > 0 && discount <= 100) {
      finalPrice = price - (price * discount) / 100;
    } else {
      finalPrice = price;
    }

    // Check if a new image is uploaded
    let updatedDocAvatar = previousProduct.docAvatar; // Default to the existing image
    if (req.files && req.files.docAvatar) {
      const { docAvatar } = req.files;
      const allowedFormats = [
        "image/png",
        "image/jpeg",
        "image/webp",
        "image/jpg",
      ];
      if (!allowedFormats.includes(docAvatar.mimetype)) {
        return res.status(400).json({ error: "File format not supported!" });
      }

      // Upload new image to Cloudinary
      const cloudinaryResponse = await cloudinary.uploader.upload(
        docAvatar.tempFilePath
      );
      if (!cloudinaryResponse || cloudinaryResponse.error) {
        console.error(
          "Cloudinary Error:",
          cloudinaryResponse.error || "Unknown Cloudinary error"
        );
        return res
          .status(500)
          .json({ error: "Failed to upload product image" });
      }

      // Set the new image data
      updatedDocAvatar = {
        public_id: cloudinaryResponse.public_id,
        url: cloudinaryResponse.secure_url,
      };
    }

    // Update product details
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      {
        name,
        description,
        price,
        finalPrice,
        discount: discount || previousProduct.discount, // Retain previous discount if no new one is provided
        category,
        quantity,
        countInStock,
        brand,
        docAvatar: updatedDocAvatar, // Use either the new image or retain the existing one
      },
      { new: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error("Product Update Error:", error);
    res.status(500).json({ error: "Product update failed. Try again." });
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

const getProductsBySearch = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.json([]);
    }

    const products = await Product.find({
      name: { $regex: `^${query}`, $options: "i" },
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export {
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
};
