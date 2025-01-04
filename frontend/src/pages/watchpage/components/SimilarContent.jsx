import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { SMALL_IMG_BASE_URL } from "../../../utils/constants";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Ensure you have this import for the icons

const SimilarContent = ({ id, contentType }) => {
  const [similarContent, setSimilarContent] = useState([]);
  const sliderRef = useRef(null); // Ref for the scrollable container

  // useEffect to fetch similar content
  useEffect(() => {
    const fetchSimilarContent = async () => {
      try {
        const res = await axios.get(`/api/v1/${contentType}/${id}/similar`);
        setSimilarContent(res.data.similar);
      } catch (error) {
        console.error("Error fetching similar content:", error);
      }
    };

    if (id && contentType) {
      fetchSimilarContent();
    }
  }, [id, contentType]);

  // Scroll functions
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

  return (
    <div className="mt-12 max-w-5xl mx-auto relative">
      <h3 className="text-3xl font-bold mb-4">Similar Movies/TV Show</h3>
      <div
        className="flex overflow-x-scroll scrollbar-hide gap-4 pb-4 group"
        ref={sliderRef}
      >
        {similarContent.map((item) =>
          item.poster_path ? (
            <Link
              key={item.id}
              to={`/watch/${item.id}`}
              className="w-52 flex-none"
            >
              <img
                src={SMALL_IMG_BASE_URL + item.poster_path}
                alt="Poster"
                className="w-full h-auto rounded-md"
              />
              <h4 className="mt-2 text-lg font-semibold">
                {item.title || item.name}
              </h4>
            </Link>
          ) : null
        )}

        {/* Scroll Buttons */}
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
  );
};

export default SimilarContent;
