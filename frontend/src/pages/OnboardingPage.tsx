import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useI18n } from "../lib/i18n";
import type { RootState } from "../store";
import { updateProfile } from "../store/slices/authSlice";
import { useUpdateMeMutation } from "../store/api/authApi";
import type { OnboardingAnswers } from "../types";

const QUESTION_IDS = [
  "allTimeFavorite",
  "recentFavorite",
  "friendRecommendation",
] as const satisfies readonly (keyof OnboardingAnswers)[];

const EMPTY_ANSWERS: OnboardingAnswers = {
  allTimeFavorite: "",
  recentFavorite: "",
  friendRecommendation: "",
};

export default function OnboardingPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe, { isLoading: isSaving }] = useUpdateMeMutation();
  const [answers, setAnswers] = useState<OnboardingAnswers>(
    user?.onboardingAnswers ?? EMPTY_ANSWERS,
  );
  const [errorMsg, setErrorMsg] = useState("");

  const areAnswersValid = QUESTION_IDS.every(
    (questionId) => answers[questionId].trim().length > 0,
  );

  const handleAnswerChange = (
    questionId: keyof OnboardingAnswers,
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

  const persistOnboarding = async (payloadAnswers: OnboardingAnswers) => {
    const payload = {
      onboardingCompleted: true,
      onboardingAnswers: payloadAnswers,
    };

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

  const handleSkipAnswers = () => {
    if (errorMsg) {
      setErrorMsg("");
    }

    setAnswers(EMPTY_ANSWERS);
  };

  const handleSubmit = async () => {
    if (!areAnswersValid) {
      setErrorMsg(t("onboarding.questionValidation"));
      return;
    }

    await persistOnboarding(answers);
  };

  const handleSkip = async () => {
    if (isSaving) {
      return;
    }

    await persistOnboarding(EMPTY_ANSWERS);
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
                      <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#8a8474]">
                        {t('onboarding.questionOptional')}
                      </p>
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
                      <button
                        type="button"
                        onClick={handleSkipAnswers}
                        className="mt-3 border border-[#f0ead0]/10 bg-transparent px-3 py-2 text-[9px] uppercase tracking-[0.14em] text-[#8a8474] transition hover:border-[#f0ead0]/25 hover:text-[#f0ead0]"
                      >
                        {t('onboarding.skipQuestions')}
                      </button>
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
                        <input
                          type="search"
                          value={answers[questionId]}
                          onChange={(e) =>
                            handleAnswerChange(questionId, e.target.value)
                          }
                          placeholder={t("onboarding.questionPlaceholder")}
                          className="w-full border border-[#f0ead0]/10 bg-[#141412] px-3 py-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
                        />
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={handleSkipAnswers}
                    className="mt-4 border border-[#f0ead0]/10 bg-transparent px-4 py-2.5 text-[9px] uppercase tracking-[0.14em] text-[#8a8474] transition hover:border-[#f0ead0]/25 hover:text-[#f0ead0]"
                  >
                    {t('onboarding.skipQuestions')}
                  </button>
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
