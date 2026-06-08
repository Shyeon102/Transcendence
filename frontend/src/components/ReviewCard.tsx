import StarRating from './StarRating';

export type ReviewItem = {
  date: string;
  id: string;
  poster: string;
  rating: number;
  text: string;
  title: string;
  type: string;
};

type ReviewCardProps = {
  review: ReviewItem;
};

export default function ReviewCard({ review }: ReviewCardProps) {
  return (
    <article className="grid gap-4 border border-[#f0ead0]/10 bg-[#141412] px-5 py-4 transition hover:border-[#f0ead0]/25 md:grid-cols-[42px_1fr_auto]">
      <div className="flex h-[60px] w-[42px] items-center justify-center border border-[#f0ead0]/10 bg-[#1c1c19] text-lg">
        {review.poster}
      </div>
      <div>
        <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.06em]">
          {review.title}
        </h2>
        <p className="font-['IBM_Plex_Serif'] text-[13px] font-light italic leading-6 text-[#c8c2a8]">
          {review.text}
        </p>
        <p className="mt-2 flex gap-3 text-[9px] tracking-[0.08em] text-[#8a8474]">
          <span>{review.date}</span>
          <span>·</span>
          <span>{review.type}</span>
        </p>
      </div>
      <div className="text-[11px]">
        <StarRating readOnly value={review.rating} />
      </div>
    </article>
  );
}
