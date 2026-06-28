import { useEffect, useState } from 'react';
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
  useGetMyPageDashboardQuery,
  useUpdateMeMutation,
} from '../store/api/authApi';
import { updateProfile } from '../store/slices/authSlice';

type TabKey = 'reviews' | 'watchlist';

type AuthUser = NonNullable<RootState['auth']['user']>;

type AuthUserWithDates = AuthUser & {
  createdAt?: string;
  joinedAt?: string;
};

type DashboardShape = {
  user?: AuthUser | null;
  reviews?: ReviewItem[];
};

type ProfileFormState = {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
};

const EMPTY_REVIEWS: ReviewItem[] = [];

const dateLocaleByLanguage = {
  ko: 'ko-KR',
  en: 'en-US',
  fr: 'fr-FR',
} as const;

const formatJoinedDate = (
  value: string | undefined,
  language: keyof typeof dateLocaleByLanguage
) => {
  if (!value) {
    return '';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  return date.toLocaleDateString(dateLocaleByLanguage[language], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

const buildProfileForm = (
  user: Partial<AuthUser> | null | undefined,
  defaultBio: string
): ProfileFormState => ({
  username: user?.username ?? '',
  firstName: user?.firstName ?? '',
  lastName: user?.lastName ?? '',
  bio: user?.bio ?? defaultBio,
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { language, t } = useI18n();
  const { id: profileId } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe] = useUpdateMeMutation();

  const defaultProfileBio = t('home.profileBioDefault');

  const isOwnProfileRequest =
    !profileId ||
    profileId === 'me' ||
    profileId === String(user?.id) ||
    profileId === user?.username;

  const { data: dashboard } = useGetMyPageDashboardQuery(undefined, {
    skip: !user || !isOwnProfileRequest,
  });

  const dashboardData = dashboard as DashboardShape | undefined;
  const dashboardUser = dashboardData?.user ?? null;
  const dashboardReviews = dashboardData?.reviews ?? EMPTY_REVIEWS;

  const [activeTab, setActiveTab] = useState<TabKey>('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [emailNotificationsEnabled, setEmailNotificationsEnabled] =
    useState(true);
  const [localReviews, setLocalReviews] = useState<ReviewItem[] | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() =>
    buildProfileForm(user, defaultProfileBio)
  );

  useEffect(() => {
    if (dashboardUser) {
      dispatch(updateProfile(dashboardUser));
    }
  }, [dispatch, dashboardUser]);

  if (!user) {
    return null;
  }

  const profileUser = user;
  const profileUserWithDates = profileUser as AuthUserWithDates;

  const safeLanguage = Object.prototype.hasOwnProperty.call(
    dateLocaleByLanguage,
    language
  )
    ? (language as keyof typeof dateLocaleByLanguage)
    : 'en';

  const savedDisplayUsername = profileUser.username?.trim() || '';
  const formDisplayUsername =
    profileForm.username.trim() || savedDisplayUsername;

  const savedDisplayName =
    [profileUser.firstName, profileUser.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    savedDisplayUsername ||
    t('home.defaultDisplayName');

  const formDisplayName =
    [profileForm.firstName, profileForm.lastName]
      .filter(Boolean)
      .join(' ')
      .trim() ||
    formDisplayUsername ||
    t('home.defaultDisplayName');

  const displayUsername = isEditing
    ? formDisplayUsername
    : savedDisplayUsername;

  const profileDisplayName = isEditing ? formDisplayName : savedDisplayName;

  const profileBio = isEditing
    ? profileForm.bio || defaultProfileBio
    : profileUser.bio || defaultProfileBio;

  const profileAvatarUrl =
    (isEditing ? avatarPreview : null) ?? profileUser.avatarUrl ?? '';

  const joinedLabel = formatJoinedDate(
    profileUserWithDates.createdAt ?? profileUserWithDates.joinedAt,
    safeLanguage
  );

  const isOwnProfile =
    !profileId ||
    profileId === 'me' ||
    profileId === String(user.id) ||
    profileId === user.username;

  const initials =
    profileDisplayName
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('') || displayUsername.slice(0, 2).toUpperCase();

  const userReviews = localReviews ?? dashboardReviews;
  const userWatchlist: readonly (readonly [string, string])[] = [];

  const handleToggleEdit = () => {
    if (isEditing) {
      setProfileForm(buildProfileForm(profileUser, defaultProfileBio));
      setAvatarPreview(null);
      setIsEditing(false);
      return;
    }

    setProfileForm(buildProfileForm(profileUser, defaultProfileBio));
    setAvatarPreview(profileUser.avatarUrl ?? null);
    setIsEditing(true);
  };

  const handleProfileSave = async () => {
    const avatarUrl =
      avatarPreview && /^https?:\/\//.test(avatarPreview)
        ? avatarPreview
        : undefined;

    const payload = {
      username: profileForm.username,
      firstName: profileForm.firstName,
      lastName: profileForm.lastName,
      bio: profileForm.bio,
      avatarUrl,
    };

    try {
      const response = await updateMe(payload).unwrap();

      const updatedUser =
        (response as { user?: AuthUser } | null | undefined)?.user ??
        (response as AuthUser);

      dispatch(updateProfile(updatedUser));
    } catch {
      // Keep the edit panel behavior consistent even when the API reports an error.
    } finally {
      setAvatarPreview(null);
      setIsEditing(false);
    }
  };

  const handleProfileFormChange = (
    field: keyof typeof profileForm,
    value: string
  ) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const profileStats = [
    { label: t('home.reviews'), value: String(userReviews.length) },
    { label: t('home.watchlist'), value: String(userWatchlist.length) },
    { label: t('home.followers'), value: '0' },
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
    setLocalReviews((prev) => [review, ...(prev ?? dashboardReviews)]);
  };

  const handleReviewDelete = (reviewId: string) => {
    setLocalReviews((prev) =>
      (prev ?? dashboardReviews).filter((review) => review.id !== reviewId)
    );
  };

  const handleReviewEdit = (review: ReviewItem) => {
    setLocalReviews((prev) =>
      (prev ?? dashboardReviews).map((item) =>
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
        <ProfileCard
          avatarAlt={t('home.avatarAlt')}
          avatarUrl={profileAvatarUrl || undefined}
          bio={profileBio}
          canEdit={isOwnProfile}
          closeEditLabel={t('home.closeEdit')}
          displayName={profileDisplayName}
          displayUsername={displayUsername}
          editProfileLabel={t('home.editProfile')}
          initials={initials}
          isEditing={isEditing}
          joinedYearLabel={joinedLabel}
          onAvatarSelect={handleAvatarSelect}
          onToggleEdit={handleToggleEdit}
          stats={profileStats}
          uploadAvatarLabel={t('home.uploadAvatar')}
          verifiedLabel={t('home.verifiedMember')}
        />

        <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-7 flex border-b border-[#f0ead0]/10">
              {[
                ['reviews', t('home.reviews'), String(userReviews.length)],
                ['watchlist', t('home.watchlist'), String(userWatchlist.length)],
              ].map(([key, label, count]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key as TabKey)}
                  className={`relative -bottom-px shrink-0 border-b-2 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition ${
                    activeTab === key
                      ? 'border-[#d63e2a] text-[#f0ead0]'
                      : 'border-transparent text-[#8a8474] hover:text-[#c8c2a8]'
                  }`}
                >
                  {label}{' '}
                  <span
                    className={
                      activeTab === key ? 'text-[#d63e2a]' : 'text-[#8a8474]'
                    }
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {activeTab === 'reviews' ? (
              <>
                {isOwnProfile ? <ReviewForm onSubmit={handleReviewSubmit} /> : null}

                <ReviewList
                  onDelete={isOwnProfile ? handleReviewDelete : undefined}
                  onEdit={isOwnProfile ? handleReviewEdit : undefined}
                  reviews={userReviews}
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
      </div>
    </section>
  );
}