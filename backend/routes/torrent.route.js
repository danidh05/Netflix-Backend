import express from "express";
import {
  fetchMagnetLink,
  streamMovie,
} from "../controllers/streaming.controller.js";

const router = express.Router();

// Fetch the magnet link
router.get("/fetch-magnet/:contentType/:id", fetchMagnetLink);

// Stream movie via WebTorrent
router.get("/stream/:magnet", streamMovie);

export default router;
