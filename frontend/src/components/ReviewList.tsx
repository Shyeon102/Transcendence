import { useMemo, useState } from "react";
import { useI18n } from "../lib/i18n";
import ReviewCard, { type ReviewItem } from "./ReviewCard";
import Button from "./ui/Button";
import EmptyState from "./ui/EmptyState";

type ReviewListProps = {
  onDelete?: (reviewId: ReviewItem) => void;
  onEdit?: (review: ReviewItem) => void;
  reviews: ReviewItem[];
};

type SortKey = "latest" | "rating";

const getReviewTimestamp = (review: ReviewItem) => {
  const timestamp = Date.parse((review.date ?? "").replace(/\./g, "-"));
  return Number.isNaN(timestamp) ? 0 : timestamp;
};

export default function ReviewList({
  onDelete,
  onEdit,
  reviews,
}: ReviewListProps) {
  const { t } = useI18n();
  const [sortKey, setSortKey] = useState<SortKey>("latest");

  const sortedReviews = useMemo(() => {
    const nextReviews = [...reviews];

    if (sortKey === "rating") {
      return nextReviews.sort((left, right) => right.rating - left.rating);
    }

    return nextReviews.sort(
      (left, right) => getReviewTimestamp(right) - getReviewTimestamp(left),
    );
  }, [reviews, sortKey]);

  if (!reviews.length) {
    return <EmptyState title={t("mypage.empty")} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">
          {t("review.sortLabel")}
        </span>
        <div className="flex flex-wrap gap-2">
          {(["latest", "rating"] as const).map((key) => (
            <Button
              key={key}
              size="sm"
              variant={sortKey === key ? "primary" : "secondary"}
              onClick={() => setSortKey(key)}
            >
              {t(`review.sort.${key}`)}
            </Button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sortedReviews.map((review) => (
          <ReviewCard
            key={review.id}
            onDelete={onDelete}
            onEdit={onEdit}
            review={review}
          />
        ))}
      </div>
    </div>
  );
}
