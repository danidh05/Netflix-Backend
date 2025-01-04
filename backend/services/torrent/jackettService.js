import axios from "axios";
import xml2js from "xml2js"; // Import XML parser
import { ENV_VARS } from "../../config/envVars.js";
import { logger } from "../../utils/logger.js"; // Adjust the path as necessary
import * as cheerio from "cheerio";

export async function getJackettTorrents(query) {
  logger(`Starting search for torrents with query: ${query}`);
  const url = `${ENV_VARS.JACKETT_API_URL}?apikey=${
    ENV_VARS.JACKETT_API_KEY
  }&t=search&q=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url, {
      headers: { Accept: "application/xml" }, // Ensure the response is XML
    });

    logger(`Received response from Jackett API for query: ${query}`);

    // Parse the XML response
    const parsedData = await xml2js.parseStringPromise(response.data);
    const items = parsedData.rss.channel[0].item || []; // Adjusted based on Jackett's XML structure

    logger(`Number of torrent items found: ${items.length}`);

    // Map through each item and fetch the magnet link from the detail page
    const torrents = await Promise.all(
      items.map(async (item) => {
        const detailUrl = item.link[0]; // Extract the detail URL from the parsed XML

        // Extract seeders from torznab:attr
        const seedersAttr = item["torznab:attr"]?.find(
          (attr) => attr.$.name === "seeders"
        );
        const seeders = seedersAttr ? parseInt(seedersAttr.$.value, 10) : 0;

        // Check if the detail URL is already a magnet link
        let magnetLink;
        if (detailUrl.startsWith("magnet:")) {
          logger(`Detail URL is already a magnet link: ${detailUrl}`);
          magnetLink = detailUrl;
        } else {
          logger(`Fetching magnet link from detail URL: ${detailUrl}`);
          magnetLink = await fetchMagnetLink(detailUrl);
        }

        if (magnetLink) {
          logger(
            `Magnet link found for title "${item.title[0]}": ${magnetLink}`
          );
        } else {
          logger(`No magnet link found for title "${item.title[0]}"`);
        }

        return {
          title: item.title[0],
          magnet_url: magnetLink,
          seeds: seeders, // Use the parsed seeders value
          size: item.size?.[0], // Adjust as needed based on XML response structure
        };
      })
    );

    // Filter out items with no magnet link
    const filteredTorrents = torrents.filter((torrent) => torrent.magnet_url);
    logger(
      `Number of valid torrents with magnet links: ${filteredTorrents.length}`
    );

    return filteredTorrents;
  } catch (error) {
    logger(`Error fetching torrents from Jackett: ${error.message}`);
    console.error("Error fetching torrents from Jackett:", error.message);
    return [];
  }
}

// Helper function to fetch the magnet link from a detail page
async function fetchMagnetLink(detailUrl) {
  if (detailUrl.startsWith("magnet:")) {
    logger(`Skipping fetching; already a magnet link: ${detailUrl}`);
    return detailUrl; // Return the magnet link directly if it's already in the proper format
  }
  try {
    const response = await axios
      .get(detailUrl, { maxRedirects: 0 })
      .catch((error) => {
        // Handle redirects that lead to a magnet link
        if (
          error.response &&
          error.response.headers.location &&
          error.response.headers.location.startsWith("magnet:")
        ) {
          logger(
            `Redirected to a magnet link: ${error.response.headers.location}`
          );
          return { magnetLink: error.response.headers.location };
        }
        throw error;
      });

    if (response.magnetLink) {
      return response.magnetLink; // Return the magnet link found during the redirect
    }

    logger(`Fetched detail page content from: ${detailUrl}`);
    const $ = cheerio.load(response.data);
    const magnetLink = $("a[href^='magnet:']").attr("href");

    if (magnetLink) {
      logger(`Magnet link extracted successfully from: ${detailUrl}`);
    } else {
      logger(`No magnet link found in the detail page at: ${detailUrl}`);
    }

    return magnetLink;
  } catch (error) {
    logger(
      `Error fetching magnet link from detail page (${detailUrl}): ${error.message}`
    );
    console.error(
      "Error fetching magnet link from detail page:",
      error.message
    );
    return null;
  }
}
