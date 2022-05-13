import mongoose from "mongoose";
import colors from "colors";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected".brightGreen);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

export default connectDB;

