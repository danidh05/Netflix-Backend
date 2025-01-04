// Common tracker URLs
export const TRACKERS = [
  "udp://tracker.coppersurfer.tk:6969/announce",
  "udp://tracker.opentrackr.org:1337",
  "udp://tracker.internetwarriors.net:1337/announce",
];

// Regex patterns to match specific episode formats
export const generateEpisodePatterns = (season, episode) => {
  const seasonString = season.toString().padStart(2, "0");
  const episodeString = episode.toString().padStart(2, "0");

  return [
    new RegExp(`S${seasonString}E${episodeString}`, "i"), // Standard S01E01
    new RegExp(
      `Season[\\s_.-]*${seasonString}[\\s_.-]*Episode[\\s_.-]*${episodeString}`,
      "i"
    ), // Full words with separators
    new RegExp(`${seasonString}x${episodeString}`, "i"), // 01x01 format
    new RegExp(`\\b${seasonString}[\\s_.-]*${episodeString}\\b`, "i"), // Just 01 01, with separators
    new RegExp(`\\b${seasonString}[\\s_.-]0*${episode}\\b`, "i"), // Matches 01-1, 1-1, 01_1, etc.
  ];
};
