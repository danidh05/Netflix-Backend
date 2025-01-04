import { getBestTorrentMagnetLink } from "../services/torrent/torrentService.js"; // Assuming you move the torrent logic here
import { fetchFromTMDB } from "../services/tmdb/tmdb.service.js";
import WebTorrent from "webtorrent";
import { streamLogger } from "../utils/streamLogger.js";
// Fetch episodes for a specific season
export async function getSeasonEpisodes(req, res) {
  const { id, seasonNumber } = req.params;

  try {
    const data = await fetchFromTMDB(
      `https://api.themoviedb.org/3/tv/${id}/season/${seasonNumber}`
    );
    res.status(200).json({ success: true, episodes: data.episodes });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch episodes." });
  }
}

// Fetch magnet link for a specific episode
export const fetchEpisodeMagnetLink = async (req, res) => {
  const { id, seasonNumber, episodeNumber } = req.params;
  console.log(
    `Received request for show ID: ${id}, Season: ${seasonNumber}, Episode: ${episodeNumber}`
  );

  try {
    // Use fetchFromTMDB to get show details from TMDb
    console.log("Fetching show details from TMDb...");
    const tmdbResponse = await fetchFromTMDB(
      `https://api.themoviedb.org/3/tv/${id}?append_to_response=external_ids`
    );

    // Retrieve the show name from the TMDb response
    const showName = tmdbResponse.name;
    if (!showName) {
      console.error("Show name not found in TMDb response.");
      return res
        .status(404)
        .json({ success: false, message: "Show name not found." });
    }
    console.log(`Show name retrieved: ${showName}`);

    // Fetch the best magnet link for the episode using the show name, season, and episode
    console.log(
      `Fetching magnet link for Show: ${showName}, Season: ${seasonNumber}, Episode: ${episodeNumber}`
    );
    const magnetLink = await getBestTorrentMagnetLink(
      showName,
      seasonNumber,
      episodeNumber
    );

    if (magnetLink) {
      const encodedMagnetLink = encodeURIComponent(magnetLink);
      console.log("Magnet link found and encoded:", encodedMagnetLink);
      res.status(200).json({ success: true, magnetLink: encodedMagnetLink });
    } else {
      console.error("No suitable magnet link found.");
      res
        .status(404)
        .json({ success: false, message: "Magnet link not found." });
    }
  } catch (error) {
    console.error("Error fetching magnet link:", error.message);
    res
      .status(500)
      .json({ success: false, message: "Error fetching magnet link." });
  }
};

export const streamSeriesEpisode = (req, res) => {
  const magnet = decodeURIComponent(req.params.magnet); // Decode the magnet link
  streamLogger(`Received streaming request for magnet link: ${magnet}`);

  const client = new WebTorrent();

  client.add(magnet, (torrent) => {
    streamLogger(`Torrent added successfully: ${torrent.infoHash}`);
    streamLogger(`Initial number of peers connected: ${torrent.numPeers}`);

    torrent.on("wire", (wire, addr) => {
      streamLogger(`Connected to peer: ${addr}`);
    });

    // Log download speed and number of peers at intervals
    setInterval(() => {
      streamLogger(`Peers connected: ${torrent.numPeers}`);
      streamLogger(`Download speed: ${torrent.downloadSpeed} bytes/s`);
      streamLogger(`Upload speed: ${torrent.uploadSpeed} bytes/s`);
    }, 5000);

    const file = torrent.files.find(
      (file) =>
        file.name.endsWith(".mp4") ||
        file.name.endsWith(".mkv") ||
        file.name.endsWith(".ts")
    );

    if (file) {
      streamLogger(`File to stream found: ${file.name}`);
      const range = req.headers.range;
      if (!range) {
        res.status(400).send("Requires Range header");
        return;
      }

      const positions = range.replace(/bytes=/, "").split("-");
      const start = parseInt(positions[0], 10);
      const fileSize = file.length;
      const end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      // Set the Content-Type header based on the file extension
      const contentType = file.name.endsWith(".ts")
        ? "video/MP2T"
        : "video/mp4";

      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunkSize);
      res.setHeader("Content-Type", contentType);
      res.status(206);

      streamLogger(`Starting stream for ${file.name}, range: ${start}-${end}`);

      // Create a read stream with specific handling for .ts files
      const streamOptions = file.name.endsWith(".ts")
        ? {} // Let the .ts file handle its chunking naturally
        : { start, end };

      const stream = file.createReadStream(streamOptions);
      stream.pipe(res);

      stream.on("data", (chunk) => {
        streamLogger(`Streaming chunk of size: ${chunk.length}`);
      });

      stream.on("end", () => {
        streamLogger(`Stream ended for ${file.name}`);
        client.destroy();
      });

      stream.on("error", (err) => {
        streamLogger(`Stream error: ${err.message}`);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: err.message });
        }
        client.destroy();
      });
    } else {
      streamLogger("No suitable video file found in torrent.");
      if (!res.headersSent) {
        res
          .status(404)
          .json({ success: false, message: "Video file not found" });
      }
      client.destroy();
    }
  });

  client.on("error", (err) => {
    streamLogger(`WebTorrent client error: ${err.message}`);
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  client.on("download", (bytes) => {
    streamLogger(`Downloaded ${bytes} bytes`);
  });

  client.on("upload", (bytes) => {
    streamLogger(`Uploaded ${bytes} bytes`);
  });
};
