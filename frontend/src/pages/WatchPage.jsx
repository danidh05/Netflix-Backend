import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router";
import { useContentStore } from "../store/content"; // Zustand store for contentType
import axios from "axios";
import Navbar from "../components/Navbar";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ReactPlayer from "react-player";
import { ORIGINAL_IMG_BASE_URL, SMALL_IMG_BASE_URL } from "../utils/constants";
import { Link } from "react-router-dom";
import { formatReleaseDate } from "../utils/dateFunction";
import WatchPageSkeleton from "../components/skeletons/WatchPageSkeleton";

const WatchPage = () => {
  const { id } = useParams(); // Fetch params from the URL
  const [trailers, setTrailers] = useState([]);
  const [currentTrailerIdx, setCurrentTrailerIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState({});
  const [similarContent, setSimilarContent] = useState([]);
  const { contentType } = useContentStore(); // Getting content type (movie/tv show)
  const [magnetLink, setMagnetLink] = useState("");
  const [isMagnetLoading, setIsMagnetLoading] = useState(false);
  const sliderRef = useRef(null);

  const [isStreaming, setIsStreaming] = useState(false); // New state to track streaming status
  const videoRef = useRef(null);

  // Fetch Trailers
  useEffect(() => {
    const getTrailers = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/trailers`);
        setTrailers(res.data.trailers);
      } catch (error) {
        console.error("Error fetching trailers:", error);
        setTrailers([]);
      }
    };
    getTrailers();
  }, [contentType, id]);

  // Fetch Similar Content
  useEffect(() => {
    const getSimilarContent = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/similar`);
        setSimilarContent(res.data.similar);
      } catch (error) {
        setSimilarContent([]);
      }
    };
    getSimilarContent();
  }, [contentType, id]);

  // Fetch Movie or TV Show Details
  useEffect(() => {
    const getContentDetails = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/details`);
        setContent(res.data.content);
      } catch (error) {
        console.error("Error fetching content details:", error);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };
    getContentDetails();
  }, [contentType, id]);

  // Fetch Magnet Link
  const fetchMagnetLink = async () => {
    setIsMagnetLoading(true);
    try {
      console.log("Fetching magnet link...");
      const magnetRes = await axios.get(
        `/api/v1/torrent/fetch-magnet/${contentType}/${id}`
      );
      const { magnetLink } = magnetRes.data;
      if (magnetLink) {
        console.log("Magnet link fetched:", magnetLink);
        const encodedMagnetLink = encodeURIComponent(magnetLink); // Encode the magnet link
        setMagnetLink(encodedMagnetLink); // Set the encoded magnet link

        console.log("Triggering fetchStream with magnet:", magnetLink);
        await fetchStream(magnetLink); // Trigger fetchStream function to get video stream
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

  useEffect(() => {
    if (magnetLink && videoRef.current) {
      fetchStream(magnetLink); // Only call fetchStream if videoRef is ready
    }
  }, [magnetLink, videoRef]);

  // Fetch video stream from the backend
  const fetchStream = async (magnet) => {
    try {
      const encodedMagnet = encodeURIComponent(magnet);
      const streamUrl = `/api/v1/torrent/stream/${encodedMagnet}`;
      console.log("Fetching stream from:", streamUrl);

      if (videoRef.current) {
        videoRef.current.src = streamUrl; // Browser will automatically send the Range header for chunks
        console.log("Stream attached to video element directly.");
      } else {
        console.error("Video element not available.");
      }

      setIsStreaming(true); // Set streaming status to true once video stream is ready
    } catch (error) {
      console.error("Error fetching video stream:", error);
    }
  };

  // Scroll Logic for Trailers
  const handleNext = () => {
    if (currentTrailerIdx < trailers.length - 1)
      setCurrentTrailerIdx(currentTrailerIdx + 1);
  };
  const handlePrev = () => {
    if (currentTrailerIdx > 0) setCurrentTrailerIdx(currentTrailerIdx - 1);
  };

  const scrollLeft = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: -sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };
  const scrollRight = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({
        left: sliderRef.current.offsetWidth,
        behavior: "smooth",
      });
    }
  };

  // Loading State
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
            <h2 className="text-2xl sm:text-5xl font-bold text-balance ">
              Content Not Found
            </h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white">
      <div className="mx-auto container px-4 py-8 h-full">
        <Navbar />

        {trailers.length > 0 && (
          <div className="flex justify-between items-center mb-4">
            <button
              className={`bg-gray-500/70 hover:gray-500 text-white py-2 px-4 rounded ${
                currentTrailerIdx === 0 ? "cursor-not-allowed opacity-50" : ""
              }`}
              disabled={currentTrailerIdx === 0}
              onClick={handlePrev}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              className={`bg-gray-500/70 hover:gray-500 text-white py-2 px-4 rounded ${
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
        )}

        <div className="aspect-video mb-8 p-2 sm:px-10 md:px-32">
          {trailers.length > 0 && (
            <ReactPlayer
              controls={true}
              width={"100%"}
              height={"70vh"}
              className="mx-auto overflow-hidden rounded-lg"
              url={`https://www.youtube.com/watch?v=${trailers[currentTrailerIdx].key}`}
            />
          )}
          {trailers?.length === 0 && (
            <h2 className="text-xl text-center mt-5">
              No trailers available for{" "}
              <span className="font-bold text-red-600">
                {content?.title || content?.name}
              </span>
            </h2>
          )}
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-20 max-w-6xl mx-auto">
          <div className="mb-4 md:mb-0">
            <h2 className="text-5xl font-bold text-balance">
              {content?.title || content?.name}
            </h2>

            <p className="mt-2 text-lg">
              {formatReleaseDate(
                content?.release_date || content?.first_air_date
              )}{" "}
              |{" "}
              {content?.adult ? (
                <span className="text-red-600">18+</span>
              ) : (
                <span className="text-green-600">PG-13</span>
              )}{" "}
            </p>
            <p className="mt-4 text-lg">{content?.overview}</p>

            <button
              onClick={fetchMagnetLink}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
              disabled={isMagnetLoading || isStreaming}
            >
              {isMagnetLoading ? "Loading..." : "Watch Movie"}
            </button>

            {magnetLink && (
              <div className="mt-6">
                <h4 className="text-lg font-semibold">Watch Here:</h4>
                <video
                  ref={videoRef}
                  controls
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
          </div>

          <img
            src={ORIGINAL_IMG_BASE_URL + content?.poster_path}
            alt="Poster Image"
            className="max-h-[600px] rounded-md"
          />
        </div>

        {similarContent.length > 0 && (
          <div className="mt-12 max-w-5xl mx-auto relative">
            <h3 className="text-3xl font-bold mb-4">Similar Movies/TV Show</h3>
            <div
              className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group"
              ref={sliderRef}
            >
              {similarContent.map((content) => {
                if (content.poster_path === null) return null;
                return (
                  <Link
                    key={content.id}
                    to={`/watch/${content.id}`}
                    className="w-52 flex-none"
                  >
                    <img
                      src={SMALL_IMG_BASE_URL + content.poster_path}
                      alt="Poster Path"
                      className="w-full h-auto rounded-md"
                    />
                    <h4 className=" mt-2 text-lg font-semibold">
                      {content.title || content.name}
                    </h4>
                  </Link>
                );
              })}

              <ChevronRight
                className="absolute top-1/2 -translate-y-1/2 right-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full"
                onClick={scrollRight}
              />
              <ChevronLeft
                className="absolute top-1/2 -translate-y-1/2 left-2 w-8 h-8 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer bg-red-600 text-white rounded-full"
                onClick={scrollLeft}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default WatchPage;
