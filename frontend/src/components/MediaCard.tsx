import type { Media } from "../types/media";

interface MediaCardProps {
  media: Media;
  onSelect: (media: Media) => void;
  isSelected?: boolean;
}

const MediaCard = ({ media, onSelect, isSelected }: MediaCardProps) => {
  return (
    // 카드 전체 영역
    // isSelected: 클릭된 카드 -> 앞면 포스터 크기로 확대
    <div
      onClick={() => onSelect(media)}
      className={`relative ${
        isSelected
          ? "w-[15vw] h-[55vh] mx-[3vw] -rotate-6 z-10 overflow-visible" // 카드 선택시 
          : "w-[3.67vw] h-[55vh]" // 기본 카드: VHS 옆면 크기
      } cursor-pointer overflow-hidden flex-shrink-0`}
      // flex-shrink-0: 부모가 flex여도 카드가 찌그러지지 않게 고정
    >
      {/* 포스터 이미지: 선택 여부에 따라 앞면/옆면 전환 */}
      <img
        src={isSelected ? media.frontPosterUrl : media.sidePosterUrl}
        alt={media.title}
        className="absolute inset-0 w-full h-full object-fill"
      />
    </div>
  );
};

export default MediaCard;
