import puppeteer from "puppeteer";
import cheerio from "cheerio";

export async function get1337xTorrents(imdbId, season, episode) {
  const query = `${imdbId} S${season.toString().padStart(2, "0")}E${episode
    .toString()
    .padStart(2, "0")}`;
  const url = `https://1337x.to/search/${encodeURIComponent(query)}/1/`;

  console.log(
    `Fetching torrents from 1337x for IMDb ID: ${imdbId}, Season: ${season}, Episode: ${episode}`
  );

  let torrents = [];

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--window-size=1920x1080",
        "--incognito",
      ],
    });

    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/85.0.4183.121 Safari/537.36"
    );
    await page.setViewport({ width: 1920, height: 1080 });

    console.log("Navigating to 1337x page...");
    await page.goto(url, { waitUntil: "domcontentloaded" });

    console.log("Waiting for selector .box-info-detail...");
    await page.waitForSelector(".box-info-detail");

    const data = await page.content();
    console.log("1337x Raw HTML Response Length:", data.length);

    const $ = cheerio.load(data);
    $("tbody tr").each((_, element) => {
      const title = $(element).find(".name a").last().text();
      const magnetUrl = $(element).find("a[href^='magnet:?']").attr("href");
      const seeds = parseInt($(element).find(".seeds").text(), 10);

      // Filter only TV shows by checking episode naming format (SxxExx)
      const episodePattern = new RegExp(
        `S${season.toString().padStart(2, "0")}E${episode
          .toString()
          .padStart(2, "0")}`,
        "i"
      );
      if (title && magnetUrl && episodePattern.test(title) && seeds > 0) {
        torrents.push({ title, magnet_url: magnetUrl, seeds });
      }
    });

    console.log(`Parsed 1337x Torrents: Found ${torrents.length} torrents.`);
    await browser.close();
    return torrents;
  } catch (error) {
    console.error("Error fetching from 1337x with Puppeteer:", error.message);
    return torrents;
  }
}
