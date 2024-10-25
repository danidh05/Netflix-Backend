import express from "express";
import cookieParser from "cookie-parser";
import path from "path";
import helmet from "helmet"; // Import helmet

import authRoutes from "./routes/auth.route.js";
import movieRoutes from "./routes/movie.route.js";
import tvRoutes from "./routes/tv.route.js";
import searchRoutes from "./routes/search.route.js";
import torrentRoutes from "./routes/torrent.route.js";
import { protectRoute } from "./middleware/protectRoute.js";
import { ENV_VARS } from "./config/envVars.js";
import { connectDB } from "./config/db.js";

const app = express();
const PORT = ENV_VARS.PORT;

const __dirname = path.resolve(); //For deployment

// Body parser and cookie parser middlewares
app.use(express.json());
app.use(cookieParser());

// Routes
app.use("/api/v1/torrent", protectRoute, torrentRoutes); // Use the new torrent route
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/movie", protectRoute, movieRoutes);
app.use("/api/v1/tv", protectRoute, tvRoutes);
app.use("/api/v1/search", protectRoute, searchRoutes);

// Serve frontend in production
if (ENV_VARS.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "/frontend/dist")));

  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "frontend", "dist", "index.html"));
  }); // This catch-all route ensures that any route not defined in your backend is handled by your frontend.
}

// Basic health check route
app.get("/ping", (req, res) => {
  res.status(200).send("OK");
});

// Start the server and connect to the database
app.listen(PORT || 5000, () => {
  console.log("Server started on http://localhost:" + PORT);
  connectDB();
});
