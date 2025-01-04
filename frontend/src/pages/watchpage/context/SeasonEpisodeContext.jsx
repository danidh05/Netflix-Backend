import React, { createContext, useState } from "react";

// Create the context
const SeasonEpisodeContext = createContext();

// Create the provider component
export const SeasonEpisodeProvider = ({ children }) => {
  const [season, setSeason] = useState(1);
  const [episode, setEpisode] = useState(1);
  const [availableSeasons, setAvailableSeasons] = useState([]);
  const [availableEpisodes, setAvailableEpisodes] = useState([]);
  const [magnetLink, setMagnetLink] = useState("");
  const [isMagnetLoading, setIsMagnetLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false); // New state for tracking streaming status

  return (
    <SeasonEpisodeContext.Provider
      value={{
        season,
        setSeason,
        episode,
        setEpisode,
        availableSeasons,
        setAvailableSeasons,
        availableEpisodes,
        setAvailableEpisodes,
        magnetLink,
        setMagnetLink,
        isMagnetLoading,
        setIsMagnetLoading,
        isStreaming, // Provide `isStreaming` to the context consumers
        setIsStreaming, // Provide `setIsStreaming` to the context consumers
      }}
    >
      {children}
    </SeasonEpisodeContext.Provider>
  );
};

export default SeasonEpisodeContext;
