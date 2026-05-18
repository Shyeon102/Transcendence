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
  reviews: [], // 리뷰가 화면에 표시되진 않으니까 그냥 빈 배열
};

// mockMedia를 기반으로 id/title/poster만 바꿔서 15개 생성
const mockMediaList: Media[] = [
  mockMedia,
  {
    ...mockMedia,
    id: 2,
    title: "A Clockwork Orange",
    frontPosterUrl: "/orange.jpg",
    sidePosterUrl: "/orange-side.png",
  },
  {
    ...mockMedia,
    id: 3,
    title: "Past Lives",
    frontPosterUrl: "/past.jpg",
    sidePosterUrl: "/past-side.png",
  },
  {
    ...mockMedia,
    id: 4,
    title: "Zone",
    frontPosterUrl: "/zone.jpg",
    sidePosterUrl: "/zone-side.png",
  },
  {
    ...mockMedia,
    id: 5,
    title: "Barbie",
    frontPosterUrl: "/barbie.jpg",
    sidePosterUrl: "/barbie-side.png",
  },
  {
    ...mockMedia,
    id: 6,
    title: "Pulp Fiction",
    frontPosterUrl: "/pulp-fiction.jpg",
    sidePosterUrl: "/pulp-fiction-side.png",
  },
  {
    ...mockMedia,
    id: 7,
    title: "Poor Things",
    frontPosterUrl: "/poor.jpg",
    sidePosterUrl: "/poor-side.png",
  },
  {
    ...mockMedia,
    id: 8,
    title: "Joker",
    frontPosterUrl: "/joker.jpg",
    sidePosterUrl: "/joker-side.png",
  },
  {
    ...mockMedia,
    id: 9,
    title: "It",
    frontPosterUrl: "/it.jpg",
    sidePosterUrl: "/it-side.png",
  },
  {
    ...mockMedia,
    id: 10,
    title: "Dune",
    frontPosterUrl: "/dune.jpg",
    sidePosterUrl: "/dune-side.png",
  },
  {
    ...mockMedia,
    id: 11,
    title: "Scream",
    frontPosterUrl: "/scream.jpg",
    sidePosterUrl: "/scream-side.png",
  },
  {
    ...mockMedia,
    id: 12,
    title: "Deadpool",
    frontPosterUrl: "/dead-pool.jpg",
    sidePosterUrl: "/deadpool-side.png",
  },
  {
    ...mockMedia,
    id: 13,
    title: "Academy",
    frontPosterUrl: "/shining.jpg",
    sidePosterUrl: "/academy-side.png",
  },
  {
    ...mockMedia,
    id: 14,
    title: "Back to the Future",
    frontPosterUrl: "/back.jpg",
    sidePosterUrl: "/back-side.png",
  },
  {
    ...mockMedia,
    id: 15,
    title: "Kill Bill",
    frontPosterUrl: "/kill-bill.jpg",
    sidePosterUrl: "/killbill-side.png",
  },
];

// 컴포넌트

const HomePage = () => {
  // 필터 버튼 공통 스타일 (반복 방지용)
  const filterBtnClass =
    "border rounded-full px-[1.1vw] py-[0.4vw] text-[0.7vw] hover:bg-white/10 transition w-[4.7vw] h-[3vh] whitespace-nowrap flex items-center justify-center font-light";

  // 필터 버튼 클릭 상태 (null = 아무것도 선택 안 됨)
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  // 선택된 미디어 상태 (null = 아무것도 선택 안 됨)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);

  // 슬라이드 시작 인덱스 (어떤 카드부터 보여줄지)
  const [currentIndex, setCurrentIndex] = useState(0);

  // 페이지 이동 함수 (React Router)
  const navigate = useNavigate();

  // 미디어 클릭시 정보 표시 함수
  // 같은 카드 다시 클릭 -> null (닫기), 새 카드 클릭 -> 선택
  const handleSelect = (media: Media) => {
    if (selectedMedia?.id === media.id) {
      setSelectedMedia(null);
    } else {
      setSelectedMedia(media);
    }
  };

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
    // 전체 페이지: 세로 쌓기 (헤더 -> 검색바 -> 필터 -> 카드 -> 화살표 -> 푸터)
    <div className="flex flex-col min-h-screen bg-[#0c0c0b] text-white overflow-x-hidden">
      {/* 헤더 */}
      <Header />

      {/* 검색바 */}
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

      {/* 카드 슬라이드 */}
      {/* relative: 기준점 역할 */}
      {/* selectedMedia가 있을 때는 overflow-visible로 포스터 잘림 방지 */}
      {/* selectedMedia가 없을 때는 overflow-hidden으로 창문 역할 */}
      <div
        className={`relative w-full ${selectedMedia ? "overflow-visible" : "overflow-hidden"}`}
      >
        {/* 기차 div: 카드 전체가 담겨있고 translateX로 좌우 이동 */}
        <div
          className="flex gap-[3.4vw]"
          style={{
            transform: `translateX(-${currentIndex * 5.97}vw)`,
            transition: "transform 0.3s ease",
          }}
        >
          {mockMediaList.map((media) => (
            <MediaCard
              key={media.id}
              media={media}
              onSelect={handleSelect}
              isSelected={selectedMedia?.id === media.id}
              onDetailClick={(id) => navigate(`/media/${id}`)}
            />
          ))}
        </div>
      </div>

      {/* 화살표 영역 */}
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

      {/* footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
