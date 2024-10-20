import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import path from "path";
//utils
dotenv.config();
const port = process.env.PORT || 5000;

import fileUpload from "express-fileupload";
import connectDB from "./config/db.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import userRoutes from "./routes/userRoutes.js";

connectDB();
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors());
app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);

app.get("/", (req, res) => res.send("hello from server"));
app.use("/api/users", userRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/product", productRoutes);
app.use("/api/offer", offerRoutes);
app.use("/api/orders", orderRoutes);
// app.use("/api/upload", uploadRoutes);
const __dirname = path.resolve();
// app.use("/uploads", express.static(path.join(__dirname + "/uploads")));
app.listen(port, () => console.log(`Server running on port:${port}`));
