import type { Media } from "../types/media";

interface MediaCardProps {
  media: Media;
  onSelect: (media: Media) => void;
  isSelected?: boolean;
  onDetailClick: (id: number) => void; // 상세페이지 이동 함수 (HomePage에서 받아옴)
}

const MediaCard = ({
  media,
  onSelect,
  isSelected,
  onDetailClick,
}: MediaCardProps) => {
  return (
    // 바깥 div: 카드(왼쪽) + 정보패널(오른쪽) 가로 나열
    // isSelected일 때만 gap 적용
    <div className={`flex items-start ${isSelected ? "gap-[1.5vw]" : ""}`}>
      {/* 왼쪽: 카드 이미지 + 아래 텍스트 세로로 쌓기 */}
      <div className="flex flex-col items-center">
        {/* 카드 이미지 영역 */}
        {/* isSelected: 앞면 포스터 크기로 확대 + overflow-visible로 포스터 잘림 방지 */}
        {/* 기본: VHS 옆면 크기 + overflow-hidden으로 이미지 영역 안에 가둠 */}
        <div
          onClick={() => onSelect(media)}
          className={`relative ${
            isSelected
              ? "w-[15vw] h-[55vh] mx-[3vw] z-10 overflow-visible"
              : "w-[3.67vw] h-[55vh] overflow-hidden"
          } cursor-pointer flex-shrink-0`}
        >
          {isSelected ? (
            <>
              {/* 1. VHS 테이프 목업 (배경) - 회전 없음 */}
              <img
                src="/vhs-front.png"
                alt="vhs"
                className="absolute inset-0 w-[90%] h-[90%] object-fill translate-x-[45%] translate-y-[4%]"
              />
              {/* 2. 포스터 (중간) - 살짝 회전 */}
              <img
                src={media.frontPosterUrl}
                alt={media.title}
                className="absolute inset-0 w-full h-full object-fill -rotate-6"
              />
              {/* 3. 낡은 질감 커버 (맨 위) - 포스터랑 같이 회전 */}
              <img
                src="/vhs-cover.png"
                alt="cover"
                className="absolute inset-0 w-full h-full object-fill -rotate-6"
              />
            </>
          ) : (
            // 기본 상태: VHS 옆면 이미지
            <img
              src={media.sidePosterUrl}
              alt={media.title}
              className="absolute inset-0 w-full h-full object-fill"
            />
          )}
        </div>

        {/* 카드 아래 텍스트: 선택됐을 때만 표시 */}
        {isSelected && (
          <div className="text-center mt-[2vh]">
            <p className="font-playfair text-white text-[2.5vw] font-bold">
              {media.title}
            </p>
            <p className="font-playfair text-red-500 text-[1vw]">
              {media.director}
            </p>
            <p className="font-playfair text-white text-[1vw]">
              {media.runtime}
            </p>
          </div>
        )}
      </div>

      {/* 오른쪽: 정보 패널 - 선택됐을 때만 표시 */}
      {isSelected && (
        <div className="text-white min-w-[20vw] pt-[1vh] ml-[2vw]">
          {/* 장르 + 연령등급 태그 */}
          <div className="flex gap-[0.8vw] mb-[2vh]">
            <span className="px-[0.8vw] py-[0.4vh] bg-gray-600 text-white rounded-full text-[0.9vw]">
              {media.genre.map((g) => g.name).join("/")}
            </span>
            <span className="px-[0.8vw] py-[0.4vh] bg-gray-600 text-white rounded-full text-[0.9vw]">
              {media.ageRating}
            </span>
          </div>

          {/* 미디어 상세 정보 */}
          <div className="flex flex-col gap-[1vh]">
            <div className="flex gap-[1.5vw]">
              <span className="font-bold w-[7vw] text-[0.9vw]">
                Release Date
              </span>
              <span className="text-[0.9vw]">{media.releaseDate}</span>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="font-bold w-[7vw] text-[0.9vw]">Country</span>
              <span className="text-[0.9vw]">{media.country}</span>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="font-bold w-[7vw] text-[0.9vw]">Language</span>
              <span className="text-[0.9vw]">{media.language}</span>
            </div>
            <div className="flex gap-[1.5vw]">
              <span className="font-bold w-[7vw] text-[0.9vw]">Cast</span>
              <span className="text-[0.9vw]">{media.cast.join(", ")}</span>
            </div>
          </div>

          {/* 줄거리 */}
          <p className="mt-[2vh] text-[0.9vw] text-gray-300">{media.story}</p>

          {/* 인터랙션 아이콘 (봤어요 / 좋아요 / 싫어요 / 위시) */}
          <div className="flex gap-[1.5vw] mt-[2vh]">
            <span>👁</span>
            <span>🤍</span>
            <span>💔</span>
            <span>✅</span>
          </div>

          {/* 상세 페이지 이동 버튼 */}
          <button
            onClick={() => onDetailClick(media.id)}
            className="mt-[2vh] px-[1.5vw] py-[1vh] bg-teal-600 text-white rounded text-[0.9vw]"
          >
            Go to detail
          </button>
        </div>
      )}
    </div>
  );
};

export default MediaCard;
