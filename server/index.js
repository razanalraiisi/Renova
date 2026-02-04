// =======================
// Fix MongoDB Atlas connection issues on Node 18+
// =======================
import dns from "dns";
dns.setDefaultResultOrder("ipv4first");
dns.setServers(["8.8.8.8", "8.8.4.4"]); // Use reliable DNS for SRV lookups

// =======================
// Imports
// =======================
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";

// =======================
// Environment
// =======================
dotenv.config();

// =======================
// Express App Setup
// =======================
const app = express();
app.use(cors());
app.use(express.json());

console.log("✓ AUTH ROUTES LOADED");

// =======================
// Routes
// =======================
app.use('/', authRoutes);
app.use("/admin", adminRoutes);

// =======================
// Database Connection
// =======================
const start = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("❌ Missing MONGO_URL in .env");
      process.exit(1);
    }

    // Connect to MongoDB Atlas (no deprecated options)
    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Database Connected");

    // Start server
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("❌ DB Error:", err);
    process.exit(1);
  }
};

// =======================
// Start
// =======================
start();
