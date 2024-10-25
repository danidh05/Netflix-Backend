import axios from "axios";
import WebTorrent from "webtorrent";
import { ENV_VARS } from "../config/envVars.js";

export const fetchMagnetLink = async (req, res) => {
  const { contentType, id } = req.params;

  try {
    // First, fetch the IMDb ID from TMDb API
    console.log("Fetching IMDb ID from TMDb...");
    const tmdbResponse = await axios.get(
      `https://api.themoviedb.org/3/${contentType}/${id}`,
      {
        params: { api_key: ENV_VARS.TMDB_API_KEY2 },
      }
    );
    const imdbId = tmdbResponse.data.imdb_id;

    console.log("TMDb Response:", tmdbResponse.data); // Log the TMDb response

    if (!imdbId) {
      console.error("IMDb ID not found in TMDb response");
      return res
        .status(404)
        .json({ success: false, message: "IMDb ID not found" });
    }

    // Fetch magnet link from RapidAPI
    console.log("Fetching magnet link from RapidAPI...");
    const options = {
      method: "GET",
      url: `https://movie_torrent_api1.p.rapidapi.com/search/${imdbId}`,
      headers: {
        "X-RapidAPI-Key": ENV_VARS.RAPIDAPI_KEY,
        "X-RapidAPI-Host": "movie_torrent_api1.p.rapidapi.com",
      },
    };

    const response = await axios.request(options);
    console.log("RapidAPI Response:", response.data); // Log the RapidAPI response

    const magnetLink = response.data?.data?.[0]?.magnet;

    if (magnetLink) {
      console.log("Magnet link found:", magnetLink); // Log the magnet link
      res.json({ success: true, magnetLink: magnetLink });
    } else {
      console.error("No magnet link found in RapidAPI response");
      res
        .status(404)
        .json({ success: false, message: "Magnet link not found" });
    }
  } catch (error) {
    console.error("Error fetching magnet link:", error.message); // Log the error
    res.status(500).json({ success: false, message: error.message });
  }
};

export const streamMovie = (req, res) => {
  const magnet = decodeURIComponent(req.params.magnet); // Decode the magnet link
  const client = new WebTorrent();

  console.log("Adding magnet link to WebTorrent client...", magnet); // Log the magnet link

  client.add(magnet, (torrent) => {
    console.log("Torrent files available:", torrent.files); // Log the available torrent files

    // Find the first .mp4 or .mkv file in the torrent
    const file = torrent.files.find(
      (file) => file.name.endsWith(".mp4") || file.name.endsWith(".mkv")
    );

    if (file) {
      const range = req.headers.range;

      if (!range) {
        console.log("No Range header provided");
        res.status(400).send("Requires Range header");
        return;
      }

      console.log("Range header received:", range);

      // Parse Range Header
      const positions = range.replace(/bytes=/, "").split("-");
      const start = parseInt(positions[0], 10);
      const fileSize = file.length;
      const end = positions[1] ? parseInt(positions[1], 10) : fileSize - 1;

      const chunkSize = end - start + 1;
      console.log(`Streaming video chunk ${start}-${end} of ${fileSize}`);

      res.setHeader("Content-Range", `bytes ${start}-${end}/${fileSize}`);
      res.setHeader("Accept-Ranges", "bytes");
      res.setHeader("Content-Length", chunkSize);
      res.setHeader("Content-Type", "video/mp4");
      res.status(206); // HTTP status for partial content

      // Stream the chunked video data
      const stream = file.createReadStream({ start, end });
      stream.pipe(res);

      stream.on("end", () => {
        console.log("Streaming finished, destroying WebTorrent client.");
        client.destroy();
      });

      stream.on("error", (err) => {
        console.error("Stream error:", err.message);
        if (!res.headersSent) {
          res.status(500).json({ success: false, message: err.message });
        }
        client.destroy(); // Ensure WebTorrent client is destroyed on error
      });
    } else {
      console.error("No .mp4 or .mkv file found in torrent.");
      if (!res.headersSent) {
        res
          .status(404)
          .json({ success: false, message: "Video file not found" });
      }
    }
  });

  client.on("error", (err) => {
    console.error("WebTorrent client error:", err.message); // Log errors
    if (!res.headersSent) {
      res.status(500).json({ success: false, message: err.message });
    }
  });
};
