import React, { useEffect, useState } from "react";
import axios from "axios"; // Import axios for making HTTP requests
import { formatReleaseDate } from "../../../utils/dateFunction";
import WatchPageSkeleton from "../../../components/skeletons/WatchPageSkeleton";
import { ORIGINAL_IMG_BASE_URL } from "../../../utils/constants";
import Navbar from "../../../components/Navbar";
import StreamingButton from "./StreamingButton"; // Import the StreamingButton

const ContentDetails = ({ id, contentType }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [availableSeasons, setAvailableSeasons] = useState([]);

  // useEffect to fetch content details
  useEffect(() => {
    const fetchContentDetails = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
        setContent(res.data.content);
        setAvailableSeasons(
          Array.from(
            { length: res.data.content.number_of_seasons || 1 },
            (_, i) => i + 1
          )
        );
      } catch (error) {
        console.error("Error fetching content details:", error);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    if (id && contentType) {
      fetchContentDetails();
    }
  }, [id, contentType]);

  if (loading)
    return (
      <div className="min-h-screen bg-black p-10">
        <WatchPageSkeleton />
      </div>
    );

  // Content Not Found State
  if (content === null) {
    return (
      <div className="bg-black text-white h-screen">
        <div className="max-w-6xl mx-auto">
          <Navbar />
          <div className="text-center mx-auto px-4 py-8 h-full mt-40">
            <h2 className="text-2xl sm:text-5xl font-bold text-balance">
              Content Not Found
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8 mb-4 md:mb-0">
      <div className="flex-1">
        <h2 className="text-5xl font-bold text-balance">
          {content?.title || content?.name}
        </h2>
        <p className="mt-2 text-lg">
          {formatReleaseDate(content?.release_date || content?.first_air_date)}{" "}
          |{" "}
          {content?.adult ? (
            <span className="text-red-600">18+</span>
          ) : (
            <span className="text-green-600">PG-13</span>
          )}
        </p>
        <p className="mt-4 text-lg">{content?.overview}</p>
        {/* Add the StreamingButton directly below the content details */}
        <div className="mt-6">
          <StreamingButton contentType={contentType} id={id} />
        </div>
      </div>
      {content?.poster_path && (
        <div>
          <img
            src={ORIGINAL_IMG_BASE_URL + content.poster_path}
            alt="Poster Image"
            className="max-h-[600px] rounded-md"
          />
        </div>
      )}
    </div>
  );
};

export default ContentDetails;
