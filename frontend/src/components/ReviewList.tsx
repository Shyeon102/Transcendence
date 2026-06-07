import ReviewCard, { type ReviewItem } from './ReviewCard';

type ReviewListProps = {
  reviews: ReviewItem[];
};

export default function ReviewList({ reviews }: ReviewListProps) {
  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}
