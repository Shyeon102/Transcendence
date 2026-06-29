import { useState } from "react";
import { useI18n } from "../lib/i18n";
import StarRating from "./StarRating";
import type { ReviewItem } from "./ReviewCard";
import StatusMessage from "./ui/StatusMessage";

type ReviewEditModalProps = {
  review: ReviewItem;
  errorMessage?: string;
  onClose: () => void;
  onSave: (data: { rating: number; content: string }) => void;
};

export default function ReviewEditModal({
  review,
  errorMessage,
  onClose,
  onSave,
}: ReviewEditModalProps) {
  const { t } = useI18n();
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.text);

  const handleSave = () => {
    if (rating < 1 || !content.trim()) return;
    onSave({ rating, content });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[28rem] border border-[#f0ead0]/15 bg-[#1a1a1a] p-6">
        <h2 className="mb-4 font-['Bebas_Neue'] text-2xl tracking-[0.04em] text-[#f0ead0]">
          {review.title}
        </h2>

        <div className="mb-4">
          <StarRating value={rating} onChange={setRating} />
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-28 w-full border border-[#f0ead0]/10 bg-[#0c0c0b] px-3 py-2 text-[13px] text-[#f0ead0] outline-none focus:border-[#f0ead0]/25"
        />

        {errorMessage ? (
          <StatusMessage className="mt-3">{errorMessage}</StatusMessage>
        ) : null}

        <div className="mt-4 flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 bg-[#d63e2a] py-2 text-[11px] uppercase tracking-[0.12em] text-[#f0ead0] transition hover:bg-[#ff4f38]"
          >
            {t("review.save")}
          </button>
          <button
            onClick={onClose}
            className="flex-1 border border-[#f0ead0]/20 py-2 text-[11px] uppercase tracking-[0.12em] text-[#c8c2a8] transition hover:border-[#f0ead0]/40"
          >
            {t("review.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
