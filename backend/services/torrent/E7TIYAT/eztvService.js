import EztvApi from "eztv-api-pt";

const eztv = new EztvApi();

export async function getEztvTorrents(imdbId, season, episode) {
  console.log(
    `Fetching torrents from EZTV for IMDb ID: ${imdbId}, Season: ${season}, Episode: ${episode}`
  );
  const allTorrents = [];
  let page = 1;
  let hasMoreResults = true;

  try {
    while (hasMoreResults) {
      const response = await eztv.getTorrents({
        page,
        limit: 500,
        imdb: imdbId,
        season,
        episode,
      });

      console.log(`EZTV Page ${page} API Response:`, response);
      const torrents = response.torrents || [];
      allTorrents.push(...torrents);

      console.log(
        `Parsed EZTV Torrents: Found ${torrents.length} torrents on page ${page}.`
      );
      if (torrents.length < 50) {
        hasMoreResults = false; // No more pages if less than the limit returned
      } else {
        page += 1; // Fetch next page
      }
    }

    console.log(`Total torrents fetched from EZTV: ${allTorrents.length}`);
    return allTorrents;
  } catch (error) {
    console.error("Error fetching from EZTV:", error.message);
    return [];
  }
}
