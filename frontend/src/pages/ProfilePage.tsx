import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard';
import ProfileEditForm from '../components/ProfileEditForm';
import ReviewForm from '../components/ReviewForm';
import ReviewList from '../components/ReviewList';
import EmptyState from '../components/ui/EmptyState';
import type { ReviewItem } from '../components/ReviewCard';
import { useI18n } from '../lib/i18n';
import type { RootState } from '../store';
import {
  useFollowUserMutation,
  useGetPublicProfileQuery,
  useUnfollowUserMutation,
  useUpdateMeMutation,
} from '../store/api/authApi';
import { updateProfile } from '../store/slices/authSlice';
import type { MediaReview } from '../types';

const initialReviews: ReviewItem[] = [
  {
    id: 'poor-things',
    title: 'Poor Things',
    type: 'film',
    date: '2025.03.12',
    poster: '🎬',
    text: 'A deliriously chaotic triumph. Lanthimos at full throttle - grotesque, gorgeous, and genuinely funny.',
    rating: 4,
    visibility: 'public',
    isOwn: true,
  },
  {
    id: 'dune-two',
    title: 'Dune: Part Two',
    type: 'film',
    date: '2025.02.28',
    poster: '📺',
    text: "Villeneuve's scale is unmatched. The Harkonnen arena sequence alone is worth the price of admission.",
    rating: 5,
    visibility: 'followers',
    isOwn: true,
  },
  {
    id: 'past-lives',
    title: 'Past Lives',
    type: 'film',
    date: '2024.12.05',
    poster: '🎞️',
    text: "Celine Song's debut is devastating in its restraint. The final scene will stay with you for weeks.",
    rating: 5,
    visibility: 'private',
    isOwn: true,
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

type TabKey = 'reviews' | 'watchlist';

const toReviewItem = (review: MediaReview): ReviewItem => ({
  id: String(review.id),
  title: review.mediaTitle || 'Review',
  type: 'review',
  date: review.createdAt,
  poster: '🎬',
  text: review.content,
  rating: review.rating,
  visibility: review.visibility,
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { id: profileId } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe] = useUpdateMeMutation();
  const [followUser, followState] = useFollowUserMutation();
  const [unfollowUser, unfollowState] = useUnfollowUserMutation();
  const isDemo = user?.username === 'demo';
  const displayUsername = user?.username?.trim() || '';
  const [activeTab, setActiveTab] = useState<TabKey>('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] = useState(true);
  const [reviews, setReviews] = useState<ReviewItem[]>(isDemo ? initialReviews : []);
  const [avatarPreview, setAvatarPreview] = useState(user?.avatarUrl ?? '');
  const [profileForm, setProfileForm] = useState({
    username: user?.username ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    bio: user?.bio ?? t('home.profileBioDefault'),
  });

  const isOwnProfile =
    !profileId ||
    profileId === 'me' ||
    profileId === String(user?.id) ||
    profileId === user?.username;
  const routeUserId = profileId && /^\d+$/.test(profileId) ? Number(profileId) : undefined;
  const viewedUserId = isOwnProfile ? user?.id : routeUserId;
  const shouldFetchViewedProfile = Boolean(user && viewedUserId);
  const {
    data: viewedProfile,
    isError: isViewedProfileError,
    isLoading: isViewedProfileLoading,
  } = useGetPublicProfileQuery(viewedUserId ?? 0, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    skip: !shouldFetchViewedProfile,
  });

  if (!user) {
    return null;
  }

  const cannotLoadPublicProfile = !isOwnProfile && !routeUserId;
  const isPublicProfile = !isOwnProfile;
  const shouldBlockForProfileLoad = isPublicProfile && isViewedProfileLoading;
  const shouldBlockForProfileError = cannotLoadPublicProfile || (isPublicProfile && isViewedProfileError);
  const profileUsername = isPublicProfile ? viewedProfile?.username ?? '' : displayUsername;
  const profileBio = isPublicProfile ? viewedProfile?.bio ?? '' : profileForm.bio;
  const profileAvatarUrl = isPublicProfile ? viewedProfile?.avatarUrl : avatarPreview || undefined;
  const profileDisplayName = isPublicProfile
    ? profileUsername || t('home.defaultDisplayName')
    : [profileForm.firstName, profileForm.lastName].filter(Boolean).join(' ') || displayUsername;
  const fullName = isPublicProfile
    ? profileDisplayName
    : [user.firstName, user.lastName].filter(Boolean).join(' ').trim() || displayUsername || t('home.defaultDisplayName');
  const visibleReviews = isPublicProfile
    ? viewedProfile?.reviews.map(toReviewItem) ?? []
    : reviews;

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || profileUsername.slice(0, 2).toUpperCase();
  const userWatchlist = isDemo ? watchlist : [];

  const handleToggleFollow = async () => {
    if (!routeUserId || !viewedProfile || isOwnProfile) {
      return;
    }

    if (viewedProfile.isFollowing) {
      await unfollowUser(routeUserId);
      return;
    }

    await followUser(routeUserId);
  };

  const handleProfileSave = async () => {
    const payload = {
      username: profileForm.username,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      bio: profileForm.bio,
      avatarUrl: /^https?:\/\//.test(avatarPreview) ? avatarPreview : undefined,
    };

    try {
      const updatedUser = await updateMe(payload).unwrap();
      dispatch(updateProfile(updatedUser));
    } catch {
      if (isDemo) {
        dispatch(updateProfile(payload));
      }
    } finally {
      setIsEditing(false);
    }
  };

  const handleProfileFormChange = (
    field: keyof typeof profileForm,
    value: string
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const displayedFollowersCount = isPublicProfile
    ? viewedProfile?.followersCount ?? 0
    : viewedProfile?.followersCount ?? user.followersCount ?? (isDemo ? 31 : 0);

  const profileStats = [
    { label: t('home.reviews'), value: String(visibleReviews.length) },
    { label: t('home.watchlist'), value: String(userWatchlist.length) },
    { label: t('home.followers'), value: String(displayedFollowersCount) },
  ];

  const settingsToggles = [
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

  const handleReviewDelete = (reviewId: string) => {
    setReviews((prev) => prev.filter((review) => review.id !== reviewId));
  };

  const handleReviewEdit = (review: ReviewItem) => {
    setReviews((prev) =>
      prev.map((item) =>
        item.id === review.id
          ? { ...item, text: `${item.text} ${t('review.editDraftSuffix')}` }
          : item
      )
    );
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
        {shouldBlockForProfileLoad ? (
          <EmptyState title={t('main.loading')} />
        ) : null}

        {shouldBlockForProfileError ? (
          <EmptyState title={t('home.profileLoadError')} />
        ) : null}

        {!shouldBlockForProfileLoad && !shouldBlockForProfileError ? (
          <>
            <ProfileCard
              avatarAlt={t('home.avatarAlt')}
              avatarUrl={profileAvatarUrl}
              bio={profileBio}
              canEdit={isOwnProfile}
              canFollow={isPublicProfile && Boolean(viewedProfile)}
              closeEditLabel={t('home.closeEdit')}
              displayName={profileDisplayName}
              displayUsername={profileUsername}
              editProfileLabel={t('home.editProfile')}
              followLabel={t('home.follow')}
              initials={initials}
              isFollowLoading={followState.isLoading || unfollowState.isLoading}
              isFollowing={viewedProfile?.isFollowing ?? false}
              isEditing={isEditing}
              joinedYearLabel={t('home.joinedYear')}
              onAvatarSelect={handleAvatarSelect}
              onToggleFollow={handleToggleFollow}
              onToggleEdit={() => setIsEditing((prev) => !prev)}
              stats={profileStats}
              unfollowLabel={t('home.following')}
              uploadAvatarLabel={t('home.uploadAvatar')}
              verifiedLabel={t('home.verifiedMember')}
            />

            <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="mb-7 flex border-b border-[#f0ead0]/10">
                  {[
                    ['reviews', t('home.reviews'), String(visibleReviews.length)],
                    ['watchlist', t('home.watchlist'), String(userWatchlist.length)],
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
                    {isOwnProfile ? <ReviewForm onSubmit={handleReviewSubmit} /> : null}
                    <ReviewList
                      onDelete={isOwnProfile ? handleReviewDelete : undefined}
                      onEdit={isOwnProfile ? handleReviewEdit : undefined}
                      reviews={visibleReviews}
                    />
                  </>
                ) : null}

                {activeTab === 'watchlist' ? (
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {userWatchlist.length ? (
                      userWatchlist.map(([icon, label]) => (
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
                      ))
                    ) : (
                      <EmptyState title={t('mypage.empty')} />
                    )}
                  </div>
                ) : null}
              </div>

              {isOwnProfile ? (
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
                  usernameLabel={t('home.username')}
                />
              ) : (
                <aside className="border border-[#f0ead0]/10 bg-[#141412] p-6 text-sm leading-6 text-[#8a8474]">
                  {t('home.publicProfilePlaceholder')}
                </aside>
              )}
            </div>
          </>
        ) : null}
      </div>
    </section>
  );
}
