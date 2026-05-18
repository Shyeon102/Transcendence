import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import type { Media, Genre, Review } from "../types/media";

// 임시 목업 데이터: 현재 백엔드가 없으므로 목업 데이터 임시 선언
// TODO) 추후 백엔드 연동후 useParams()로 받은 id로 API 호출, 그 영화 데이터를 받아오기
const genreCrime: Genre = { id: 1, name: "Crime" };
const genreThriller: Genre = { id: 2, name: "Thriller" };

// review는 목업 데이터 추후 백엔드 연동
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
  reviews: [
    {
      id: 1, //리뷰 자체 고유번호: DB에 저장될 때 순서대로 번호
      userId: 1, //목업이라 그냥 숫자, 추후 유저 정보 필요
      userName: "seong-ki",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
    {
      id: 2,
      userId: 2,
      userName: "jaoh",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
    {
      id: 3,
      userId: 3,
      userName: "thelee42",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
    {
      id: 4,
      userId: 4,
      userName: "llarrey",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
  ],
};

const MediaDetailPage = () => {
  const navigate = useNavigate(); // 미디어 탭 이동
  const { id } = useParams(); // React Router에서  URL 파라미터 읽는 훅. URL: /media/:id

  // TODO) setActive 초기값 : 홈에서 필터 선택하고 들어오면 그 타입이 기본값. 추후 백엔드 연동 후에 URL params에서 읽어와서 초기값 설정하기 : "" 이건 백엔드 연동전 초기값
  const [tab, setActiveTab] = useState(""); // Movie / Series / Animation
  const [icon, setActiveIcon] = useState({
    eye: false,
    like: false,
    dislike: false,
    wish: false,
  });
  const [myRating, setMyRating] = useState(0); // star rating

  return (
    <div>
      {/* 헤더 */}
      <Header />

      {/* 레이아웃: 가로로 3등분 */}
      <div className="flex">
        {/* 미디어 변환 탭: 제일 왼쪽 */}
        <div className="">
          <button onClick={() => setActiveTab("Movie")}>Movie</button>
          <button onClick={() => setActiveTab("Series")}>Series</button>
          <button onClick={() => setActiveTab("Animation")}>Animation</button>
        </div>

        {/* 중간 왼쪽 vhs 포스터 + 별점 레이아웃 */}
        <div>
          {/* vhs 미디어 포스터 */}
          <div className="relative w-[15vw] h-[55vh]">
            {/* 1. vhs 테이프 목업 */}
            <img
              src="/vhs-back.png"
              className="absolute inset-0 w-[90%] h-[90%] object-fill translate-x-[45%] translate-y-[4%]"
            />
            {/* 2. 포스터 (중간) */}
            <img
              src={mockMedia.frontPosterUrl}
              className="absolute inset-0 w-full h-full object-fill brightness-95 contrast-110"
            />
            {/* 3. 낡은 질감 커버 (맨 위) */}
            <img
              src="/vhs-cover-back.png"
              className="absolute inset-0 w-full h-full object-fill"
            />
          </div>

          {/* 별점 */}
          <div>
            {/* 별 아이콘 이미지 */}
            <button onClick={() => setMyRating()}>
              <img src="/star-line" />
            </button>

            <p>MY RATING</p>

            {/* 내 (숫자) 별점 */}
            <div>
              {/* set my rating에 따라 숫자 변경 -> 별 몇개 주느냐에 따라 점수다름 */}
              <p>/10</p>
            </div>

            {/* 내 리뷰 */}
            <button>My review</button>
          </div>
        </div>

        {/* 오른쪽 미디어 정보 레이아웃 */}
        <div>
          {/* 1994 | Crime, Thriller | Quentin Tarantino */}
          <div className="flex text-white ">
            <p>{mockMedia.releaseDate.slice(0, 4)}</p>{" "}
            {/* "1994-10-26" -> "1994" */}
            <p>|</p>
            {/* 각 객체에서 name만 꺼내서 배열을 문자열로 합치기 */}
            <p>{mockMedia.genre.map((g) => g.name).join(",")}</p>
            <p>|</p>
            <p>{mockMedia.director}</p>
          </div>

          {/* 타이틀 */}
          <p className="text-8xl text-white">{mockMedia.title}</p>

          {/* 2h 34m | USA | Cast: John Travolta, Samuel L. Jackson, ... */}
          <div className="flex text-white">
            <p>{mockMedia.runtime}</p>
            <p>|</p>
            <p>{mockMedia.country}</p>
            <p>|</p>
            <p>Cast: </p>
            <p>{mockMedia.cast.join(", ")}</p>
          </div>

          {/* story */}
          <div className="flex">
            <p className="text-2xl">The Story</p>
            <p>{mockMedia.story}</p>
          </div>

          {/* 아이콘 인터렉션 */}
          <div className="flex">
            <button onClick={() => setActiveIcon({ ...icon, eye: !icon.eye })}>
              {/* 이미지 교체 (삼항연산자): 조건 ? 참일 때 : 거짓일 때 */}
              <img src={icon.eye ? "/view.png" : "/non-view.png"} />
            </button>
            <button
              onClick={() => setActiveIcon({ ...icon, like: !icon.like })}
            >
              <img src={icon.like ? "/like.png" : "/non-like.png"} />
            </button>
            <button
              onClick={() => setActiveIcon({ ...icon, dislike: !icon.dislike })}
            >
              <img src={icon.dislike ? "/dislike.png" : "/non-dislike.png"} />
            </button>
            <button
              onClick={() => setActiveIcon({ ...icon, wish: !icon.wish })}
            >
              <img src={icon.wish ? "/wish.png" : "/non-wish.png"} />
            </button>
          </div>

          {/* 오른쪽: 리뷰 섹션: Reviews 제목 + 리뷰 목록 (가로정렬) */}
          <div className="flex">
            <p className="text-2xl">Reviews</p>

            {/* 유저 리스트 div */}
            <div className="flex flex-col">
              {/* 세로정렬: 각 리뷰 한개 (visibility 때문에) */}
              {mockMedia.reviews.map((review) => (
                <div key={review.id} className="flex flex-col">
                  {/* 위: visibility 뱃지 */}
                  <p className="border border-white px-2 py-1 text-xs">
                    {review.visibility}
                  </p>

                  {/* 아래: 가로 나열 */}
                  {/* 이 div가 리뷰 하나의 덩어리: reviews[0] 같이 인덱스로 구분 */}
                  <div className="flex gap-4">
                    <p>{review.userName}</p>
                    <p>{review.content}</p>

                    {/* 별 rating + 숫자 rating */}
                    <div className="flex">
                      {/* Array(5): 길이가 5인 빈 배열 만들기 */}
                      {/* .map((값, 인덱스) => ...) // _ = 값 (안씀 표시 관례), i = 인덱스: 값은 필요없고 인덱스만 필요 */}
                      {/* key={i}: 여러개의 map으로 별 개수 만듬(key 필요): 고유 id가 없어서 index i 사용 */}
                      {[...Array(review.rating)].map((_, i) => (
                        <img key={i} src="/star-full.png" className="w-4 h-4" />
                      ))}
                      {/* 숫자 rating */}
                      <p>{review.rating}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 */}
      <Footer />
    </div>
  );
};

export default MediaDetailPage;
