import { getJackettTorrents } from "./jackettService.js"; // Import the function for direct Jackett fetching
import { logger } from "../../utils/logger.js"; // Adjust path as needed

export async function getMagnetLinkFromJackettOrScrape(query) {
  try {
    // Step 1: Call the getJackettTorrents function to fetch torrents from Jackett
    logger(`Fetching torrents using getJackettTorrents for query: ${query}`);
    const jackettTorrents = await getJackettTorrents(query);

    if (!jackettTorrents || jackettTorrents.length === 0) {
      logger("No torrents found from Jackett API.");
      return [];
    }

    logger(`Number of items received from Jackett: ${jackettTorrents.length}`);

    // Step 2: Filter and return items with valid magnet links
    const filteredTorrents = jackettTorrents.filter((torrent) => {
      if (!torrent || !torrent.magnet_url) {
        logger(
          `Filtered out torrent due to missing magnet_url: ${JSON.stringify(
            torrent
          )}`
        );
      }
      return torrent && torrent.magnet_url;
    });

    logger(
      `Total magnet links found after processing: ${filteredTorrents.length}`
    );
    logger(`Magnet links found: ${JSON.stringify(filteredTorrents, null, 2)}`);

    return filteredTorrents;
  } catch (error) {
    logger(`Error in getMagnetLinkFromJackettOrScrape: ${error.message}`);
    return [];
  }
}
