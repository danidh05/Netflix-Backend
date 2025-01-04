import { getMagnetLinkFromJackettOrScrape } from "./torrentFetcher.js";
import { generateEpisodePatterns } from "./torrentUtils.js"; // For pattern matching
import { logger } from "../../utils/logger.js"; // Adjust path as needed
export const getBestTorrentMagnetLink = async (showName, season, episode) => {
  const patterns = generateEpisodePatterns(season, episode);
  const query = `${showName} S${season.toString().padStart(2, "0")}E${episode
    .toString()
    .padStart(2, "0")}`;

  logger(`Fetching torrents with query: ${query}...`);
  const torrents = await getMagnetLinkFromJackettOrScrape(query);

  if (!torrents || torrents.length === 0) {
    logger("No torrents found.");
    return null;
  }

  logger("Applying patterns and filtering based on seeds...");

  // Filter torrents based on patterns and seed count
  const matchingTorrents = torrents.filter((torrent) => {
    const matchesPattern = patterns.some((pattern) =>
      pattern.test(torrent.title)
    );
    const hasSeeds = torrent.seeds > 0; // Set your threshold here if needed
    return matchesPattern && hasSeeds;
  });

  if (matchingTorrents.length === 0) {
    logger("No suitable torrents with seeds found after filtering.");
    return null;
  }

  // Select the torrent with the highest seed count
  const bestTorrent = matchingTorrents.reduce((best, torrent) =>
    torrent.seeds > best.seeds ? torrent : best
  );

  logger(
    `Best torrent selected: ${bestTorrent.title} with ${bestTorrent.seeds} seeds.`
  );
  return bestTorrent.magnet_url;
};
