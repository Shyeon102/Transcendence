import MediaCard from "../components/MediaCard";
import type { Media, Genre } from "../types/media";
import { useState } from "react";

const genreCrime: Genre = {
  id: 1,
  name: "Crime",
};

const genreThriller: Genre = {
  id: 2,
  name: "Thriller",
};

const mockMedia: Media = {
  id: 1,
  title: "Pulp Fiction",
  director: "Quentin Tarantino",
  genre: [genreCrime, genreThriller],
  releaseDate: "1994-10-26",
  country: "USA",
  language: "English",
  cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "..."],
  story:
    "The bloody and ridiculous journey of petty thieves roaming the Hollywood jungle unfolds as three intertwined stories. At a restaurant, a young robbery couple, Pumpkin and Yolanda, discuss the dangers of their profession",
  ageRating: "PG-15",
  starRating: 5,
  runtime: "2h 34m",
  type: "Movie",
  posterUrl: "/pulp-fiction.jpg",
};

const HomePage = () => {
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null); // Media 타입이거나 null (선택 안된 상태)
  return (
    <div className="flex items-center gap-8">
      <MediaCard media={mockMedia} onSelect={setSelectedMedia} />
      {selectedMedia && (
        <div className="bg-[#1a1a1a] p-6 text-white">
          <div className="flex gap-2">
            <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
              {selectedMedia.genre.map((g) => g.name).join("/")}
            </span>
            <span className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm">
              {selectedMedia.ageRating}
            </span>
          </div>
          <div className="flex flex-col gap-2 mt-4">
            <div className="flex gap-4">
              <span className="font-bold w-28">Release Date</span>
              <span>{selectedMedia.releaseDate}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold w-28">Country</span>
              <span>{selectedMedia.country}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold w-28">Language</span>
              <span>{selectedMedia.language}</span>
            </div>
            <div className="flex gap-4">
              <span className="font-bold w-28">Cast</span>
              <span>{selectedMedia.cast.join(", ")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
