import mongoose from "mongoose";
const connectDB = async () => {
  try {
    mongoose.connect(process.env.DATABASE_URL);
    console.log("successfully connnected to mongodb");
  } catch (error) {
    console.error(`ERROR:${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
