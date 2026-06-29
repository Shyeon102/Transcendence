import { useState, useEffect } from "react";
import { useLazySearchMediaQuery } from "../store/slices/apiSlice";
import { useI18n } from "../lib/i18n";
import StarRating from "./StarRating";
import type { ReviewVisibility } from "./ReviewCard";
import Button from "./ui/Button";
import SectionCard from "./ui/SectionCard";
import StatusMessage from "./ui/StatusMessage";
import TextAreaField from "./ui/TextAreaField";

type ReviewFormProps = {
  onSubmit: (review: {
    mediaId: number;
    rating: number;
    content: string;
    visibility: ReviewVisibility;
  }) => Promise<void> | void;
};

const visibilityOptions: ReviewVisibility[] = [
  "public",
  "followers",
  "private",
];

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: "",
    type: "",
    text: "",
    rating: 0,
    visibility: "public" as ReviewVisibility,
  });
  const [errorKey, setErrorKey] = useState("");
  const [errorText, setErrorText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [triggerSearch, { data: results = [], isFetching }] =
    useLazySearchMediaQuery();
  const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const query = form.title.trim();
  useEffect(() => {
    if (query.length < 2) return;
    const timeoutId = window.setTimeout(() => {
      triggerSearch(query);
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [query, triggerSearch]);

  const handleChange = (
    field: keyof typeof form,
    value: boolean | string | number,
  ) => {
    if (errorKey || errorText) {
      setErrorKey("");
      setErrorText("");
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!selectedMediaId || !form.text.trim() || form.rating < 1) {
      setErrorKey("review.validation");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        mediaId: selectedMediaId,
        rating: form.rating,
        content: form.text,
        visibility: form.visibility,
      });

      setForm({
        title: "",
        type: "",
        text: "",
        rating: 0,
        visibility: "public",
      });
      setSelectedMediaId(null);
    } catch (err) {
      const message = (err as { message?: string }).message;
      if (message === "review.duplicate" || message === "common.error") {
        setErrorKey(message);
      } else {
        setErrorText(message || "");
        setErrorKey(message ? "" : "common.error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const errorMsg = errorKey ? t(errorKey) : errorText;

  return (
    <SectionCard className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t("review.formEyebrow")}
          </p>
          <h2 className="mt-2 font-['Bebas_Neue'] text-3xl tracking-[0.04em]">
            {t("review.formTitle")}
          </h2>
        </div>
        <StarRating
          value={form.rating}
          onChange={(value) => handleChange("rating", value)}
        />
      </div>

      <div className="relative">
        <input
          type="search"
          value={form.title}
          onChange={(e) => {
            handleChange("title", e.target.value);
            setSelectedMediaId(null);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t("review.titlePlaceholder")}
          className="w-full border border-[#f0ead0]/10 bg-[#141412] px-4 py-3 text-[13px] text-[#f0ead0] outline-none focus:border-[#f0ead0]/25"
        />
        {isOpen && query.length >= 2 && !selectedMediaId ? (
          <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border border-[#f0ead0]/15 bg-[#141412] shadow-xl">
            {isFetching ? (
              <p className="px-3 py-3 text-xs text-[#8a8474]">
                {t("review.searching")}
              </p>
            ) : results.length > 0 ? (
              results.map((media) => (
                <button
                  key={media.id}
                  type="button"
                  onClick={() => {
                    handleChange("title", media.title);
                    setSelectedMediaId(media.id);
                    setIsOpen(false);
                  }}
                  className="block w-full border-b border-[#f0ead0]/10 px-3 py-3 text-left transition last:border-b-0 hover:bg-[#1c1c19]"
                >
                  <span className="block text-sm text-[#f0ead0]">
                    {media.title}
                  </span>
                </button>
              ))
            ) : (
              <p className="px-3 py-3 text-xs text-[#8a8474]">
                {t("review.noResults")}
              </p>
            )}
          </div>
        ) : null}
      </div>

      <TextAreaField
        value={form.text}
        onChange={(e) => handleChange("text", e.target.value)}
        placeholder={t("review.textPlaceholder")}
        className="mt-4 min-h-28 px-4 py-3 font-['IBM_Plex_Serif'] text-[13px] italic leading-6"
      />

      <div className="mt-4">
        <p className="mb-2 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]">
          {t("review.visibilityLabel")}
        </p>
        <div className="grid gap-2 sm:grid-cols-3">
          {visibilityOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => handleChange("visibility", option)}
              className={`border px-3 py-2 text-[10px] uppercase tracking-[0.12em] transition ${
                form.visibility === option
                  ? "border-[#d63e2a] bg-[#d63e2a]/10 text-[#f0ead0]"
                  : "border-[#f0ead0]/10 bg-[#1c1c19] text-[#8a8474] hover:border-[#f0ead0]/25 hover:text-[#c8c2a8]"
              }`}
            >
              {t(`review.visibility.${option}`)}
            </button>
          ))}
        </div>
      </div>

      {errorMsg ? (
        <StatusMessage className="mt-4">{errorMsg}</StatusMessage>
      ) : null}

      <Button
        onClick={handleSubmit}
        variant="primary"
        className="mt-4"
        disabled={isSubmitting}
      >
        {t("review.submit")}
      </Button>
    </SectionCard>
  );
}
