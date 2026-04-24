import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';

const reviews = [
  {
    title: 'Poor Things',
    type: 'film',
    date: '2025.03.12',
    poster: '🎬',
    text: 'A deliriously chaotic triumph. Lanthimos at full throttle - grotesque, gorgeous, and genuinely funny.',
    stars: '★★★★☆',
  },
  {
    title: 'Dune: Part Two',
    type: 'film',
    date: '2025.02.28',
    poster: '📺',
    text: "Villeneuve's scale is unmatched. The Harkonnen arena sequence alone is worth the price of admission.",
    stars: '★★★★★',
  },
  {
    title: 'Past Lives',
    type: 'film',
    date: '2024.12.05',
    poster: '🎞️',
    text: "Celine Song's debut is devastating in its restraint. The final scene will stay with you for weeks.",
    stars: '★★★★★',
  },
];

const posts = [
  {
    board: '추천게시판',
    theme: 'recommend',
    title: 'A24 영화 입문하려는 분들께 꼭 봐야 할 순서 추천합니다',
    body: '처음 A24를 접하는 분들이 많이 물어보셔서 제가 생각하는 최적의 감상 순서를 정리해봤습니다.',
    likes: 84,
    comments: 31,
    views: '1.2k',
    date: '2025.04.02',
  },
  {
    board: '자유게시판',
    theme: 'free',
    title: 'Dune Part Two IMAX로 봤는데 진짜 압도적이었습니다',
    body: 'CGV 용산 IMAX로 봤는데 음향이 진짜 강했습니다. 이건 무조건 극장에서 봐야 하는 영화입니다.',
    likes: 52,
    comments: 18,
    views: '876',
    date: '2025.03.20',
  },
  {
    board: '정보게시판',
    theme: 'info',
    title: '빌뇌브 감독 필모그래피 완전 정복 - 데뷔작부터 Dune까지',
    body: '드니 빌뇌브가 어떻게 할리우드 최정상 SF 감독이 됐는지 초기작부터 최근작까지 정리했습니다.',
    likes: 117,
    comments: 44,
    views: '2.4k',
    date: '2025.02.11',
  },
];

const watchlist = [
  ['🎬', 'Joker 2'],
  ['📽️', 'The Zone'],
  ['🎞️', 'Barbie'],
  ['🎥', 'Past Lives'],
  ['📺', 'Deadpool 3'],
  ['🎬', 'It · Part 2'],
  ['🎞️', 'Captain M.'],
  ['📽️', 'Scream VII'],
  ['🎥', '+80 more'],
] as const;

type TabKey = 'reviews' | 'posts' | 'watchlist';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const user = useSelector((state: RootState) => state.auth.user);
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || user?.username || 'User';
  const [activeTab, setActiveTab] = useState<TabKey>('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? 'jaeho_42',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    bio: user?.bio ?? t('home.profileBioDefault'),
  });

  if (!user) {
    return null;
  }

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || user.username.slice(0, 2).toUpperCase();

  const handleProfileSave = () => {
    dispatch(
      updateProfile({
        username: profileForm.username,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        bio: profileForm.bio,
      })
    );
    setIsEditing(false);
  };

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-10 border-b border-[#f0ead0]/10 pb-10 lg:grid-cols-[110px_1fr_auto]">
          <div className="relative h-[110px] w-[110px]">
            <div className="relative flex h-[110px] w-[110px] items-center justify-center overflow-hidden border-2 border-[#f0ead0]/25 bg-[#1c1c19] font-['Bebas_Neue'] text-[44px] tracking-[0.05em] text-[#c8c2a8]">
              <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(240,234,210,0.02)_3px,rgba(240,234,210,0.02)_6px)]" />
              <span className="relative z-10">{initials}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center border-2 border-[#0c0c0b] bg-[#d63e2a] text-[11px]"
            >
              ✎
            </button>
          </div>

          <div>
            <span className="mb-3 inline-block border border-[#d63e2a]/20 bg-[#d63e2a]/15 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#ff4f38]">
              {t('home.verifiedMember')}
            </span>
            <h1 className="mb-2 font-['Bebas_Neue'] text-[46px] leading-none tracking-[0.03em]">
              {([profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ') || user.username).toUpperCase()}
            </h1>
            <p className="mb-3 text-xs tracking-[0.08em] text-[#8a8474]">@{user.username} · {t('home.joinedYear')}</p>
            <p className="max-w-[440px] font-['IBM_Plex_Serif'] text-sm font-light italic leading-7 text-[#c8c2a8]">
              {profileForm.bio}
            </p>
          </div>

          <div className="flex flex-wrap items-start gap-6 lg:flex-col lg:items-end">
            <button
              type="button"
              onClick={() => setIsEditing((prev) => !prev)}
              className={`border px-5 py-2 text-[10px] uppercase tracking-[0.12em] transition ${
                isEditing
                  ? 'border-[#d63e2a] bg-[#d63e2a] text-[#f0ead0]'
                  : 'border-[#f0ead0]/25 text-[#c8c2a8] hover:border-[#f0ead0] hover:text-[#f0ead0]'
              }`}
            >
              {isEditing ? `✕ ${t('home.closeEdit')}` : t('home.editProfile')}
            </button>

            {[
              [t('home.reviews'), '142'],
              [t('home.posts'), '27'],
              [t('home.watchlist'), '88'],
              [t('home.followers'), '31'],
            ].map(([label, value]) => (
              <div key={label} className="min-w-[88px] text-left lg:text-right">
                <div className="font-['Bebas_Neue'] text-4xl leading-none tracking-[0.05em]">{value}</div>
                <div className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-7 flex border-b border-[#f0ead0]/10">
              {[
                ['reviews', t('home.reviews'), '142'],
                ['posts', t('home.communityPosts'), '27'],
                ['watchlist', t('home.watchlist'), '88'],
              ].map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`relative -bottom-px shrink-0 border-b-2 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition ${
                    activeTab === key ? 'border-[#d63e2a] text-[#f0ead0]' : 'border-transparent text-[#8a8474] hover:text-[#c8c2a8]'
                  }`}
                >
                  {label} <span className={activeTab === key ? 'text-[#d63e2a]' : 'text-[#8a8474]'}>{count}</span>
                </button>
              ))}
            </div>

            {activeTab === 'reviews' ? (
              <div className="space-y-3">
                {reviews.map((review) => (
                  <article
                    key={review.title}
                    className="grid gap-4 border border-[#f0ead0]/10 bg-[#141412] px-5 py-4 transition hover:border-[#f0ead0]/25 md:grid-cols-[42px_1fr_auto]"
                  >
                    <div className="flex h-[60px] w-[42px] items-center justify-center border border-[#f0ead0]/10 bg-[#1c1c19] text-lg">
                      {review.poster}
                    </div>
                    <div>
                      <h2 className="mb-1 text-xs font-bold uppercase tracking-[0.06em]">{review.title}</h2>
                      <p className="font-['IBM_Plex_Serif'] text-[13px] font-light italic leading-6 text-[#c8c2a8]">
                        {review.text}
                      </p>
                      <p className="mt-2 flex gap-3 text-[9px] tracking-[0.08em] text-[#8a8474]">
                        <span>{review.date}</span>
                        <span>·</span>
                        <span>{review.type}</span>
                      </p>
                    </div>
                    <div className="text-[11px] text-[#d4a847]">{review.stars}</div>
                  </article>
                ))}
              </div>
            ) : null}

            {activeTab === 'posts' ? (
              <div className="space-y-3">
                {posts.map((post) => (
                  <article
                    key={post.title}
                    className="border border-[#f0ead0]/10 bg-[#141412] px-5 py-[18px] transition hover:border-[#f0ead0]/25"
                  >
                    <div className="mb-2">
                      <span
                        className={`inline-block border px-2.5 py-1 text-[8px] uppercase tracking-[0.14em] ${
                          post.theme === 'recommend'
                            ? 'border-[#d4a847]/30 bg-[#d4a847]/10 text-[#d4a847]'
                            : post.theme === 'info'
                              ? 'border-[#6bbf72]/30 bg-[#6bbf72]/10 text-[#6bbf72]'
                              : 'border-[#f0ead0]/10 text-[#8a8474]'
                        }`}
                      >
                        {post.board}
                      </span>
                    </div>
                    <h2 className="mb-2 text-[13px] font-bold leading-6 tracking-[0.04em]">{post.title}</h2>
                    <p className="mb-3 font-['IBM_Plex_Serif'] text-xs font-light italic leading-6 text-[#8a8474]">
                      {post.body}
                    </p>
                    <div className="flex flex-wrap items-center gap-4 text-[9px] tracking-[0.08em] text-[#8a8474]">
                      <span>♡ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                      <span>👁 {post.views}</span>
                      <span className="ml-auto">{post.date}</span>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}

            {activeTab === 'watchlist' ? (
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {watchlist.map(([icon, label]) => (
                  <div
                    key={label}
                    className="relative flex aspect-[2/3] items-center justify-center overflow-hidden border border-[#f0ead0]/10 bg-[#1c1c19] text-[22px] transition hover:border-[#f0ead0]/25"
                  >
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(-45deg,transparent,transparent_4px,rgba(240,234,210,0.02)_4px,rgba(240,234,210,0.02)_8px)]" />
                    <span className="relative z-10">{icon}</span>
                    <span className="absolute inset-x-0 bottom-0 bg-[#0c0c0b]/85 px-2 py-1 text-center text-[8px] uppercase tracking-[0.1em] text-[#c8c2a8]">
                      {label}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <aside>
            {isEditing ? (
              <div className="mb-7 border border-[#f0ead0]/10 bg-[#141412] p-7">
                <div className="mb-5 text-[10px] uppercase tracking-[0.18em] text-[#d63e2a]">▶ {t('home.editPanelTitle')}</div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">
                    {t('signup.firstName')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.firstName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, firstName: e.target.value }))}
                    className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs text-[#f0ead0] outline-none transition focus:border-[#f0ead0]/25"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">
                    {t('signup.lastName')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.lastName}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, lastName: e.target.value }))}
                    className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs text-[#f0ead0] outline-none transition focus:border-[#f0ead0]/25"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">
                    {t('home.username')}
                  </label>
                  <input
                    type="text"
                    value={profileForm.username}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                    className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs text-[#f0ead0] outline-none transition focus:border-[#f0ead0]/25"
                  />
                </div>

                <div className="mb-4">
                  <label className="mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{t('home.bio')}</label>
                  <textarea
                    value={profileForm.bio}
                    onChange={(e) => setProfileForm((prev) => ({ ...prev, bio: e.target.value }))}
                    className="min-h-24 w-full resize-y border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs leading-6 text-[#f0ead0] outline-none transition focus:border-[#f0ead0]/25"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleProfileSave}
                  className="w-full border border-[#f0ead0]/25 bg-[#1c1c19] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:border-[#d63e2a] hover:bg-[#d63e2a]"
                >
                  {t('home.saveChanges')}
                </button>
              </div>
            ) : null}

            <div>
              <div className="mb-5 flex items-center gap-4">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">{t('home.accountSettings')}</span>
                <div className="h-px flex-1 bg-[#f0ead0]/10" />
              </div>

              {[
                [t('home.twoFactorAuth'), t('home.twoFactorAuthDesc'), twoFactorEnabled, setTwoFactorEnabled],
                [t('home.emailNotifications'), t('home.emailNotificationsDesc'), emailNotificationsEnabled, setEmailNotificationsEnabled],
              ].map(([label, description, value, setter]) => (
                <div
                  key={label as string}
                  className="flex items-center justify-between gap-3 border-b border-[#f0ead0]/10 py-4"
                >
                  <div>
                    <div className="text-[11px] tracking-[0.08em] text-[#c8c2a8]">{label as string}</div>
                    <div className="mt-1 text-[9px] tracking-[0.06em] text-[#8a8474]">{description as string}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => (setter as React.Dispatch<React.SetStateAction<boolean>>)((prev) => !prev)}
                    className={`relative h-[18px] w-[34px] rounded-full border transition ${
                      value ? 'border-[#d63e2a] bg-[#d63e2a]' : 'border-[#f0ead0]/25 bg-[#1c1c19]'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#f0ead0] transition ${
                        value ? 'left-5' : 'left-0.5'
                      }`}
                    />
                  </button>
                </div>
              ))}

              <div className="mt-7">
                <div className="mb-5 flex items-center gap-4">
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">{t('home.passwordSection')}</span>
                  <div className="h-px flex-1 bg-[#f0ead0]/10" />
                </div>

                <div className="space-y-4">
                  {[t('home.currentPassword'), t('home.newPassword'), t('home.confirmNewPassword')].map((label) => (
                    <div key={label}>
                      <label className="mb-1.5 block text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{label}</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-3 py-2.5 text-xs text-[#f0ead0] outline-none transition focus:border-[#f0ead0]/25"
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  className="mt-4 w-full border border-[#f0ead0]/25 bg-[#1c1c19] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:border-[#d63e2a] hover:bg-[#d63e2a]"
                >
                  {t('home.changePassword')}
                </button>
              </div>

              <div className="mt-7 border-t border-[#f0ead0]/10 pt-7">
                <button
                  type="button"
                  className="w-full border border-[#d63e2a]/30 bg-transparent px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-[#d63e2a]/70 transition hover:border-[#d63e2a] hover:text-[#ff4f38]"
                >
                  ⚠ {t('home.deleteAccount')}
                </button>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
