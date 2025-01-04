import React, { useEffect, useState, useRef } from "react";

import { useParams } from "react-router";
import { useContentStore } from "../../store/content";
import Navbar from "../../components/Navbar";
import TrailerSection from "./components/TrailerSection";
import ContentDetails from "./components/ContentDetails";
import SeasonEpisodeSelector from "./components/SeasonEpisodeSelector";
import StreamingButton from "./components/StreamingButton";
import SimilarContent from "./components/SimilarContent";
import VideoPlayer from "./components/VideoPlayer";
import { SeasonEpisodeProvider } from "./context/SeasonEpisodeContext"; // Import the context provider

const WatchPage = () => {
  const { id } = useParams();
  const { contentType } = useContentStore();

  return (
    <SeasonEpisodeProvider id={id} contentType={contentType}>
      <div className="bg-black min-h-screen text-white">
        <Navbar />
        <div className="container mx-auto px-4 py-8">
          <TrailerSection id={id} contentType={contentType} />
          <div className="flex flex-col md:flex-row gap-8">
            <ContentDetails id={id} contentType={contentType} />
          </div>
          {contentType === "tv" && (
            <div className="mt-2">
              {" "}
              {/* Adjust this margin as needed */}
              <SeasonEpisodeSelector id={id} contentType={contentType} />
            </div>
          )}

          <VideoPlayer contentType={contentType} />

          <SimilarContent id={id} contentType={contentType} />
        </div>
      </div>
    </SeasonEpisodeProvider>
  );
};

export default WatchPage;
