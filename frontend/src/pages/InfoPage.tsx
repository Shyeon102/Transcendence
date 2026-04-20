import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { useI18n } from '../lib/i18n';

export default function HomePage() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { t } = useI18n();

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-[calc(100vh-85px)] w-full max-w-6xl items-center justify-center px-4 py-10">
        {user ? (
          <div className="text-sm font-semibold text-slate-100">
            {t('home.welcomePrefix')} {user.username}{t('home.welcomeSuffix')}
          </div>
        ) : null}
      </main>
    </div>
  );
}
