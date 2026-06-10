import { useState } from 'react';
import { useI18n } from '../lib/i18n';
import StarRating from './StarRating';
import type { ReviewItem } from './ReviewCard';
import SectionCard from './ui/SectionCard';
import StatusMessage from './ui/StatusMessage';
import TextAreaField from './ui/TextAreaField';
import TextField from './ui/TextField';

type ReviewFormProps = {
  onSubmit: (review: ReviewItem) => void;
};

export default function ReviewForm({ onSubmit }: ReviewFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    title: '',
    type: '',
    text: '',
    rating: 0,
  });
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (field: keyof typeof form, value: string | number) => {
    if (errorMsg) {
      setErrorMsg('');
    }

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.type.trim() || !form.text.trim() || form.rating < 1) {
      setErrorMsg(t('review.validation'));
      return;
    }

    onSubmit({
      id: `${Date.now()}`,
      title: form.title,
      type: form.type,
      text: form.text,
      rating: form.rating,
      poster: '🎬',
      date: new Date().toISOString().slice(0, 10).replace(/-/g, '.'),
    });

    setForm({
      title: '',
      type: '',
      text: '',
      rating: 0,
    });
  };

  return (
    <SectionCard className="mb-6 p-5">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('review.formEyebrow')}
          </p>
          <h2 className="mt-2 font-['Bebas_Neue'] text-3xl tracking-[0.04em]">
            {t('review.formTitle')}
          </h2>
        </div>
        <StarRating value={form.rating} onChange={(value) => handleChange('rating', value)} />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          type="text"
          value={form.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder={t('review.titlePlaceholder')}
          className="px-4 py-3 text-[13px]"
        />
        <TextField
          type="text"
          value={form.type}
          onChange={(e) => handleChange('type', e.target.value)}
          placeholder={t('review.typePlaceholder')}
          className="px-4 py-3 text-[13px]"
        />
      </div>

      <TextAreaField
        value={form.text}
        onChange={(e) => handleChange('text', e.target.value)}
        placeholder={t('review.textPlaceholder')}
        className="mt-4 min-h-28 px-4 py-3 font-['IBM_Plex_Serif'] text-[13px] italic leading-6"
      />

      {errorMsg ? (
        <StatusMessage className="mt-4">{errorMsg}</StatusMessage>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        className="mt-4 bg-[#d63e2a] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38]"
      >
        {t('review.submit')}
      </button>
    </SectionCard>
  );
}
