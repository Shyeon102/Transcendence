import type { DashboardReview } from '../types';
import EmptyState from './ui/EmptyState';
import SectionCard from './ui/SectionCard';

const reviewItems = [
  {
    id: 1,
    title: 'The Substance',
    note: 'Body horror, dark satire, and a finale that escalates without apology.',
    when: '2 hours ago',
    rating: 4,
  },
  {
    id: 2,
    title: 'Frieren',
    note: 'Quiet fantasy pacing done right. Episode arcs land with almost no wasted motion.',
    when: 'Yesterday',
    rating: 5,
  },
] satisfies DashboardReview[];

const watchlistItems = [
  'Perfect Blue',
  'Aftersun',
  'Mob Psycho 100',
  'Challengers',
];

const activityItems = [
  'You liked 8 reviews this week.',
  'Two followers reacted to your recommendation list.',
  'Your watchlist grew by 4 titles.',
];

type MyPageDashboardProps = {
  activities?: string[];
  entriesLabel: string;
  emptyLabel: string;
  isDemo: boolean;
  logLabel: string;
  queueLabel: string;
  recentActivityLabel: string;
  reviews?: DashboardReview[];
  reviewSectionLabel: string;
  watchlist?: string[];
  watchlistLabel: string;
};

export default function MyPageDashboard({
  activities: actualActivities,
  entriesLabel,
  emptyLabel,
  isDemo,
  logLabel,
  queueLabel,
  recentActivityLabel,
  reviews: actualReviews,
  reviewSectionLabel,
  watchlist: actualWatchlist,
  watchlistLabel,
}: MyPageDashboardProps) {
  const reviews = actualReviews?.length ? actualReviews : isDemo ? reviewItems : [];
  const watchlist = actualWatchlist?.length ? actualWatchlist : isDemo ? watchlistItems : [];
  const activities = actualActivities?.length ? actualActivities : isDemo ? activityItems : [];

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <SectionCard className="p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{reviewSectionLabel}</h2>
          <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">
            {reviews.length} {entriesLabel}
          </span>
        </div>
        <div className="space-y-4">
          {reviews.length ? (
            reviews.map((item) => (
              <article key={item.title} className="border border-[#f0ead0]/10 bg-[#1c1c19] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-sm uppercase tracking-[0.08em] text-[#f0ead0]">{item.title}</h3>
                  <span className="text-[9px] uppercase tracking-[0.1em] text-[#8a8474]">{item.when}</span>
                </div>
                <p className="mt-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#c8c2a8]">
                  {item.note}
                </p>
              </article>
            ))
          ) : (
            <EmptyState title={emptyLabel} />
          )}
        </div>
      </SectionCard>

      <div className="space-y-6">
        <SectionCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{watchlistLabel}</h2>
            <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">{queueLabel}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchlist.length ? (
              watchlist.map((item) => (
                <span
                  key={item}
                  className="border border-[#d4a847]/30 bg-[#d4a847]/10 px-3 py-1 text-[10px] uppercase tracking-[0.08em] text-[#e6bf63]"
                >
                  {item}
                </span>
              ))
            ) : (
              <EmptyState title={emptyLabel} className="w-full" />
            )}
          </div>
        </SectionCard>

        <SectionCard className="p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{recentActivityLabel}</h2>
            <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">{logLabel}</span>
          </div>
          <div className="space-y-3">
            {activities.length ? (
              activities.map((item) => (
                <div key={item} className="border-l border-[#6bbf72] pl-3 text-sm text-[#c8c2a8]">
                  {item}
                </div>
              ))
            ) : (
              <EmptyState title={emptyLabel} />
            )}
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
