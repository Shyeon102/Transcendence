const reviewItems = [
  {
    title: 'The Substance',
    note: 'Body horror, dark satire, and a finale that escalates without apology.',
    when: '2 hours ago',
  },
  {
    title: 'Frieren',
    note: 'Quiet fantasy pacing done right. Episode arcs land with almost no wasted motion.',
    when: 'Yesterday',
  },
];

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
  emptyLabel: string;
  recentActivityLabel: string;
  reviewSectionLabel: string;
  watchlistLabel: string;
};

export default function MyPageDashboard({
  emptyLabel,
  recentActivityLabel,
  reviewSectionLabel,
  watchlistLabel,
}: MyPageDashboardProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{reviewSectionLabel}</h2>
          <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">02 entries</span>
        </div>
        <div className="space-y-4">
          {reviewItems.map((item) => (
            <article key={item.title} className="border border-[#f0ead0]/10 bg-[#1c1c19] p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm uppercase tracking-[0.08em] text-[#f0ead0]">{item.title}</h3>
                <span className="text-[9px] uppercase tracking-[0.1em] text-[#8a8474]">{item.when}</span>
              </div>
              <p className="mt-3 font-['IBM_Plex_Serif'] text-sm italic leading-6 text-[#c8c2a8]">
                {item.note}
              </p>
            </article>
          ))}
        </div>
      </section>

      <div className="space-y-6">
        <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{watchlistLabel}</h2>
            <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">queue</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {watchlistItems.length ? (
              watchlistItems.map((item) => (
                <span
                  key={item}
                  className="border border-[#d4a847]/30 bg-[#d4a847]/10 px-3 py-1 text-[10px] uppercase tracking-[0.08em] text-[#e6bf63]"
                >
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs italic text-[#8a8474]">{emptyLabel}</span>
            )}
          </div>
        </section>

        <section className="border border-[#f0ead0]/10 bg-[#141412] p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-['Bebas_Neue'] text-3xl tracking-[0.04em]">{recentActivityLabel}</h2>
            <span className="text-[9px] uppercase tracking-[0.14em] text-[#8a8474]">log</span>
          </div>
          <div className="space-y-3">
            {activityItems.length ? (
              activityItems.map((item) => (
                <div key={item} className="border-l border-[#6bbf72] pl-3 text-sm text-[#c8c2a8]">
                  {item}
                </div>
              ))
            ) : (
              <span className="text-xs italic text-[#8a8474]">{emptyLabel}</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
