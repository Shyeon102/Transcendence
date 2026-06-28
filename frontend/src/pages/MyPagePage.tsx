import { useSelector } from 'react-redux';
import MyPageDashboard from '../components/MyPageDashboard';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { useGetMyPageDashboardQuery } from '../store/api/authApi';

export default function MyPagePage() {
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const isDemo = user?.username === 'demo';
  const { data: dashboard } = useGetMyPageDashboardQuery(undefined, { skip: !user || isDemo });

  if (!user) {
    return null;
  }

  const heading = user.firstName
    ? t('mypage.userSpace').replace('{{name}}', user.firstName.toUpperCase())
    : t('mypage.title');

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          <p className="mb-3 text-[10px] uppercase tracking-[0.22em] text-[#d4a847]">
            {t('mypage.eyebrow')}
          </p>
          <h1 className="font-['Bebas_Neue'] text-[clamp(50px,10vw,96px)] leading-[0.92] tracking-[0.03em]">
            {heading}
          </h1>
          <p className="mt-4 max-w-2xl font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
            {t('mypage.description')}
          </p>
        </div>

        <MyPageDashboard
          activities={dashboard?.activities}
          emptyLabel={t('mypage.empty')}
          entriesLabel={t('mypage.entries')}
          isDemo={isDemo}
          logLabel={t('mypage.log')}
          queueLabel={t('mypage.queue')}
          recentActivityLabel={t('mypage.recentActivity')}
          reviews={dashboard?.reviews}
          reviewSectionLabel={t('mypage.reviewSection')}
          watchlist={dashboard?.watchlist}
          watchlistLabel={t('mypage.watchlistSection')}
        />
      </div>
    </section>
  );
}
