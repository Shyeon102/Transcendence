type StarRatingProps = {
  onChange?: (value: number) => void;
  readOnly?: boolean;
  value: number;
};

const MAX_STARS = 5;

export default function StarRating({
  onChange,
  readOnly = false,
  value,
}: StarRatingProps) {
  return (
    <div
      className="flex items-center gap-1"
      aria-label={`Rating: ${value} out of ${MAX_STARS}`}
    >
      {Array.from({ length: MAX_STARS }, (_, index) => {
        const starValue = index + 1;
        const filled = starValue <= value;

        if (readOnly) {
          return (
            <span
              key={starValue}
              className={filled ? 'text-[#d4a847]' : 'text-[#5e584a]'}
            >
              ★
            </span>
          );
        }

        return (
          <button
            key={starValue}
            type="button"
            aria-label={`Set rating to ${starValue}`}
            onClick={() => onChange?.(starValue)}
            className={`text-lg transition ${
              filled ? 'text-[#d4a847]' : 'text-[#5e584a] hover:text-[#f0ead0]'
            }`}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
