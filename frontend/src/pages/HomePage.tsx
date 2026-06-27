import Header from "../components/Header";
import { useI18n } from "../lib/i18n";
import MediaCard from "../components/MediaCard";
import type { Media, Genre } from "../types/media";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import Footer from "../components/Footer";
import type { RootState } from "../store";
import {
  useGetMediaListQuery,
  useLazySearchMediaQuery,
  useLazyRagMediaQuery,
} from "../store/api/mediaApi";

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
  const [source, setSource] = useState<"RANDOM" | "TRENDING">("TRENDING");
  const [type, setType ] = useState<string | null>(null);
  const { t } = useI18n();
  const [triggerSearch, searchResult] = useLazySearchMediaQuery();
  const [triggerRag] = useLazyRagMediaQuery();
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;
  const { data, isLoading, error } = 
    useGetMediaListQuery({
      source,
      type,
      userId,
    });



  const isDemo = user?.username === "demo";

  // AI 검색 기능
  const [searchQuery, setSearchQuery] = useState("");
  const [isAiMode, setIsAiMode] = useState(false);

  const mediaList = isDemo
    ? mockMediaList
    : searchQuery.trim() && searchResult.data
      ? searchResult.data.slice(0, 10)
      : (data ?? []); // 아직 로딩 중이라 data가 undefined일 때 빈 배열로 막아주기

  // 필터 버튼 공통 스타일 (반복 방지용)
  const filterBtnClass =
    "border rounded-full px-[1.1vw] py-[0.4vw] text-[0.7vw] hover:bg-white/10 transition w-[4.7vw] h-[3vh] whitespace-nowrap flex items-center justify-center font-light";

  // 필터 버튼 클릭 상태 (null = 아무것도 선택 안 됨)


  // 선택된 미디어 상태 (null = 아무것도 선택 안 됨)
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);


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

  const [ragMediaList, setRagMediaList] = useState<Media[]>([]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return; // 빈 검색어면 아무것도 안 함

    if (isAiMode) {
      // AI(RAG) 검색 — 백엔드 머지되면 연결
      const response = await triggerRag(searchQuery).unwrap();
      setRagMediaList(response.media); 
      if (!response.ok) {
        console.error("RAG 검색 실패:", response.statusText);
        return;
      }
      // RAG 검색 결과 처리 (예: mediaList 업데이트)
      console.log("RAG 검색:", searchQuery);
    } else {
      // 일반 검색
      triggerSearch(searchQuery);
    }
  };

  if (!isDemo && isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0c0c0b] text-[1vw] italic text-white/50">
        {t("main.loading")}
      </div>
    );
  }

  if (!isDemo && error) {
    return <div className="...">{t("main.loadError")}</div>;
  }

  return (
    // 전체 페이지: 세로 쌓기 (헤더 -> 검색바 -> 필터 -> 카드 -> 화살표 -> 푸터)
    <div className="flex flex-col min-h-screen bg-[#0c0c0b] text-white overflow-x-hidden">
      <Header />
      {/* 검색바 */}
      <div className="flex justify-center pt-[5vh] pb-[5vh]">
        <div className="flex items-center gap-2 bg-transparent border border-white/30 rounded-full px-[2vw] w-[43vw] h-[4.3vh]">
          <span>🔍</span>
          <button
            onClick={() => setIsAiMode(!isAiMode)}
            className={
              isAiMode
                ? "border border-[#00ffff] text-[#00ffff] rounded-full px-[1vw] text-[0.8vw]"
                : "border border-white/30 text-white rounded-full px-[1vw] text-[0.8vw]"
            }
          >
            AI
          </button>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearch();
            }}
            placeholder={t("main.search")}
            className="bg-transparent outline-none text-white w-full placeholder:text-gray-500 text-[1vw]"
          />
        </div>
      </div>

      {/* 필터 버튼 (MY FAV / RANDOM / FILTER) */}
      <div className="flex gap-[0.8vw] px-[2vw] pb-[2.7vh]">
        <button
          onClick={() => setSource("RANDOM")}
          className={
            source === "RANDOM"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#00ffff] border-[#00ffff] text-[#00ffff]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          {t("main.random")}
        </button>
        <button
          onClick={() => setSource("MY FAV")}
          className={
            source === "MY FAV"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#00ffff] border-[#00ffff] text-[#00ffff]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          {t("main.myFav")}
        </button>
        
        <button
          onClick={() => setType(type === "movie" ? "" : "movie")}
          className={
            type === "movie"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#a855f7] border-[#a855f7] text-[#a855f7]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          {t("main.movie")}
        </button>
                <button
          onClick={() => setType(type === "drama" ? "" : "drama")}
          className={
            type === "drama"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#a855f7] border-[#a855f7] text-[#a855f7]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          {t("main.drama")}
        </button>
                <button
          onClick={() => setType(type === "anime" ? "" : "anime")}
          className={
            type === "anime"
              ? filterBtnClass +
                " shadow-[0_0_28px_1px_#a855f7] border-[#a855f7] text-[#a855f7]"
              : filterBtnClass + " border-white/30 text-white"
          }
        >
          {t("main.anime")}
        </button>
      </div>
      {/* 카드 슬라이드 */}
      {/* relative: 기준점 역할 */}
      {/* selectedMedia가 있을 때는 overflow-visible로 포스터 잘림 방지 */}
      {/* selectedMedia가 없을 때는 overflow-hidden으로 창문 역할 */}
      <div className="w-full overflow-x-auto overflow-y-visible">
        <div className="flex gap-[3.4vw] w-max py-2">
          {mediaList.map((media) => (
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

      {/* footer */}
      <Footer />
    </div>
  );
};

export default HomePage;
