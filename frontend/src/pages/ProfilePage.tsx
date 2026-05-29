import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import ProfileCard from '../components/ProfileCard';
import ProfileEditForm from '../components/ProfileEditForm';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import type { ReviewItem } from '../components/ReviewCard';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import { updateProfile } from '../store/slices/authSlice';

const initialReviews: ReviewItem[] = [
  {
    id: 'poor-things',
    title: 'Poor Things',
    type: 'film',
    date: '2025.03.12',
    poster: '🎬',
    text: 'A deliriously chaotic triumph. Lanthimos at full throttle - grotesque, gorgeous, and genuinely funny.',
    rating: 4,
  },
  {
    id: 'dune-two',
    title: 'Dune: Part Two',
    type: 'film',
    date: '2025.02.28',
    poster: '📺',
    text: "Villeneuve's scale is unmatched. The Harkonnen arena sequence alone is worth the price of admission.",
    rating: 5,
  },
  {
    id: 'past-lives',
    title: 'Past Lives',
    type: 'film',
    date: '2024.12.05',
    poster: '🎞️',
    text: "Celine Song's debut is devastating in its restraint. The final scene will stay with you for weeks.",
    rating: 5,
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
  const displayUsername = user?.username?.trim() || 'demo';
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || displayUsername || 'User';
  const [activeTab, setActiveTab] = useState<TabKey>('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [reviews, setReviews] = useState(initialReviews);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? '');
  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    bio: user?.bio ?? t('home.profileBioDefault'),
  });
  const displayName = [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ') || displayUsername;

  if (!user) {
    return null;
  }

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || displayUsername.slice(0, 2).toUpperCase();

  const handleProfileSave = () => {
    dispatch(
      updateProfile({
        username: profileForm.username,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        bio: profileForm.bio,
        avatarUrl: avatarPreview || undefined,
      })
    );
    setIsEditing(false);
  };

  const handleProfileFormChange = (
    field: keyof typeof profileForm,
    value: string
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const profileStats = [
    { label: t('home.reviews'), value: '142' },
    { label: t('home.posts'), value: '27' },
    { label: t('home.watchlist'), value: '88' },
    { label: t('home.followers'), value: '31' },
  ];

  const settingsToggles = [
    {
      label: t('home.twoFactorAuth'),
      description: t('home.twoFactorAuthDesc'),
      value: twoFactorEnabled,
      onToggle: setTwoFactorEnabled,
    },
    {
      label: t('home.emailNotifications'),
      description: t('home.emailNotificationsDesc'),
      value: emailNotificationsEnabled,
      onToggle: setEmailNotificationsEnabled,
    },
  ];

  const handleReviewSubmit = (review: ReviewItem) => {
    setReviews((prev) => [review, ...prev]);
  };

  const handleAvatarSelect = (file: File | null) => {
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatarPreview(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        <ProfileCard
          avatarAlt={t('home.avatarAlt')}
          avatarUrl={avatarPreview || undefined}
          bio={profileForm.bio}
          closeEditLabel={t('home.closeEdit')}
          displayName={displayName}
          displayUsername={displayUsername}
          editProfileLabel={t('home.editProfile')}
          initials={initials}
          isEditing={isEditing}
          joinedYearLabel={t('home.joinedYear')}
          onAvatarSelect={handleAvatarSelect}
          onToggleEdit={() => setIsEditing((prev) => !prev)}
          stats={profileStats}
          uploadAvatarLabel={t('home.uploadAvatar')}
          verifiedLabel={t('home.verifiedMember')}
        />

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
              <>
                <ReviewForm onSubmit={handleReviewSubmit} />
                <ReviewList reviews={reviews} />
              </>
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

          <ProfileEditForm
            bioLabel={t('home.bio')}
            changePasswordLabel={t('home.changePassword')}
            confirmNewPasswordLabel={t('home.confirmNewPassword')}
            currentPasswordLabel={t('home.currentPassword')}
            deleteAccountLabel={t('home.deleteAccount')}
            firstNameLabel={t('signup.firstName')}
            form={profileForm}
            isEditing={isEditing}
            lastNameLabel={t('signup.lastName')}
            newPasswordLabel={t('home.newPassword')}
            onChange={handleProfileFormChange}
            onSave={handleProfileSave}
            passwordSectionLabel={t('home.passwordSection')}
            saveLabel={t('home.saveChanges')}
            sectionTitle={t('home.editPanelTitle')}
            settingsTitle={t('home.accountSettings')}
            toggles={settingsToggles}
            twoFactorDescription={t('home.twoFactorAuthDesc')}
            twoFactorLabel={t('home.twoFactorAuth')}
            usernameLabel={t('home.username')}
          />
        </div>
      </div>
    </section>
  );
}
