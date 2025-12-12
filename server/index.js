import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import adminRoutes from "./routes/adminRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

console.log("🔥 AUTH ROUTES LOADED");

// Routes
app.use('/', authRoutes);
app.use("/admin", adminRoutes);

// DB Connection
const start = async () => {
  try {
    if (!process.env.MONGO_URL) {
      console.error("Missing MONGO_URL");
      process.exit(1);
    }

    await mongoose.connect(process.env.MONGO_URL);
    console.log("✓ Database Connected");

    app.listen(5000, () => {
      console.log("✓ Server running on port 5000");
    });
  } catch (err) {
    console.error("DB Error:", err);
    process.exit(1);
  }
};

start();
