import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup (important for Render)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/favorites", favoriteRoutes);

// Health check route
app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
