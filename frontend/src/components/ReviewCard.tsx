import { useI18n } from '../lib/i18n';
import StarRating from './StarRating';
import Button from './ui/Button';

export type ReviewVisibility = 'public' | 'followers' | 'private';

export type ReviewItem = {
  date: string;
  id: string;
  mediaId: number;
  isOwn?: boolean;
  poster: string;
  rating: number;
  text: string;
  title: string;
  type: string;
  visibility?: ReviewVisibility;
};

type ReviewCardProps = {
  onDelete?: (review: ReviewItem) => void;
  onEdit?: (review: ReviewItem) => void;
  review: ReviewItem;
};

export default function ReviewCard({ onDelete, onEdit, review }: ReviewCardProps) {
  const { t } = useI18n();
  const visibility = review.visibility ?? 'public';

  return (
    <article className="grid gap-4 border border-[#f0ead0]/10 bg-[#141412] px-5 py-4 transition hover:border-[#f0ead0]/25 md:grid-cols-[42px_1fr_auto]">
      <div className="flex h-[60px] w-[42px] items-center justify-center border border-[#f0ead0]/10 bg-[#1c1c19] text-lg">
        {review.poster}
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <h2 className="text-xs font-bold uppercase tracking-[0.06em]">
            {review.title}
          </h2>
          <span className="border border-[#d4a847]/30 bg-[#d4a847]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#e6bf63]">
            {t(`review.visibility.${visibility}`)}
          </span>
        </div>
        <p className="font-['IBM_Plex_Serif'] text-[13px] font-light italic leading-6 text-[#c8c2a8]">
          {review.text}
        </p>
        <p className="mt-2 flex gap-3 text-[9px] tracking-[0.08em] text-[#8a8474]">
          <span>{review.date}</span>
          <span>·</span>
          <span>{review.type}</span>
        </p>
        {review.isOwn ? (
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" className="px-2" onClick={() => onEdit?.(review)}>
              {t('review.edit')}
            </Button>
            <Button size="sm" variant="danger" className="px-2" onClick={() => onDelete?.(review)}>
              {t('review.delete')}
            </Button>
          </div>
        ) : null}
      </div>
      <div className="text-[11px]">
        <StarRating readOnly value={review.rating} />
      </div>
    </article>
  );
}
