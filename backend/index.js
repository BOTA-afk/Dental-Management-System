import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import adminRoutes from "./routes/adminRoutes.js";
import patientRoutes from "./routes/patientRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
import { getTokensFromCode } from "./utils/googleCalendarService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, ".env") });

const app = express();
    
// Middleware
app.use(cors({ origin: process.env.CLIENT_URL ?? "http://localhost:3000" }));
app.use(express.json());

// Test route
app.get("/", (req, res) => {
  res.send("API is running...");
});

// Google OAuth callback endpoint
app.get("/oauth2callback", async (req, res) => {
  const { code } = req.query;
  if (!code) {
    return res.status(400).send("No authorization code provided.");
  }

  try {
    const tokens = await getTokensFromCode(code);
    console.log("\n=========================================");
    console.log("🔑 [GOOGLE OAUTH REFRESH TOKEN GENERATED]:");
    console.log(tokens.refresh_token);
    console.log("=========================================\n");

    res.send(`
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 40px auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);">
        <h2 style="color: #0ea5e9; font-weight: bold;">Google OAuth Successful!</h2>
        <p>Google OAuth flow completed successfully. Please copy the refresh token below and add it to your <strong>backend/.env</strong> file as <strong>GOOGLE_REFRESH_TOKEN</strong>:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 8px; font-family: monospace; font-size: 14px; word-break: break-all; border: 1px solid #e2e8f0; margin: 20px 0; font-weight: bold; color: #0f172a;">
          ${tokens.refresh_token || "Already Authorized (No new refresh token generated. If you need to regenerate it, remove the app permissions in your Google Account Security settings and re-authenticate)"}
        </div>
        <p style="color: #64748b; font-size: 12px;">Then, restart your backend server to apply the environment changes.</p>
      </div>
    `);
  } catch (error) {
    console.error("OAuth token exchange error:", error);
    res.status(500).send("Error exchanging authorization code for tokens: " + error.message);
  }
});



app.use("/api/admin", adminRoutes);
app.use("/api/patient", patientRoutes);

// MongoDB Connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected`);

    // Drop unique index on phoneNumber if it exists to allow duplicate phone numbers
    try {
      await mongoose.connection.db.collection('patients').dropIndex('phoneNumber_1');
      console.log(`🗑️ Dropped unique phoneNumber index from patients collection`);
    } catch (indexErr) {
      // Index might not exist or already dropped, which is fine
    }
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