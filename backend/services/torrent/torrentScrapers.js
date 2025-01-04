import axios from "axios";
import * as cheerio from "cheerio";
import { logger } from "../../utils/logger.js"; // Adjust the path as needed

// Helper function to create a magnet link using the info hash
function createMagnetLink(infoHash) {
  return `magnet:?xt=urn:btih:${infoHash}`;
}

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

export async function getMagnetLinkFrom1337x(detailUrl) {
  try {
    logger(`Scraping 1337x for magnet link at: ${detailUrl}`);

    // Check if the detailUrl is a magnet link
    if (detailUrl.startsWith("magnet:")) {
      logger(`Direct magnet link found: ${detailUrl}`);
      return detailUrl;
    }

    // Only proceed with fetching if it's an HTTP/HTTPS URL
    if (detailUrl.startsWith("http")) {
      const pageContent = await fetchPageContent(detailUrl);
      if (!pageContent) {
        logger(
          `Failed to fetch or process page content for 1337x at: ${detailUrl}`
        );
        return null;
      }

      const $ = cheerio.load(pageContent);
      let magnetLink = $("a[href^='magnet:']").attr("href");
      if (!magnetLink) {
        const infoHash = $(".infohash").text().trim();
        if (infoHash) {
          magnetLink = createMagnetLink(infoHash);
          logger(`Info hash found on 1337x: ${infoHash}`);
        } else {
          logger("No magnet link or info hash found on 1337x.");
        }
      } else {
        logger(`Magnet link found on 1337x: ${magnetLink}`);
      }

      return magnetLink;
    } else {
      logger(`Unsupported protocol for scraping: ${detailUrl}`);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logger("Redirect detected, possible magnet link was redirected.");
      return detailUrl;
    }
    logger(`Error scraping 1337x: ${error.message}`);
    return null;
  }
}

export async function getMagnetLinkFromRarbg(detailUrl) {
  try {
    logger(`Scraping RARBG for magnet link at: ${detailUrl}`);

    // Check if the detailUrl is a magnet link
    if (detailUrl.startsWith("magnet:")) {
      logger(`Direct magnet link found: ${detailUrl}`);
      return detailUrl;
    }

    // Only proceed with fetching if it's an HTTP/HTTPS URL
    if (detailUrl.startsWith("http")) {
      const pageContent = await fetchPageContent(detailUrl);
      if (!pageContent) {
        logger(
          `Failed to fetch or process page content for RARBG at: ${detailUrl}`
        );
        return null;
      }

      const $ = cheerio.load(pageContent);
      let magnetLink = $("a[href^='magnet:']").attr("href");
      if (!magnetLink) {
        const infoHash = $(".infohash").text().trim();
        if (infoHash) {
          magnetLink = createMagnetLink(infoHash);
          logger(`Info hash found on RARBG: ${infoHash}`);
        } else {
          logger("No magnet link or info hash found on RARBG.");
        }
      } else {
        logger(`Magnet link found on RARBG: ${magnetLink}`);
      }

      return magnetLink;
    } else {
      logger(`Unsupported protocol for scraping: ${detailUrl}`);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logger("Redirect detected, possible magnet link was redirected.");
      return detailUrl;
    }
    logger(`Error scraping RARBG: ${error.message}`);
    return null;
  }
}

export async function getMagnetLinkFromTorlock(detailUrl) {
  try {
    logger(`Scraping Torlock for magnet link at: ${detailUrl}`);

    // Check if the detailUrl is a magnet link
    if (detailUrl.startsWith("magnet:")) {
      logger(`Direct magnet link found: ${detailUrl}`);
      return detailUrl;
    }

    // Only proceed with fetching if it's an HTTP/HTTPS URL
    if (detailUrl.startsWith("http")) {
      const pageContent = await fetchPageContent(detailUrl);
      if (!pageContent) {
        logger(
          `Failed to fetch or process page content for Torlock at: ${detailUrl}`
        );
        return null;
      }

      const $ = cheerio.load(pageContent);
      let magnetLink = $("a[href^='magnet:']").attr("href");
      if (!magnetLink) {
        const infoHash = $(".infohash").text().trim();
        if (infoHash) {
          magnetLink = createMagnetLink(infoHash);
          logger(`Info hash found on Torlock: ${infoHash}`);
        } else {
          logger("No magnet link or info hash found on Torlock.");
        }
      } else {
        logger(`Magnet link found on Torlock: ${magnetLink}`);
      }

      return magnetLink;
    } else {
      logger(`Unsupported protocol for scraping: ${detailUrl}`);
      return null;
    }
  } catch (error) {
    if (error.response && error.response.status === 302) {
      logger("Redirect detected, possible magnet link was redirected.");
      return detailUrl;
    }
    logger(`Error scraping Torlock: ${error.message}`);
    return null;
  }
}
