import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import { setLanguage } from '../features/ui/uiSlice';
import type { Language } from '../lib/i18n';

const languages: Language[] = ['ko', 'en', 'fr'];

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
        className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:bg-white/10"
      >
        {language}
        <span className={`text-[10px] transition ${open ? 'rotate-180' : ''}`}>▼</span>
      </button>

      {open ? (
        <div className="absolute right-0 top-12 w-32 overflow-hidden rounded-md border border-white/10 bg-[#1b2029] shadow-2xl shadow-black/30">
          {languages.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => handleSelect(item)}
              className={`block w-full rounded-md px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.2em] transition ${
                language === item
                  ? 'bg-cyan-300 text-slate-950'
                  : 'text-slate-200 hover:bg-white/5'
              }`}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
