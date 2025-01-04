import React, { useContext, useEffect } from "react";
import axios from "axios";
import SeasonEpisodeContext from "../context/SeasonEpisodeContext"; // Import the context

const SeasonEpisodeSelector = ({ id, contentType }) => {
  // Destructure context values
  const {
    season,
    setSeason,
    episode,
    setEpisode,
    availableSeasons,
    setAvailableSeasons,
    availableEpisodes,
    setAvailableEpisodes,
  } = useContext(SeasonEpisodeContext);

  // useEffect to fetch available seasons for TV shows
  useEffect(() => {
    if (contentType === "tv") {
      const fetchSeasons = async () => {
        try {
          const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
          const numberOfSeasons = res.data.content.number_of_seasons || 1;
          setAvailableSeasons(
            Array.from({ length: numberOfSeasons }, (_, i) => i + 1)
          );
        } catch (error) {
          console.error("Error fetching available seasons:", error);
        }
      };
      fetchSeasons();
    }
  }, [contentType, id, setAvailableSeasons]);

  // useEffect to fetch episodes for the selected season
  useEffect(() => {
    if (contentType === "tv" && season) {
      const fetchEpisodes = async () => {
        try {
          const res = await axios.get(
            `/api/v1/torrent/tv/${id}/season/${season}`
          );
          setAvailableEpisodes(
            Array.from({ length: res.data.episodes.length }, (_, i) => i + 1)
          );
        } catch (error) {
          console.error("Error fetching episodes:", error);
        }
      };
      fetchEpisodes();
    }
  }, [contentType, id, season, setAvailableEpisodes]);

  return (
    <div className="my-4">
      <label htmlFor="season" className="mr-2 font-bold">
        Season:
      </label>
      <select
        id="season"
        value={season}
        onChange={(e) => setSeason(Number(e.target.value))}
        className="bg-gray-800 text-white rounded px-2 py-1 mr-4"
      >
        {availableSeasons.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <label htmlFor="episode" className="mr-2 font-bold">
        Episode:
      </label>
      <select
        id="episode"
        value={episode}
        onChange={(e) => setEpisode(Number(e.target.value))}
        className="bg-gray-800 text-white rounded px-2 py-1"
      >
        {availableEpisodes.map((e) => (
          <option key={e} value={e}>
            {e}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SeasonEpisodeSelector;
