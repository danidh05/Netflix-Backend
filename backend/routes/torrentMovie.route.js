import express from "express";
import {
  fetchMagnetLink,
  streamMovie,
} from "../controllers/streamingMovie.controller.js";

const router = express.Router();

// Fetch the magnet link
router.get("/fetch-magnet/:id", fetchMagnetLink);

// Stream movie via WebTorrent
router.get("/stream/:magnet", streamMovie);

export default router;
