import type { Media } from "../types/media";

interface MediaCardProps {
  media: Media;
  onSelect: (media: Media) => void;
  isSelected?: boolean;
}

const MediaCard = ({ media, onSelect, isSelected }: MediaCardProps) => {
  return (
    <div
      onClick={() => onSelect(media)}
      className={`relative ${isSelected ? "w-[237px] h-[416px]" : "w-[59px] h-[425px]"} cursor-pointer overflow-hidden`}
    >
      <img
        src={isSelected ? media.frontPosterUrl : media.sidePosterUrl}
        alt={media.title}
        className="absolute inset-0 w-full h-full object-fill"
      />
    </div>
  );
};

export default MediaCard;
