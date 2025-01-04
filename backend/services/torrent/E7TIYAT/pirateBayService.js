import axios from "axios";

export async function getPirateBayTorrents(query) {
  const url = `https://apibay.org/q.php?q=${encodeURIComponent(query)}`;
  console.log(`Fetching torrents from PirateBay with query: ${query}`);

  try {
    const { data } = await axios.get(url);
    console.log("PirateBay Raw API Response:", data);

    const torrents = data.map((item) => ({
      title: item.name,
      magnet_url: `magnet:?xt=urn:btih:${item.info_hash}`,
      seeds: parseInt(item.seeders, 10),
    }));
    console.log(
      `Parsed PirateBay Torrents: Found ${torrents.length} torrents.`
    );
    return torrents;
  } catch (error) {
    console.error("Error fetching from PirateBay:", error.message);
    return [];
  }
}
