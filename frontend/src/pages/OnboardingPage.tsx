import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';
import { useUpdateMeMutation } from '../store/slices/authApi';
import type { OnboardingAnswers } from '../types';

const GENRE_IDS = ['drama', 'sciFi', 'thriller', 'animation', 'indie', 'documentary'] as const;
const TITLE_IDS = ['poorThings', 'duneTwo', 'pastLives', 'theZone', 'perfectDays', 'anora'] as const;
const MIN_GENRES = 2;
const MIN_TITLES = 3;

const QUESTION_IDS = [
  'allTimeFavorite',
  'recentFavorite',
  'friendRecommendation',
] as const satisfies readonly (keyof OnboardingAnswers)[];

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [selectedGenres, setSelectedGenres] = useState<number[]>(
    user?.favoriteGenres ?? []
  );
  const [selectedTitles, setSelectedTitles] = useState<string[]>(
    user?.favoriteTitles ?? []
  );
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    user?.onboardingAnswers ?? {
      allTimeFavorite: '',
      recentFavorite: '',
      friendRecommendation: '',
    }
  );
  const [errorMsg, setErrorMsg] = useState('');
  const areAnswersValid = QUESTION_IDS.every(
    (questionId) => answers[questionId].trim().length > 0
  );
  const isSelectionValid =
    selectedGenres.length >= MIN_GENRES &&
    selectedTitles.length >= MIN_TITLES &&
    areAnswersValid;

  const selectedGenreLabels = useMemo(
    () =>
      selectedGenres.map((index) =>
        t(`onboarding.genreOptions.${GENRE_IDS[index]}`)
      ),
    [selectedGenres, t]
  );

  const toggleGenre = (index: number) => {
    if (errorMsg) {
      setErrorMsg('');
    }
    setSelectedGenres((prev) =>
      prev.includes(index) ? prev.filter((value) => value !== index) : [...prev, index]
    );
  };

  const toggleTitle = (title: string) => {
    if (errorMsg) {
      setErrorMsg('');
    }
    setSelectedTitles((prev) =>
      prev.includes(title) ? prev.filter((value) => value !== title) : [...prev, title]
    );
  };

  const handleAnswerChange = (questionId: keyof OnboardingAnswers, value: string) => {
    if (errorMsg) {
      setErrorMsg('');
    }
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!isSelectionValid) {
      const hasMinimumSelections =
        selectedGenres.length >= MIN_GENRES && selectedTitles.length >= MIN_TITLES;
      setErrorMsg(
        hasMinimumSelections
          ? t('onboarding.questionValidation')
          : t('onboarding.validation').replace('{genres}', String(MIN_GENRES)).replace('{titles}', String(MIN_TITLES))
      );
      return;
    }

    const payload = {
      favoriteGenres: selectedGenres,
      favoriteTitles: selectedTitles,
      onboardingAnswers: answers,
    };

    try {
      const updatedUser = await updateMe(payload).unwrap();
      dispatch(updateProfile(updatedUser));
      navigate('/home');
    } catch (error) {
      const apiError = error as { message?: string };
      dispatch(updateProfile(payload));
      setErrorMsg(apiError.message ?? t('onboarding.saveError'));
    }
  };

  return (
    <section className="min-h-[calc(100vh-85px)] overflow-hidden bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d63e2a]">
            {t('onboarding.eyebrow')}
          </p>
          <h1 className="font-['Bebas_Neue'] text-[clamp(56px,11vw,110px)] leading-[0.9] tracking-[0.03em]">
            {t('onboarding.titleLine1')}
            <br />
            {t('onboarding.titleLine2')}
          </h1>
          <p className="mt-4 max-w-2xl font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
            {t('onboarding.description')}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
                    {t('onboarding.genreEyebrow')}
                  </p>
                  <h2 className="mt-2 font-['Bebas_Neue'] text-4xl tracking-[0.04em]">
                    {t('onboarding.genreTitle')}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="font-['Bebas_Neue'] text-4xl leading-none text-[#d63e2a]">
                    {selectedGenres.length}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">
                    {t('onboarding.genreCounter')}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {GENRE_IDS.map((genreId, index) => {
                  const selected = selectedGenres.includes(index);
                  return (
                    <button
                      key={genreId}
                      type="button"
                      onClick={() => toggleGenre(index)}
                      className={`border px-4 py-5 text-left transition ${
                        selected
                          ? 'border-[#d63e2a] bg-[#d63e2a]/10'
                          : 'border-[#f0ead0]/10 bg-[#1c1c19] hover:border-[#f0ead0]/25'
                      }`}
                    >
                      <div className="mb-3 text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">
                        {selected ? t('onboarding.selected') : t('onboarding.tapToSelect')}
                      </div>
                      <div className="font-['Bebas_Neue'] text-3xl leading-none tracking-[0.04em]">
                        {t(`onboarding.genreOptions.${genreId}`)}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
                    {t('onboarding.titleEyebrow')}
                  </p>
                  <h2 className="mt-2 font-['Bebas_Neue'] text-4xl tracking-[0.04em]">
                    {t('onboarding.titleTitle')}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="font-['Bebas_Neue'] text-4xl leading-none text-[#d4a847]">
                    {selectedTitles.length}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">
                    {t('onboarding.titleCounter')}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {TITLE_IDS.map((titleId, index) => {
                  const titleLabel = t(`onboarding.titleOptions.${titleId}`);
                  const selected = selectedTitles.includes(titleLabel);
                  return (
                    <button
                      key={titleId}
                      type="button"
                      onClick={() => toggleTitle(titleLabel)}
                      className={`relative overflow-hidden border px-4 py-5 text-left transition ${
                        selected
                          ? 'border-[#d4a847] bg-[#d4a847]/10'
                          : 'border-[#f0ead0]/10 bg-[#1c1c19] hover:border-[#f0ead0]/25'
                      }`}
                    >
                      <div className="mb-12 text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">
                        #{String(index + 1).padStart(2, '0')}
                      </div>
                      <div className="font-['IBM_Plex_Serif'] text-base italic leading-6 text-[#f0ead0]">
                        {titleLabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
                    {t('onboarding.questionEyebrow')}
                  </p>
                  <h2 className="mt-2 font-['Bebas_Neue'] text-4xl tracking-[0.04em]">
                    {t('onboarding.questionTitle')}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="font-['Bebas_Neue'] text-4xl leading-none text-[#6bbf72]">
                    {QUESTION_IDS.filter((questionId) => answers[questionId].trim()).length}
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">
                    {t('onboarding.questionCounter')}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {QUESTION_IDS.map((questionId) => (
                  <div key={questionId} className="border border-[#f0ead0]/10 bg-[#1c1c19] p-4">
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-[#c8c2a8]">
                      {t(`onboarding.questions.${questionId}`)}
                    </label>
                    <textarea
                      value={answers[questionId]}
                      onChange={(e) => handleAnswerChange(questionId, e.target.value)}
                      placeholder={t('onboarding.questionPlaceholder')}
                      className="min-h-24 w-full resize-y border border-[#f0ead0]/10 bg-[#141412] px-3 py-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit border border-[#f0ead0]/10 bg-[#141412] p-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t('onboarding.summaryEyebrow')}
            </p>
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-[0.04em]">
              {user?.firstName ? `${user.firstName.toUpperCase()}'S TASTE` : t('onboarding.summaryTitle')}
            </h2>

            <div className="mt-7 space-y-6">
              <div>
                <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">
                  {t('onboarding.selectedGenres')}
                </div>
                <div className="flex flex-wrap gap-2">
                  {selectedGenreLabels.length ? (
                    selectedGenreLabels.map((label) => (
                      <span
                        key={label}
                        className="border border-[#d63e2a]/25 bg-[#d63e2a]/10 px-2.5 py-1 text-[9px] uppercase tracking-[0.12em] text-[#ff735f]"
                      >
                        {label}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs italic text-[#8a8474]">
                      {t('onboarding.emptyGenres')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">
                  {t('onboarding.selectedTitles')}
                </div>
                <div className="space-y-2">
                  {selectedTitles.length ? (
                    selectedTitles.map((title) => (
                      <div key={title} className="border-l border-[#d4a847] pl-3 text-sm text-[#c8c2a8]">
                        {title}
                      </div>
                    ))
                  ) : (
                    <span className="text-xs italic text-[#8a8474]">
                      {t('onboarding.emptyTitles')}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="mb-2 text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">
                  {t('onboarding.answerSummary')}
                </div>
                <div className="space-y-3">
                  {QUESTION_IDS.map((questionId) => (
                    <div key={questionId} className="border-l border-[#6bbf72] pl-3">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-[#8a8474]">
                        {t(`onboarding.questions.${questionId}`)}
                      </div>
                      <div className="mt-1 text-sm text-[#c8c2a8]">
                        {answers[questionId].trim() || t('onboarding.emptyAnswer')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {errorMsg ? (
              <p className="mt-6 text-[11px] tracking-[0.06em] text-[#ff4f38]">{errorMsg}</p>
            ) : null}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!isSelectionValid || isSaving}
              className="mt-8 w-full bg-[#d63e2a] px-4 py-4 text-[11px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:cursor-not-allowed disabled:bg-[#6c281f] disabled:text-[#c39a92]"
            >
              {isSaving ? t('onboarding.saving') : t('onboarding.complete')}
            </button>
          </aside>
        </div>
      </div>
    </section>
  );
}
