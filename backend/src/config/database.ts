import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing");
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,
    });

    console.log("✅ MongoDB Connected");
  } catch (error) {
    console.error("❌ MongoDB Connection Failed");
    console.error(error);

    process.exit(1);
  }
};

export default connectDB;