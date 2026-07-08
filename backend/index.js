import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
    
// Middleware
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:3000" }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});



app.use("/api/admin", adminRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 5000;

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

startServer();