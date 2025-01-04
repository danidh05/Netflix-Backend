import React, { useContext } from "react";
import axios from "axios";
import SeasonEpisodeContext from "../context/SeasonEpisodeContext";

const StreamingButton = ({ contentType, id }) => {
  // Use context to get the state and functions
  const {
    season,
    episode,
    setMagnetLink,
    setIsMagnetLoading,
    isMagnetLoading,
    magnetLink,
  } = useContext(SeasonEpisodeContext);
  const fetchMagnetLink = async () => {
    setIsMagnetLoading(true);
    try {
      const url =
        contentType === "movie"
          ? `/api/v1/torrent/movie/fetch-magnet/${id}`
          : `/api/v1/torrent/tv/${id}/season/${season}/episode/${episode}`;
      const magnetRes = await axios.get(url);
      setMagnetLink(magnetRes.data.magnetLink);
    } catch (error) {
      console.error("Error fetching magnet link:", error);
    } finally {
      setIsMagnetLoading(false);
    }
  };

  return (
    <button
      onClick={fetchMagnetLink}
      disabled={isMagnetLoading || magnetLink}
      className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
    >
      {isMagnetLoading
        ? "Loading..."
        : contentType === "movie"
        ? "Watch Movie"
        : "Watch Episode"}
    </button>
  );
};

export default StreamingButton;
