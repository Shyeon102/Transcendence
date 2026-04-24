import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import LanguageSwitcher from './LanguageSwitcher';

export default function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { t } = useI18n();
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinkClass = (path: string) =>
    `text-[11px] uppercase tracking-[0.12em] transition ${
      location.pathname === path ? 'text-[#f0ead0]' : 'text-[#c8c2a8] hover:text-[#f0ead0]'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-[#f0ead0]/10 bg-[#0c0c0b]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4 text-[#f0ead0]">
        <Link to={isAuthenticated ? '/home' : '/'} className="mr-auto font-['Bebas_Neue'] text-2xl uppercase tracking-[0.18em]">
          Transcendence
        </Link>

        <nav className="flex items-center gap-6">
          <Link to="/" className={navLinkClass('/')}>
            {t('common.info')}
          </Link>
          <Link to="/login" className={navLinkClass('/login')}>
            {t('common.login')}
          </Link>
          <Link to="/signup" className={navLinkClass('/signup')}>
            {t('common.signup')}
          </Link>
          {isAuthenticated ? (
            <Link to="/home" className={navLinkClass('/home')}>
              {t('common.profile')}
            </Link>
          ) : null}
        </nav>

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <LanguageSwitcher />
          {isAuthenticated ? (
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-full border border-[#f0ead0]/20 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-[#c8c2a8] transition hover:border-[#f0ead0]/40 hover:text-[#f0ead0]"
            >
              {t('common.logout')}
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
