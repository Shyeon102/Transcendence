import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import { setLanguage } from '../store/slices/uiSlice';
import type { Language } from '../lib/i18n';

const languages: Language[] = ['ko', 'en', 'fr'];
const labels: Record<Language, string> = {
  ko: 'KO',
  en: 'EN',
  fr: 'FR',
};

export default function LanguageSwitcher() {
  const dispatch = useDispatch();
  const language = useSelector((state: RootState) => state.ui.language);
  const [open, setOpen] = useState(false);

  const handleSelect = (item: Language) => {
    dispatch(setLanguage(item));
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-[#f0ead0]/20 bg-transparent px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#f0ead0] transition hover:border-[#f0ead0]/40 hover:bg-[#f0ead0]/5"
      >
        {labels[language]}
        <span className={`text-[9px] transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 w-28 overflow-hidden border border-[#f0ead0]/15 bg-[#141412] shadow-2xl shadow-black/40">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item)}
              className={`block w-full px-4 py-3 text-left text-[10px] uppercase tracking-[0.16em] transition ${
                language === item
                  ? 'bg-[#d63e2a] text-[#f0ead0]'
                  : 'text-[#c8c2a8] hover:bg-[#f0ead0]/5 hover:text-[#f0ead0]'
              }`}
            >
              {labels[item]}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
