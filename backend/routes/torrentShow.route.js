import express from "express";
import {
  getSeasonEpisodes,
  fetchEpisodeMagnetLink,
  streamSeriesEpisode, // Import the streaming function
} from "../controllers/streamingShow.controller.js";

const router = express.Router();

// Route to fetch episodes of a specific season
router.get("/:id/season/:seasonNumber", getSeasonEpisodes);

// Route to fetch magnet link for a specific episode
router.get(
  "/:id/season/:seasonNumber/episode/:episodeNumber",
  fetchEpisodeMagnetLink
);

// Route to stream a specific episode using a magnet link
router.get("/stream/:magnet", streamSeriesEpisode);

export default router;
