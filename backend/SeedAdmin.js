import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js'; // Adjust path if needed

dotenv.config();

const seedAdmin = async () => {
  try {
    // Connect to DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Database connected for seeding...");

    // Create a default admin
    const adminData = {
      fullName: "System Admin",
      email: "admin@dentplus.com",
      password: "password123" // This will be hashed by your Admin model pre-save hook
    };

    const adminExists = await Admin.findOne({ email: adminData.email });

    if (adminExists) {
      console.log("⚠️ Admin already exists. Skipping seed.");
    } else {
      const admin = new Admin(adminData);
      await admin.save();
      console.log("🚀 Default admin seeded successfully!");
    }

    process.exit();
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedAdmin();