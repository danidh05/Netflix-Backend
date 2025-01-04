import React, { useRef, useEffect, useContext } from "react";
import SeasonEpisodeContext from "../context/SeasonEpisodeContext";

const VideoPlayer = ({ contentType }) => {
  const videoRef = useRef(null);
  const { magnetLink, isStreaming, setIsStreaming } =
    useContext(SeasonEpisodeContext);

  // Function to fetch the video stream from the backend
  const fetchStream = async (link) => {
    try {
      const encodedMagnetLink = encodeURIComponent(link);
      // Use different routes for movie and TV show
      const streamUrl =
        contentType === "movie"
          ? `/api/v1/torrent/movie/stream/${encodedMagnetLink}`
          : `/api/v1/torrent/tv/stream/${encodedMagnetLink}`;

      console.log("Fetching stream from:", streamUrl);

      if (videoRef.current) {
        videoRef.current.src = streamUrl; // Set the video element's source to the stream URL
        videoRef.current.load(); // Ensure the video element loads the new source
        setIsStreaming(true);
        console.log("Stream attached to video element directly.");
      } else {
        console.error("Video element not available.");
      }
    } catch (error) {
      console.error("Error fetching video stream:", error);
    }
  };

  // useEffect to call `fetchStream` whenever `magnetLink` changes
  useEffect(() => {
    if (magnetLink && !isStreaming && videoRef.current) {
      console.log("Magnet link found, fetching stream...");
      fetchStream(magnetLink);
    }
  }, [magnetLink, isStreaming, contentType]); // Added `contentType` as a dependency

  return (
    <div className="mt-8">
      {magnetLink ? (
        <video ref={videoRef} controls className="w-full rounded-lg"></video>
      ) : (
        <></>
      )}
    </div>
  );
};

export default VideoPlayer;
