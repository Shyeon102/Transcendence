import MediaCard from "../components/MediaCard";
import type { Media, Genre } from "../types/media";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; //  페이지 이동, URL 관리 등을 도와주는 라이브러리

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
  const filterBtnClass =
    "border border-white/30 rounded-full px-4 py-1 text-white text-sm hover:bg-white/10 transition";
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null); // Media 타입이거나 null (선택 안된 상태)
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-[#0c0c0b] text-white">
      {/* 검색바 영역 */}
      <div className="flex justify-center pt-16 pb-8">
        <div className="flex items-center gap-2 bg-transparent border border-white/30 rounded-full px-6 py-3 w-[600px]">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white w-full placeholder:text-gray-500"
          />
        </div>
      </div>
      {/* 버튼 영역 */}
      <div className="flex gap-2 px-8">
        <button className={filterBtnClass}>MY FAV</button>
        <button className={filterBtnClass}>RANDOM</button>
        <button className={filterBtnClass}>FILTER</button>
      </div>
      {/* 카드 + 정보 패널 영역 */}
      <div className="flex items-center gap-8">
        <MediaCard media={mockMedia} onSelect={setSelectedMedia} />
        {selectedMedia && (
          <div>
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
              <p className="mt-4 text-sm text-gray-300">
                {selectedMedia.story}
              </p>
            </div>
            <div className="flex gap-4 mt-4">
              <span>👁</span>
              <span>🤍</span>
              <span>💔</span>
              <span>✅</span>
            </div>
            <button onClick={() => navigate(`/media/${selectedMedia.id}`)}>
              Go to detail
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
