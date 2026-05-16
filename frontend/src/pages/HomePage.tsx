import MediaCard from "../components/MediaCard";
import type { Media, Genre } from "../types/media";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

// 목업 데이터
const genreCrime: Genre = { id: 1, name: "Crime" };
const genreThriller: Genre = { id: 2, name: "Thriller" };

// 기준이 되는 목업 미디어 1개 (임시 더미, 추후 백엔드 api 받아서 변경)
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
  frontPosterUrl: "/pulp-fiction.jpg",
  sidePosterUrl: "/pulp-fiction-side.png",
};

// mockMedia를 기반으로 id/title/poster만 바꿔서 15개 생성
const mockMediaList: Media[] = [
  mockMedia,
  {
    ...mockMedia,
    id: 2,
    title: "A Clockwork Orange",
    frontPosterUrl: "/jocker.jpg",
    sidePosterUrl: "/orange-side.png",
  },
  {
    ...mockMedia,
    id: 3,
    title: "Past Lives",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/past-side.png",
  },
  {
    ...mockMedia,
    id: 4,
    title: "Dune",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/zone-side.png",
  },
  {
    ...mockMedia,
    id: 5,
    title: "Barbie",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/barbie-side.png",
  },
  {
    ...mockMedia,
    id: 6,
    title: "Pulp Fiction",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/pulp-fiction-side.png",
  },
  {
    ...mockMedia,
    id: 7,
    title: "Poor Things",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/poor-side.png",
  },
  {
    ...mockMedia,
    id: 8,
    title: "Joker",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/joker-side.png",
  },
  {
    ...mockMedia,
    id: 9,
    title: "It",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/it-side.png",
  },
  {
    ...mockMedia,
    id: 10,
    title: "Dune Part Two",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/dune-side.png",
  },
  {
    ...mockMedia,
    id: 11,
    title: "Scream",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/scream-side.png",
  },
  {
    ...mockMedia,
    id: 12,
    title: "Deadpool",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/deadpool-side.png",
  },
  {
    ...mockMedia,
    id: 13,
    title: "Academy",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/academy-side.png",
  },
  {
    ...mockMedia,
    id: 14,
    title: "Back to the Future 3",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/back-side.png",
  },
  {
    ...mockMedia,
    id: 15,
    title: "Kill Bill",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/killbill-side.png",
  },
];

// 컴포넌트

const HomePage = () => {
  // 필터 버튼 공통 스타일 (반복 방지용 변수)
  const filterBtnClass =
    "border rounded-full px-[1.1vw] py-[0.4vw] text-[0.7vw] hover:bg-white/10 transition w-[4.7vw] h-[3vh] whitespace-nowrap flex items-center justify-center font-light";

  // 필터 버튼 클릭시 효과
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // 선택된 미디어 상태 (null = 아무것도 선택 안 됨)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // 슬라이드 시작 인덱스 (어떤 카드부터 보여줄지)
  const [currentIndex, setCurrentIndex] = useState(0);

  // 페이지 이동 함수 (React Router)
  const navigate = useNavigate();

  // 왼쪽 화살표: 첫 번째 카드일 때는 이동 안 함, 15는 한 페이지당 보이는 vhs 개수
  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 15);
  };

  // 오른쪽 화살표: 마지막 카드일 때는 이동 안 함
  const handleNext = () => {
    if (currentIndex < mockMediaList.length - 1)
      setCurrentIndex((prev) => prev + 15);
  };

  return (
    // 전체 페이지: 세로 쌓기 (검색바 -> 필터 -> 카드 -> 화살표)
    // overflow-x-hidden: 가로 삐져나오는 건 잘라내되 세로 스크롤은 유지
    <div className="flex flex-col min-h-screen bg-[#0c0c0b] text-white overflow-x-hidden">
      <Header />
      {/* ── 검색바 ── */}
      <div className="flex justify-center pt-[5vh] pb-[5vh]">
        <div className="flex items-center gap-2 bg-transparent border border-white/30 rounded-full px-[2vw] w-[43vw] h-[4.3vh]">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none text-white w-full placeholder:text-gray-500 text-[1vw]"
          />
        </div>
      </div>

      {/* 필터 버튼 (MY FAV / RANDOM / FILTER) */}
      <div className="flex gap-[0.8vw] px-[2vw] pb-[2.7vh]">
        <button
          onClick={() => setActiveFilter("MY FAV")}
          className={
            activeFilter === "MY FAV"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#00ffff] border-[#00ffff] text-[#00ffff]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          MY FAV
        </button>
        <button
          onClick={() => setActiveFilter("RANDOM")}
          className={
            activeFilter === "RANDOM"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#00ffff] border-[#00ffff] text-[#00ffff]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          RANDOM
        </button>
        <button
          onClick={() => setActiveFilter("FILTER")}
          className={
            activeFilter === "FILTER"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#00ffff] border-[#00ffff] text-[#00ffff]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          FILTER
        </button>
      </div>

      {/* ── 카드 슬라이드 + 정보 패널 ── */}
      {/* items-start: 카드와 정보 패널이 위쪽 기준으로 정렬 */}
      <div className="flex items-start gap-[2vw] w-full">
        {/* 카드 슬라이드 영역 */}
        <div className="flex gap-[2vw] w-full overflow-hidden justify-center"> {/* overflow-hidden: 창문 (보이는 역할) */}
          <div className="flex gap-[3.4vw]" style={{transform: `translateX(-${currentIndex * 5.97}vw)`, transition: "transform 0.3s ease"}}> {/* 카드 전체 (밀리는 것): 기차같은 역할 */}
            {mockMediaList.map((media) => (
              <MediaCard
                key={media.id}
                media={media}
                onSelect={setSelectedMedia}
                isSelected={selectedMedia?.id === media.id}
              />
            ))}
          </div>
        </div>

        {/* 정보 패널: 카드 클릭 시에만 표시 (selectedMedia가 null이 아닐 때) */}
        {selectedMedia && (
          <div className="text-white min-w-[20.8vw]">
            {/* 장르 + 연령등급 태그 */}
            <div className="flex gap-[0.8vw] mb-[2vh]">
              <span className="px-[0.8vw] py-[0.4vh] bg-gray-600 text-white rounded-full text-[0.9vw]">
                {selectedMedia.genre.map((g) => g.name).join("/")}
              </span>
              <span className="px-[0.8vw] py-[0.4vh] bg-gray-600 text-white rounded-full text-[0.9vw]">
                {selectedMedia.ageRating}
              </span>
            </div>

            {/* 미디어 상세 정보 */}
            <div className="flex flex-col gap-[1vh]">
              <div className="flex gap-[1.5vw]">
                <span className="font-bold w-[7vw] text-[0.9vw]">
                  Release Date
                </span>
                <span className="text-[0.9vw]">
                  {selectedMedia.releaseDate}
                </span>
              </div>
              <div className="flex gap-[1.5vw]">
                <span className="font-bold w-[7vw] text-[0.9vw]">Country</span>
                <span className="text-[0.9vw]">{selectedMedia.country}</span>
              </div>
              <div className="flex gap-[1.5vw]">
                <span className="font-bold w-[7vw] text-[0.9vw]">Language</span>
                <span className="text-[0.9vw]">{selectedMedia.language}</span>
              </div>
              <div className="flex gap-[1.5vw]">
                <span className="font-bold w-[7vw] text-[0.9vw]">Cast</span>
                <span className="text-[0.9vw]">
                  {selectedMedia.cast.join(", ")}
                </span>
              </div>
            </div>

            {/* 줄거리 */}
            <p className="mt-[2vh] text-[0.9vw] text-gray-300">
              {selectedMedia.story}
            </p>

            {/* 인터랙션 아이콘 (봤어요 / 좋아요 / 싫어요 / 위시) */}
            <div className="flex gap-[1.5vw] mt-[2vh]">
              <span>👁</span>
              <span>🤍</span>
              <span>💔</span>
              <span>✅</span>
            </div>

            {/* 상세 페이지 이동 버튼 */}
            <button
              onClick={() => navigate(`/media/${selectedMedia.id}`)}
              className="mt-[2vh] px-[1.5vw] py-[1vh] bg-teal-600 text-white rounded text-[0.9vw]"
            >
              Go to detail
            </button>
          </div>
        )}
      </div>

      {/* ── 화살표 영역: 카드 슬라이드 아래, 항상 표시 ── */}
      {/* justify-between: 좌우 끝에 배치 */}
      <div className="flex justify-between px-[1vw] pt-[0.5vh]">
        {/* 왼쪽 화살표: 첫 번째면 흐리게 */}
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="text-white text-[1.7vw] px-[0.5vw] disabled:opacity-30 transition"
        >
          «
        </button>
        {/* 오른쪽 화살표: 마지막이면 흐리게 */}
        <button
          onClick={handleNext}
          disabled={currentIndex === mockMediaList.length - 1}
          className="text-white text-[1.7vw] px-[0.5vw] disabled:opacity-30 transition"
        >
          »
        </button>
      </div>
       <Footer />
    </div>
  );
};

export default HomePage;
