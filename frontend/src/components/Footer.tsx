import type { RootState } from "../store";
import { storeLanguage, type Language, useI18n } from "../lib/i18n";
import { useDispatch, useSelector } from "react-redux";
import { setLanguage } from "../store/slices/uiSlice";
import { Link } from "react-router-dom";
//import { useTranslation } from "react-i18next";

const Footer = () => {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const languages: Language[] = ["ko", "en", "fr"];
  const current = useSelector((state: RootState) => state.ui.language);
  const cycleLanguage = () => {
    const currentIndex = languages.indexOf(current);
    const nextIndex = (currentIndex + 1) % languages.length;
    const next = languages[nextIndex];
    dispatch(setLanguage(next));
    storeLanguage(next);
  };
  return (
    <div className="flex justify-between text-[0.80vw] px-[2vw] pt-[7vh]">
      {/* 왼쪽 */}
      <div className="flex gap-[2vw]">
        <Link to="/privacy" className="transition hover:text-white">
          {t("footer.privacyPolicy")}
        </Link>
        <Link to="/terms" className="transition hover:text-white">
          {t("footer.termsOfService")}
        </Link>
        <Link to="/credits" className="transition hover:text-white">
          {t("footer.credits")}
        </Link>
      </div>
      {/* 오른쪽 */}
      <div className="flex gap-[2vw]">
        <p>{t("footer.rights")}</p>
        <button
          className="border border-white/30 rounded-full px-[1vw] py-[0.3vh] text-[0.8vw] -mt-[0.2vh]"
          onClick={cycleLanguage}
        >
          {current === "ko"
            ? "한국어"
            : current === "en"
              ? "English"
              : "Français"}
        </button>
      </div>
    </div>
  );
};

export default Footer;
