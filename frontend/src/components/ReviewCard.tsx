import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import StarRating from './StarRating';
import Button from './ui/Button';

export type ReviewItem = {
  date: string;
  id: string;
  isOwn?: boolean;
  poster: string;
  rating: number;
  spoiler?: boolean;
  text: string;
  title: string;
  type: string;
};

type ReviewCardProps = {
  onDelete?: (reviewId: string) => void;
  onEdit?: (review: ReviewItem) => void;
  review: ReviewItem;
};

export default function ReviewCard({ onDelete, onEdit, review }: ReviewCardProps) {
  const { t } = useI18n();
  const [isSpoilerVisible, setIsSpoilerVisible] = useState(!review.spoiler);
  const shouldMaskSpoiler = review.spoiler && !isSpoilerVisible;

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
          {review.spoiler ? (
            <span className="border border-[#d4a847]/30 bg-[#d4a847]/10 px-2 py-0.5 text-[8px] uppercase tracking-[0.12em] text-[#e6bf63]">
              {t('review.spoiler')}
            </span>
          ) : null}
        </div>
        {shouldMaskSpoiler ? (
          <div className="border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.12em] text-[#8a8474]">
              {t('review.spoilerHidden')}
            </p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2 px-0"
              onClick={() => setIsSpoilerVisible(true)}
            >
              {t('review.showSpoiler')}
            </Button>
          </div>
        ) : (
          <p className="font-['IBM_Plex_Serif'] text-[13px] font-light italic leading-6 text-[#c8c2a8]">
            {review.text}
          </p>
        )}
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
            <Button size="sm" variant="danger" className="px-2" onClick={() => onDelete?.(review.id)}>
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
