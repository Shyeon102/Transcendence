import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import LanguageSwitcher from './LanguageSwitcher';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../app/store';
import { logout } from '../features/auth/authSlice';

export default function SiteHeader() {
  const location = useLocation();
  const { t } = useI18n();
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.auth.user);
  const hideActions = location.pathname === '/login' || location.pathname === '/signup';

  return (
    <header className="border-b border-white/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-5">
        <Link
          to="/"
          className="text-lg font-semibold tracking-[0.25em] text-white transition hover:text-cyan-200"
        >
          TRANSCENDENCE
        </Link>

        {!hideActions ? (
          <div className="flex items-center gap-3">
            {user ? (
              <button
                type="button"
                onClick={() => dispatch(logout())}
                className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
              >
                {t('common.logout')}
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {t('common.login')}
                </Link>
                <Link
                  to="/signup"
                  className="rounded-md border border-white/10 bg-white/[0.03] px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/[0.06] hover:text-white"
                >
                  {t('common.signup')}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>
        ) : (
          <div />
        )}
      </div>
    </header>
  );
}
