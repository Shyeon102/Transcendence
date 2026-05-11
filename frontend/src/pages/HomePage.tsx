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
        <div>
          <p>
            {selectedMedia.genre.map((g) => (
              <span key={g.id}>{g.name}</span>
            ))}
          </p>
          <p>{selectedMedia.ageRating}</p>
          <p>{selectedMedia.releaseDate}</p>
          <p>{selectedMedia.country}</p>
          <p>{selectedMedia.language}</p>
          <p>{selectedMedia.cast}</p>
          <p>{selectedMedia.story}</p>
        </div>
      )}
    </div>
  );
};

export default HomePage;
