// StreamingComponent.jsx
import React, { useEffect, useRef, useState } from "react";
import axios from "axios";

const StreamingComponent = ({ contentType, id }) => {
  const [magnetLink, setMagnetLink] = useState("");
  const [isMagnetLoading, setIsMagnetLoading] = useState(false);
  const videoRef = useRef(null);

  const fetchMagnetLink = async () => {
    setIsMagnetLoading(true);
    try {
      const magnetRes = await axios.get(
        `/api/v1/torrent/fetch-magnet/${contentType}/${id}`
      );
      const { magnetLink } = magnetRes.data;
      if (magnetLink) {
        setMagnetLink(magnetLink);
      } else {
        console.error("No magnet link found in response.");
      }
    } catch (error) {
      console.error("Error fetching magnet link:", error);
      setMagnetLink(null);
    } finally {
      setIsMagnetLoading(false);
    }
  };

  // useEffect(() => {
  //   fetchMagnetLink();
  // }, [contentType, id]);

  return (
    <div>
      <button
        onClick={fetchMagnetLink}
        className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
        disabled={isMagnetLoading}
      >
        {isMagnetLoading ? "Loading..." : "Watch Movie"}
      </button>
      {magnetLink && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold">Watch Here:</h4>
          <video ref={videoRef} controls className="w-full h-auto rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default StreamingComponent;
