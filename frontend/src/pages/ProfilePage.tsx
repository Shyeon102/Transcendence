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
import { useUpdateMeMutation } from '../store/api/authApi';
import { updateProfile } from '../store/slices/authSlice';

type TabKey = 'reviews' | 'watchlist';

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { t } = useI18n();
  const { id: profileId } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe] = useUpdateMeMutation();
  const displayUsername = user?.username?.trim() || '';
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim() || displayUsername || t('home.defaultDisplayName');
  const [activeTab, setActiveTab] = useState<TabKey>('reviews');
  const [isEditing, setIsEditing] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
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

  const isOwnProfile =
    !profileId ||
    profileId === 'me' ||
    profileId === String(user.id) ||
    profileId === user.username;

  const initials = fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('') || displayUsername.slice(0, 2).toUpperCase();
  const userWatchlist: readonly (readonly [string, string])[] = [];

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
      // Keep the edit panel behavior consistent even when the API reports an error.
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

  const profileStats = [
    { label: t('home.reviews'), value: String(reviews.length) },
    { label: t('home.watchlist'), value: String(userWatchlist.length) },
    { label: t('home.followers'), value: '0' },
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
        <ProfileCard
          avatarAlt={t('home.avatarAlt')}
          avatarUrl={avatarPreview || undefined}
          bio={profileForm.bio}
          canEdit={isOwnProfile}
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
                ['reviews', t('home.reviews'), String(reviews.length)],
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
                  reviews={reviews}
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
