import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import type { RootState } from "../store";
import { updateProfile } from "../store/slices/authSlice";
import { useUpdateMeMutation } from "../store/api/authApi";
import {
  useLazySearchMediaQuery,
  type MediaSearchResult,
} from "../store/slices/apiSlice";

const QUESTION_IDS = [
  "allTimeFavorite",
  "recentFavorite",
  "friendRecommendation",
] as const;

type QuestionId = (typeof QUESTION_IDS)[number];
type SearchAnswers = Record<QuestionId, string>;

const EMPTY_ANSWERS: SearchAnswers = {
  allTimeFavorite: "",
  recentFavorite: "",
  friendRecommendation: "",
};

type OnboardingSearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect: (media: MediaSearchResult) => void;
  placeholder: string;
  searchingLabel: string;
  noResultsLabel: string;
};

function OnboardingSearchInput({
  value,
  onChange,
  onSelect,
  placeholder,
  searchingLabel,
  noResultsLabel,
}: OnboardingSearchInputProps) {
  const [triggerSearch, { data: results = [], isFetching }] = useLazySearchMediaQuery();
  const [isOpen, setIsOpen] = useState(false);
  const query = value.trim();

  useEffect(() => {
    if (query.length < 2) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      triggerSearch(query);
    }, 250);

    return () => window.clearTimeout(timeoutId);
  }, [query, triggerSearch]);

  const showResults = isOpen && query.length >= 2;

  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="w-full border border-[#f0ead0]/10 bg-[#141412] px-3 py-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
      />

      {showResults ? (
        <div className="absolute z-10 mt-1 max-h-56 w-full overflow-y-auto border border-[#f0ead0]/15 bg-[#141412] shadow-xl">
          {isFetching ? (
            <p className="px-3 py-3 text-xs text-[#8a8474]">{searchingLabel}</p>
          ) : results.length > 0 ? (
            results.map((media) => (
              <button
                key={media.id}
                type="button"
                onClick={() => {
                  onSelect(media);
                  setIsOpen(false);
                }}
                className="block w-full border-b border-[#f0ead0]/10 px-3 py-3 text-left transition last:border-b-0 hover:bg-[#1c1c19]"
              >
                <span className="block text-sm text-[#f0ead0]">{media.title}</span>
                <span className="mt-1 block text-[10px] uppercase tracking-[0.12em] text-[#8a8474]">
                  {[media.media_type, media.release_date?.slice(0, 4)]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </button>
            ))
          ) : (
            <p className="px-3 py-3 text-xs text-[#8a8474]">{noResultsLabel}</p>
          )}
        </div>
      ) : null}
    </div>
  );
}

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [answers, setAnswers] = useState<SearchAnswers>(EMPTY_ANSWERS);
  const [errorMsg, setErrorMsg] = useState("");

  const areAnswersValid = QUESTION_IDS.every(
    (questionId) => answers[questionId].trim().length > 0,
  );

  const handleAnswerChange = (
    questionId: QuestionId,
    value: string,
  ) => {
    if (errorMsg) {
      setErrorMsg("");
    }

    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const persistOnboarding = async () => {
    const payload = { onboardingCompleted: true };

    try {
      const updatedUser = await updateMe(payload).unwrap();
      dispatch(updateProfile(updatedUser));
      navigate("/home");
    } catch (error) {
      const apiError = error as { message?: string };

      if (user?.username === "demo") {
        dispatch(updateProfile(payload));
        navigate("/home");
        return;
      }

      setErrorMsg(apiError.message ?? t("onboarding.saveError"));
    }
  };

  const handleSubmit = async () => {
    if (!areAnswersValid) {
      setErrorMsg(t("onboarding.questionValidation"));
      return;
    }

    await persistOnboarding();
  };

  const handleSkip = async () => {
    if (isSaving) {
      return;
    }

    await persistOnboarding();
  };

  return (
    <section className="min-h-[calc(100vh-85px)] overflow-hidden bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-3xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d63e2a]">
                {t("onboarding.eyebrow")}
              </p>
              <h1 className="font-['Bebas_Neue'] text-[clamp(56px,11vw,110px)] leading-[0.9] tracking-[0.03em]">
                {t("onboarding.titleLine1")}
                <br />
                {t("onboarding.titleLine2")}
              </h1>
              <p className="mt-4 max-w-2xl font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
                {t("onboarding.description")}
              </p>
            </div>

            <button
              type="button"
              onClick={handleSkip}
              disabled={isSaving}
              className="border border-[#f0ead0]/20 px-4 py-2 text-[10px] uppercase tracking-[0.16em] text-[#c8c2a8] transition hover:border-[#f0ead0]/40 hover:text-[#f0ead0] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {t("onboarding.skip")}
            </button>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div className="space-y-8">
            <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
                    {t("onboarding.questionEyebrow")}
                  </p>
                  <h2 className="mt-2 font-['Bebas_Neue'] text-4xl tracking-[0.04em]">
                    {t("onboarding.questionTitle")}
                  </h2>
                </div>
                <div className="text-right">
                  <div className="font-['Bebas_Neue'] text-4xl leading-none text-[#6bbf72]">
                    {
                      QUESTION_IDS.filter((questionId) =>
                        answers[questionId].trim(),
                      ).length
                    }
                  </div>
                  <div className="text-[9px] uppercase tracking-[0.16em] text-[#8a8474]">
                    {t("onboarding.questionCounter")}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {QUESTION_IDS.map((questionId) => (
                  <div
                    key={questionId}
                    className="border border-[#f0ead0]/10 bg-[#1c1c19] p-4"
                  >
                    <label className="mb-2 block text-[10px] uppercase tracking-[0.12em] text-[#c8c2a8]">
                      {t(`onboarding.questions.${questionId}`)}
                    </label>
                    <OnboardingSearchInput
                      value={answers[questionId]}
                      onChange={(value) => handleAnswerChange(questionId, value)}
                      onSelect={(media) => handleAnswerChange(questionId, media.title)}
                      placeholder={t("onboarding.questionPlaceholder")}
                      searchingLabel={t("onboarding.searching")}
                      noResultsLabel={t("onboarding.noResults")}
                    />
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="h-fit border border-[#f0ead0]/10 bg-[#141412] p-6">
            <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t("onboarding.summaryEyebrow")}
            </p>
            <h2 className="font-['Bebas_Neue'] text-4xl tracking-[0.04em]">
              {user?.firstName
                ? `${user.firstName.toUpperCase()}'S TASTE`
                : t("onboarding.summaryTitle")}
            </h2>

            <div className="mt-7 space-y-3">
              {QUESTION_IDS.map((questionId) => (
                <div
                  key={questionId}
                  className="border-l border-[#6bbf72] pl-3"
                >
                  <div className="text-[9px] uppercase tracking-[0.12em] text-[#8a8474]">
                    {t(`onboarding.questions.${questionId}`)}
                  </div>
                  <div className="mt-1 text-sm text-[#c8c2a8]">
                    {answers[questionId].trim() || t("onboarding.emptyAnswer")}
                  </div>
                </div>
              ))}
            </div>

            {errorMsg ? (
              <p className="mt-6 text-[11px] tracking-[0.06em] text-[#ff4f38]">
                {errorMsg}
              </p>
            ) : null}

            <div className="mt-8 space-y-3">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSaving}
                className="w-full bg-[#d63e2a] px-4 py-4 text-[11px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:cursor-not-allowed disabled:bg-[#6c281f] disabled:text-[#c39a92]"
              >
                {isSaving ? t("onboarding.saving") : t("onboarding.complete")}
              </button>

              <button
                type="button"
                onClick={handleSkip}
                disabled={isSaving}
                className="w-full border border-[#f0ead0]/20 px-4 py-4 text-[11px] uppercase tracking-[0.15em] text-[#c8c2a8] transition hover:border-[#f0ead0]/40 hover:text-[#f0ead0] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {t("onboarding.skip")}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
