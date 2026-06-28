/* eslint-disable */
import { useI18n } from "../lib/i18n";
import { useCreateMediaReviewMutation, useGetMediaReviewsQuery, useUpdateMediaReviewMutation } from "../store/api/authApi";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useGetMediaDetailQuery } from "../store/api/mediaApi";
import { useGetMediaInteractionsQuery, useToggleMediaInteractionMutation, useDeleteMediaReviewMutation } from "../store/api/authApi";
import { useSelector } from "react-redux";
import type { Media, Genre } from "../types/media";
import type { RootState } from "../store";
import defaultPoster from '/src/assets/images/defaultposter.png';
import type { MediaReview } from "../types";
import { useNavigate } from "react-router-dom";

// 임시 목업 데이터: 현재 백엔드가 없으므로 목업 데이터 임시 선언
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
      username: "seong-ki",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
    {
      id: 2,
      userId: 2,
      username: "jaoh",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
    {
      id: 3,
      userId: 3,
      username: "thelee42",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
    {
      id: 4,
      userId: 4,
      username: "llarrey",
      content: "good blah blah",
      rating: 5,
      visibility: "public",
      createdAt: "2026-05-18",
      updatedAt: "2026-05-18",
    },
  ],
};

const MediaDetailPage = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const { id } = useParams();
  const mediaId = Number(id);
  const { data, isLoading } = useGetMediaDetailQuery(mediaId);
  const { data: reviews } = useGetMediaReviewsQuery(mediaId);
  const user = useSelector((state: RootState) => state.auth.user);
  const isDemo = user?.username === "demo";
  const media = isDemo ? mockMedia : data;
  const reviewList = isDemo ? mockMedia.reviews : (reviews ?? []);

  const { data: interactions, refetch: refetchInteractions } = useGetMediaInteractionsQuery(mediaId);  // 추가
  const [toggleInteraction] = useToggleMediaInteractionMutation();        // 추가
  const [createReview] = useCreateMediaReviewMutation();                  // 추가
  const [updateReview] = useUpdateMediaReviewMutation();   
  const [deleteReview] = useDeleteMediaReviewMutation();

  //const navigate = useNavigate(); // 미디어 탭 이동
  //const { id } = useParams(); // React Router에서  URL 파라미터 읽는 훅. URL: /media/:id
  //useParams(); // // TODO: 백엔드 연동 후 useParams()로 id 받아서 API 호출

  // TODO) setActive 초기값 : 홈에서 필터 선택하고 들어오면 그 타입이 기본값. 추후 백엔드 연동 후에 URL params에서 읽어와서 초기값 설정하기 : "" 이건 백엔드 연동전 초기값
  //const [_tab, setActiveTab] = useState(""); // Movie / Series / Animation
  const [icon, setActiveIcon] = useState({
    eye: false,
    like: false,
    dislike: false,
    wish: false,
  });
  useEffect(() => {
    refetchInteractions();
  }, [mediaId, refetchInteractions])


  useEffect(() => {
    if (!interactions) return;
    setActiveIcon({
      eye: interactions.some(i => i.action === 'watched'),
      like: interactions.some(i => i.action === 'like'),
      dislike: interactions.some(i => i.action === 'dislike'),
    });
  }, [interactions]);


  const [myReview, setMyReview] = useState<MediaReview | null>(null);

  useEffect(() => {
    if (!reviews || !user) return;
    setMyReview(
      reviews.find((r) => r.username === user.username) ?? null
    );
  }, [reviews, user.username]);

  const [myRating, setMyRating] = useState(0);
  useEffect(() => {
    if (myReview) {
      setMyRating(myReview.rating);
    }
  }, [myReview?.rating]);


  if (!isDemo && isLoading) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0c0c0b] text-white">
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-[1vw] italic tracking-[0.08em] text-white/50">
            {t("detail.loading")}
          </p>
        </div>
      </div>
    );
  }

  if (!media) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0c0c0b] text-white">
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-[1vw] italic tracking-[0.08em] text-white/50">
            {t("detail.noData")}
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-[#0c0c0b] min-h-screen text-white flex flex-col">
      <div className="px-6 pt-4">
        <button
          onClick={() => navigate("/home")}
          className="mb-4 text-sm text-gray-400 hover:text-white transition"
        >
          ←
        </button>
      </div>
      {/* 레이아웃: 가로로 3등분 */}
      <div className="flex mt-[7vh]">
        {/* 미디어 변환 탭: 제일 왼쪽 */}
        <div className="flex flex-col w-[5vw] text-white gap-[8vh] mt-[10vh] pl-[1vw]">
          <button
            className={`text-[1vw] -rotate-90 ${media.type === "Movie" ? "text-teal-600" : "text-white"}`}
            onClick={() => {}} // TODO: 백엔드 연동 후 추가
          >
            {t("detail.movie")}
          </button>
          <div className="-rotate-90 w-[4px] h-[2vh] bg-white mx-auto" />{" "}
          {/* 구분선 */}
          <button
            className={`text-[1vw] -rotate-90 ${media.type === "Series" ? "text-teal-600" : "text-white"}`}
            onClick={() => {}}
          >
            {t("detail.series")}
          </button>
          <div className="rotate-90 w-[4px] h-[2vh] bg-white mx-auto" />
          <button
            className={`text-[1vw] -rotate-90 ${media.type === "Animation" ? "text-teal-600" : "text-white"}`}
            onClick={() => {}}
          >
            {t("detail.animation")}
          </button>
        </div>

        {/* 중간 왼쪽 vhs 포스터 + 별점 레이아웃 */}
        <div className="w-[35vw] ml-[12vw] mt-[5vh]">
          {/* vhs 미디어 포스터 */}
          <div className="relative w-[15vw] h-[55vh]">
            {/* 1. vhs 테이프 목업 */}
            <img
              src="/vhs-back.png"
              className="absolute inset-0 w-[90%] h-[90%] object-fill translate-x-[103%] translate-y-[4%]"
            />
            {/* 2. 포스터 (중간) */}
            <img
              src={media.frontPosterUrl}
              onError={(e) => {
                e.currentTarget.src = defaultPoster;
              }}
              className="absolute inset-0 w-full h-full object-fill brightness-95 contrast-110"
            />
            {/* 3. 낡은 질감 커버 (맨 위) */}
            <img
              src="/vhs-cover-back.png"
              className="absolute inset-0 w-full h-full object-fill"
            />
          </div>

          {/* 별점 */}
          <div className="flex flex-col mt-[2.5vh]">
            {/* 별 5개 */}
            <div className="flex">
              {[1, 2, 3, 4, 5].map((n) => (
                <img
                  key={n}
                  src={n <= myRating ? "/star-full.png" : "/star-line.png"}
                  onClick={async () => {
                    const newRating = myRating === n ? 0 : n;
                    setMyRating(newRating);
                    if (myReview) {
                      if (newRating === 0) {
                        await deleteReview({ mediaId, reviewId: myReview.id });
                        setMyReview(null);  // 로컬 즉시 반영
                      } else {
                        await updateReview({ mediaId, reviewId: myReview.id, review: { rating: newRating, content: myReview.content } });
                      }
                    } else if (newRating > 0) {
                      const result = await createReview({ mediaId, review: { rating: newRating, content: '' } }).unwrap();
                      setMyReview(result);  // 생성된 리뷰 즉시 반영
                    }
                  }}
                  className="w-[1.6vw] h-[1.6vw] cursor-pointer"
                />
              ))}
            </div>

            {/* MY RATING + 숫자 + My review 버튼 */}
            <div className="flex items-center gap-[1vw] mt-[0.2vh]">
              <p className="text-[1.2vw] font-semibold">
                {t("detail.myRating")}
              </p>
              {/* setMyRating에 따라 숫자 변경 -> 별 몇개 주느냐에 따라 점수다름 */}
              {/* 숫자 자동으로 바뀜 + toFixed(1) : "1.0", "2,0", "3.0" ... */}
              <p className="text-[1.5vw] text-teal-600 font-bold">
                {myRating.toFixed(1)}
              </p>
              <p className="text-[1.2vw] font-semibold self-end mb-[0.2vh] ml-[-0.8vw]">
                / 5
              </p>
            </div>
          </div>
        </div>

        {/* 오른쪽 미디어 정보 레이아웃 */}
        <div className="w-[60vw] ml-[12vw]">
          {/* 1994 | Crime, Thriller | Quentin Tarantino */}
          <div className="flex items-center gap-[1vw] text-[0.9vw]">
            <p>{media.releaseDate?.slice(0, 4)}</p>
            {/* "1994-10-26" -> "1994" */}
            <p className="font-bold">|</p>
            {/* 각 객체에서 name만 꺼내서 배열을 문자열로 합치기 */}
            <p>{media.genre.map((g) => g.name).join(", ")}</p>
            <p className="font-bold">|</p>
            <p>{media.director}</p>
          </div>

          {/* 타이틀 */}
          <p className="text-[8vw] font-bebas mt-[-2.5vh]">{media.title}</p>

          {/* 2h 34m | USA | Cast: John Travolta, Samuel L. Jackson, ... */}
          <div className="flex items-center gap-[0.5vw] text-[0.9vw] mt-[-3vh]">
            <p>{media.runtime}</p>
            <p className="font-bold">|</p>
            <p>{media.country}</p>
            <p className="font-bold">|</p>
            <p>
              <span className="font-semibold">{t("detail.cast")} </span>
              {media.cast.join(", ")}
            </p>
          </div>

          {/* story */}
          <div className="flex gap-[3vw] mt-[6.2vh] items-start">
            <p className="font-thin text-[1.8vw] w-[5vw] leading-tight">
              {t("detail.story")}
            </p>
            <p className="font-ibm text-[0.9vw] max-w-[23vw] leading-relaxed">
              {media.story.replace(/<br\s*\/?>/gi, "\n")}
            </p>
          </div>

          {/* 아이콘 인터렉션 */}
          <div className="flex max-w-[31.5vw] justify-end gap-[0.3vw] mt-[2vh]">
            <button onClick={async () => {
              const next = !icon.eye;
              setActiveIcon({ ...icon, eye: next });
              await toggleInteraction({ mediaId, action: 'watched', active: next });
            }}>
              {/* 이미지 교체 (삼항연산자): 조건 ? 참일 때 : 거짓일 때 */}
              <img
                src={icon.eye ? "/view.png" : "/non-view.png"}
                className="w-[1.3vw] h-[1.3vw] mr-[0.2vw]"
              />
            </button>
            <button
              onClick={async () => {
                const next = !icon.like;
                setActiveIcon({ ...icon, like: next });
                await toggleInteraction({ mediaId, action: 'like', active: next });
              }}
            >
              <img
                src={icon.like ? "/like.png" : "/non-like.png"}
                className="w-[1.2vw] h-[1.2vw]"
              />
            </button>
            <button
              onClick={async () => {
                const next = !icon.dislike;
                setActiveIcon({ ...icon, dislike: next, like: next ? false : icon.like });
                await toggleInteraction({ mediaId, action: 'dislike', active: next });
              }}
            >
              <img
                src={icon.dislike ? "/dislike.png" : "/non-dislike.png"}
                className="w-[1.4vw] h-[1.4vw]"
              />
            </button>
            <button
              onClick={async () => {
                const next = !icon.wish;
                setActiveIcon({ ...icon, wish: next });
                await toggleInteraction({ mediaId, action: 'wish', active: next });
              }}
            >
              <img
                src={icon.wish ? "/wish.png" : "/non-wish.png"}
                className="w-[1.2vw] h-[1.2vw] ml-[0.1vw]"
              />
            </button>
          </div>

          {/* 오른쪽: 리뷰 섹션: Reviews 제목 + 리뷰 목록 (가로정렬) */}
          {/*지울수도 안지울수도 있음*/}
          <div className="flex gap-[3vw] mt-[3.6vh]">
            {/* 유저 리스트 div */}
            <div className="flex flex-col gap-[1vh]">
              {reviewList.map((review) => (
                <div
                  key={review.id}
                  className="flex gap-4 text-[0.8vw] items-start"
                >
                  {/* 유저명 */}
                  <p className="w-[5vw] truncate whitespace-nowrap overflow-hidden">{review.username}</p>


                  {/* 별점 + 숫자 */}
                  <div className="flex items-center ml-[7vw]">
                    {[...Array(review.rating)].map((_, i) => (
                      <img
                        key={i}
                        src="/star-full.png"
                        className="w-[0.8vw] h-[0.8vw]"
                      />
                    ))}
                    <p className="text-[0.6vw] ml-[0.3vw]">
                      {review.rating.toFixed(1)}
                    </p>
                  </div>
                </div>
              ))}
              {/* TODO: 추후 리뷰 전체 리뷰 목록 모달 or 페이지로 교체 */}
              {/* <button
                onClick={() =>
                  alert(
                    "The feature to view all reviews is scheduled to be developed later.",
                  )
                }
                className="mr-[20vw] mt-[1vh] text-[1vw] text-teal-600"
              >
                {t("detail.readMore")}
                <span className="font-black">⟶</span>
              </button> */}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MediaDetailPage;
