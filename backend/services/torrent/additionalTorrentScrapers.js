import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "../../utils/logger.js"; // Adjust the path as needed

// Helper function to create a magnet link using the info hash
function createMagnetLink(infoHash) {
  return `magnet:?xt=urn:btih:${infoHash}`;
}

// Function to centralize page fetching logic
async function fetchPageContent(url) {
  try {
    if (!url.startsWith("http")) {
      logger(`Unsupported protocol detected: ${url}`);
      return null;
    }
    const response = await axios.get(url, { maxRedirects: 0 });
    return response.data;
  } catch (error) {
    logger(`Error fetching page content from ${url}: ${error.message}`);
    return null;
  }
}

// Function to scrape magnet link from EZTV
export async function getMagnetLinkFromEZTV(detailUrl) {
  try {
    logger(`Scraping EZTV for magnet link at: ${detailUrl}`);

    if (detailUrl.startsWith("magnet:")) {
      logger(`Direct magnet link found: ${detailUrl}`);
      return detailUrl;
    }

    if (!detailUrl.startsWith("http")) {
      logger(`Unsupported protocol for EZTV scraping: ${detailUrl}`);
      return null;
    }

    const pageContent = await fetchPageContent(detailUrl);
    if (!pageContent) {
      logger(
        `Failed to fetch or process page content for EZTV at: ${detailUrl}`
      );
      return null;
    }

    const $ = cheerio.load(pageContent);
    let magnetLink = $("a[href^='magnet:']").attr("href");
    if (!magnetLink) {
      const infoHash = $(".infohash").text().trim();
      if (infoHash) {
        magnetLink = createMagnetLink(infoHash);
        logger(`Info hash found on EZTV: ${infoHash}`);
      } else {
        logger("No magnet link or info hash found on EZTV.");
      }
    } else {
      logger(`Magnet link found on EZTV: ${magnetLink}`);
    }

    return magnetLink;
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logger("Redirect detected, possible magnet link was redirected.");
      return detailUrl;
    }
    logger(`Error scraping EZTV: ${error.message}`);
    return null;
  }
}

// Function to scrape magnet link from The Pirate Bay
export async function getMagnetLinkFromPirateBay(detailUrl) {
  try {
    logger(`Scraping The Pirate Bay for magnet link at: ${detailUrl}`);

    if (detailUrl.startsWith("magnet:")) {
      logger(`Direct magnet link found: ${detailUrl}`);
      return detailUrl;
    }

    if (!detailUrl.startsWith("http")) {
      logger(`Unsupported protocol for The Pirate Bay scraping: ${detailUrl}`);
      return null;
    }

    const pageContent = await fetchPageContent(detailUrl);
    if (!pageContent) {
      logger(
        `Failed to fetch or process page content for The Pirate Bay at: ${detailUrl}`
      );
      return null;
    }

    const $ = cheerio.load(pageContent);
    let magnetLink = $("a[href^='magnet:']").attr("href");
    if (!magnetLink) {
      const infoHash = $(".infohash").text().trim();
      if (infoHash) {
        magnetLink = createMagnetLink(infoHash);
        logger(`Info hash found on The Pirate Bay: ${infoHash}`);
      } else {
        logger("No magnet link or info hash found on The Pirate Bay.");
      }
    } else {
      logger(`Magnet link found on The Pirate Bay: ${magnetLink}`);
    }

    return magnetLink;
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logger("Redirect detected, possible magnet link was redirected.");
      return detailUrl;
    }
    logger(`Error scraping The Pirate Bay: ${error.message}`);
    return null;
  }
}

// Function to scrape magnet link from YTS
export async function getMagnetLinkFromYTS(detailUrl) {
  try {
    logger(`Scraping YTS for magnet link at: ${detailUrl}`);

    if (detailUrl.startsWith("magnet:")) {
      logger(`Direct magnet link found: ${detailUrl}`);
      return detailUrl;
    }

    if (!detailUrl.startsWith("http")) {
      logger(`Unsupported protocol for YTS scraping: ${detailUrl}`);
      return null;
    }

    const pageContent = await fetchPageContent(detailUrl);
    if (!pageContent) {
      logger(
        `Failed to fetch or process page content for YTS at: ${detailUrl}`
      );
      return null;
    }

    const $ = cheerio.load(pageContent);
    let magnetLink = $("a[href^='magnet:']").attr("href");
    if (!magnetLink) {
      const infoHash = $(".infohash").text().trim();
      if (infoHash) {
        magnetLink = createMagnetLink(infoHash);
        logger(`Info hash found on YTS: ${infoHash}`);
      } else {
        logger("No magnet link or info hash found on YTS.");
      }
    } else {
      logger(`Magnet link found on YTS: ${magnetLink}`);
    }

    return magnetLink;
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logger("Redirect detected, possible magnet link was redirected.");
      return detailUrl;
    }
    logger(`Error scraping YTS: ${error.message}`);
    return null;
  }
}
