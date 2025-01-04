import React, { useEffect, useState } from "react";
import ReactPlayer from "react-player";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

const TrailerSection = ({ id, contentType }) => {
  const [trailers, setTrailers] = useState([]);
  const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);

  // useEffect to fetch trailers
  useEffect(() => {
    const fetchTrailers = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/trailers`);
        setTrailers(res.data.trailers || []);
      } catch (error) {
        console.error("Error fetching trailers:", error);
      }
    };

    if (id && contentType) {
      fetchTrailers();
    }
  }, [id, contentType]);

  const handleNext = () => {
    if (currentTrailerIdx < trailers.length - 1) {
      setCurrentTrailerIdx(currentTrailerIdx + 1);
    }
  };

  const handlePrev = () => {
    if (currentTrailerIdx > 0) {
      setCurrentTrailerIdx(currentTrailerIdx - 1);
    }
  };

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <button
          className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
            currentTrailerIdx === 0 ? "cursor-not-allowed opacity-50" : ""
          }`}
          disabled={currentTrailerIdx === 0}
          onClick={handlePrev}
        >
          <ChevronLeft size={24} />
        </button>
        <button
          className={`bg-gray-500/70 hover:bg-gray-500 text-white py-2 px-4 rounded ${
            currentTrailerIdx === trailers.length - 1
              ? "cursor-not-allowed opacity-50"
              : ""
          }`}
          disabled={currentTrailerIdx === trailers.length - 1}
          onClick={handleNext}
        >
          <ChevronRight size={24} />
        </button>
      </div>
      <div className="aspect-video p-2 sm:px-10 md:px-32">
        {trailers.length > 0 ? (
          <ReactPlayer
            controls={true}
            width={"100%"}
            height={"70vh"}
            className="mx-auto overflow-hidden rounded-lg"
            url={`https://www.youtube.com/watch?v=${trailers[currentTrailerIdx].key}`}
          />
        ) : (
          <h2 className="text-xl text-center mt-5">
            No trailers available for this content.
          </h2>
        )}
      </div>
    </div>
  );
};

export default TrailerSection;
