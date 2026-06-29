import ReviewEditModal from "../components/ReviewEditModal";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useParams } from "react-router-dom";
import ProfileCard from "../components/ProfileCard";
import ProfileEditForm from "../components/ProfileEditForm";
import ReviewForm from "../components/ReviewForm";
import ReviewList from "../components/ReviewList";
import EmptyState from "../components/ui/EmptyState";
import type { ReviewItem, ReviewVisibility } from "../components/ReviewCard";
import { useI18n } from "../lib/i18n";
import type { RootState } from "../store";
import {
  useFollowUserMutation,
  useGetMeQuery,
  useGetPublicProfileQuery,
  useGetUserFollowersQuery,
  useUnfollowUserMutation,
  useGetMyPageDashboardQuery,
  useCreateMediaReviewMutation,
  useDeleteMediaReviewMutation,
  useUpdateMediaReviewMutation,
  useUpdateMeMutation,
} from "../store/api/authApi";
import { updateProfile } from "../store/slices/authSlice";
import type { MediaReview } from "../types";

type TabKey = "reviews" | "watchlist" | "followers";

const toReviewItem = (review: MediaReview): ReviewItem => ({
  id: String(review.id),
  mediaId: review.mediaId,
  title: review.mediaTitle || "Review",
  type: "review",
  date: review.createdAt,
  poster: "🎬",
  text: review.content,
  rating: review.rating,
  visibility: review.visibility,
});

type AuthUser = NonNullable<RootState["auth"]["user"]>;

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
  ko: "ko-KR",
  en: "en-US",
  fr: "fr-FR",
} as const;

const formatJoinedDate = (
  value: string | undefined,
  language: keyof typeof dateLocaleByLanguage,
) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString(dateLocaleByLanguage[language], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

const buildProfileForm = (
  user: Partial<AuthUser> | null | undefined,
  defaultBio: string,
): ProfileFormState => ({
  username: user?.username ?? "",
  firstName: user?.firstName ?? "",
  lastName: user?.lastName ?? "",
  bio: user?.bio ?? defaultBio,
});

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { language, t } = useI18n();
  const { id: profileId } = useParams();
  const user = useSelector((state: RootState) => state.auth.user);
  const [updateMe] = useUpdateMeMutation();
  const [followUser, followState] = useFollowUserMutation();
  const [unfollowUser, unfollowState] = useUnfollowUserMutation();
  const [editingReview, setEditingReview] = useState<ReviewItem | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>("reviews");

  const defaultProfileBio = t("home.profileBioDefault");

  const isOwnProfile =
    !profileId ||
    profileId === "me" ||
    profileId === String(user?.id) ||
    profileId === user?.username;

  const isPublicProfile = !isOwnProfile;

  const routeUserId =
    profileId && /^\d+$/.test(profileId) ? Number(profileId) : undefined;

  const followerListUserId = isPublicProfile ? routeUserId : user?.id;

  const cannotLoadPublicProfile = isPublicProfile && !routeUserId;

  const shouldFetchViewedProfile = Boolean(
    user && isPublicProfile && routeUserId,
  );

  const {
    data: viewedProfile,
    isError: isViewedProfileError,
    isLoading: isViewedProfileLoading,
  } = useGetPublicProfileQuery(routeUserId ?? 0, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    skip: !shouldFetchViewedProfile,
  });

  const { data: meProfile } = useGetMeQuery(undefined, {
    pollingInterval: 3000,
    refetchOnFocus: true,
    refetchOnMountOrArgChange: true,
    refetchOnReconnect: true,
    skip: !user || !isOwnProfile,
  });

  const [createReview] = useCreateMediaReviewMutation();

  const [deleteReviewMutation] = useDeleteMediaReviewMutation();
  const [updateReviewMutation] = useUpdateMediaReviewMutation();

  const { data: dashboard, refetch: refetchDashboard } =
    useGetMyPageDashboardQuery(undefined, {
      refetchOnMountOrArgChange: true,
      skip: !user || !isOwnProfile,
    });

  const {
    data: followers = [],
    isError: isFollowersError,
    isFetching: isFollowersFetching,
  } = useGetUserFollowersQuery(followerListUserId ?? 0, {
    skip: !user || !followerListUserId || activeTab !== "followers",
  });

  const dashboardData = dashboard as DashboardShape | undefined;
  const dashboardUser = dashboardData?.user ?? null;
  const dashboardReviews = dashboardData?.reviews ?? EMPTY_REVIEWS;

  const [reviewSearch, setReviewSearch] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saveError, setSaveError] = useState('');
  const [profileForm, setProfileForm] = useState<ProfileFormState>(() =>
    buildProfileForm(user, defaultProfileBio),
  );

  useEffect(() => {
    if (dashboardUser) {
      dispatch(updateProfile(dashboardUser));
    }
  }, [dispatch, dashboardUser]);

  useEffect(() => {
    if (meProfile) {
      dispatch(updateProfile(meProfile));
    }
  }, [dispatch, meProfile]);

  if (!user) {
    return null;
  }

  if (isPublicProfile && !viewedProfile) {
    return <EmptyState title={t("main.loading")} />;
  }

  const profileUser = meProfile ?? dashboardUser ?? user;
  const profileUserWithDates = profileUser as AuthUserWithDates;

  const safeLanguage = Object.prototype.hasOwnProperty.call(
    dateLocaleByLanguage,
    language,
  )
    ? (language as keyof typeof dateLocaleByLanguage)
    : "en";

  const savedDisplayUsername = profileUser.username?.trim() || "";
  const formDisplayUsername =
    profileForm.username.trim() || savedDisplayUsername;

  const savedDisplayName =
    [profileUser.firstName, profileUser.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    savedDisplayUsername ||
    t("home.defaultDisplayName");

  const formDisplayName =
    [profileForm.firstName, profileForm.lastName]
      .filter(Boolean)
      .join(" ")
      .trim() ||
    formDisplayUsername ||
    t("home.defaultDisplayName");

  const ownDisplayUsername = isEditing
    ? formDisplayUsername
    : savedDisplayUsername;

  const publicDisplayUsername = viewedProfile?.username?.trim() || "";

  const displayUsername = isPublicProfile
    ? publicDisplayUsername
    : ownDisplayUsername;

  const ownDisplayName = isEditing ? formDisplayName : savedDisplayName;

  const publicDisplayName =
    publicDisplayUsername || t("home.defaultDisplayName");

  const profileDisplayName = isPublicProfile
    ? publicDisplayName
    : ownDisplayName;

  const displayedProfileUserId =
    isPublicProfile && viewedProfile ? viewedProfile.id : profileUser.id;

  const profileBio = isPublicProfile
    ? (viewedProfile?.bio ?? "")
    : isEditing
      ? profileForm.bio || defaultProfileBio
      : profileUser.bio || defaultProfileBio;

  const profileAvatarUrl = isPublicProfile
    ? (viewedProfile?.avatarUrl ?? "")
    : ((isEditing ? avatarPreview : null) ?? profileUser.avatarUrl ?? "");

  const joinedLabel = isPublicProfile
    ? t("home.joinedYear")
    : formatJoinedDate(
        profileUserWithDates.createdAt ?? profileUserWithDates.joinedAt,
        safeLanguage,
      );

  const userReviews = dashboardReviews;

  const visibleReviews = isPublicProfile
    ? (viewedProfile?.reviews.map(toReviewItem) ?? [])
    : userReviews.map((r) => ({ ...r, isOwn: true }));

  // 리뷰를 미디어 제목으로 검색 (ReviewItem.title = mediaTitle).
  const reviewQuery = reviewSearch.trim().toLowerCase();
  const searchedReviews = reviewQuery
    ? visibleReviews.filter((r) => r.title.toLowerCase().includes(reviewQuery))
    : visibleReviews;

  const userWatchlist: readonly (readonly [string, string])[] = [];

  const shouldBlockForProfileLoad = isPublicProfile && isViewedProfileLoading;

  const shouldBlockForProfileError =
    cannotLoadPublicProfile || (isPublicProfile && isViewedProfileError);

  const displayedFollowersCount = isPublicProfile
    ? (viewedProfile?.followersCount ?? 0)
    : (profileUserWithDates.followersCount ?? 0);

  const initials =
    profileDisplayName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || displayUsername.slice(0, 2).toUpperCase();

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

  const handleToggleEdit = () => {
    setSaveError('');
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
    const avatarUrl = avatarPreview?.trim() ?? undefined;

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
      setSaveError('');
      setAvatarPreview(null);
      setIsEditing(false);
    } catch (err) {
      // 저장 실패: 편집 패널은 열어두고, 알려진 백엔드 영문 에러는 i18n으로 현지화해 노출.
      const message = (err as { message?: string }).message ?? '';
      let localized = message || t('common.error');
      if (/already exists/i.test(message)) {
        localized = t('validation.usernameTaken');
      } else if (/valid url/i.test(message)) {
        localized = t('validation.avatarUrlInvalid');
      } else if (/may not be blank/i.test(message)) {
        localized = t('validation.usernameRequired');
      }
      setSaveError(localized);
    }
  };

  const handleProfileFormChange = (
    field: keyof typeof profileForm,
    value: string,
  ) => {
    if (saveError) {
      setSaveError('');
    }
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const profileStats = [
    {
      id: "reviews",
      label: t("home.reviews"),
      value: String(visibleReviews.length),
    },
    {
      id: "watchlist",
      label: t("home.watchlist"),
      value: String(userWatchlist.length),
    },
    {
      id: "followers",
      clickable: true,
      label: t("home.followers"),
      value: String(displayedFollowersCount),
    },
  ];

  const handleStatClick = (statId: string) => {
    if (statId === "followers") {
      setActiveTab("followers");
    }
  };

  const handleReviewSubmit = async (review: {
    mediaId: number;
    rating: number;
    content: string;
    visibility: ReviewVisibility;
  }) => {
    if (dashboardReviews.some((item) => item.mediaId === review.mediaId)) {
      throw new Error("review.duplicate");
    }

    try {
      await createReview({
        mediaId: review.mediaId,
        review: {
          rating: review.rating,
          content: review.content,
          visibility: review.visibility,
        },
      }).unwrap();
      refetchDashboard?.();
    } catch (err) {
      const message = (err as { message?: string }).message ?? "";
      throw new Error(
        /already exists/i.test(message)
          ? "review.duplicate"
          : message || "common.error",
      );
    }
  };

  const handleReviewDelete = async (review: ReviewItem) => {
    try {
      await deleteReviewMutation({
        mediaId: review.mediaId,
        reviewId: Number(review.id),
      }).unwrap();
      refetchDashboard();
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
    }
  };

  const handleReviewEdit = (review: ReviewItem) => {
    setEditingReview(review);
  };

  const handleReviewUpdate = async (data: {
    rating: number;
    content: string;
  }) => {
    if (!editingReview) return;
    try {
      await updateReviewMutation({
        mediaId: editingReview.mediaId,
        reviewId: Number(editingReview.id),
        review: { rating: data.rating, content: data.content },
      }).unwrap();
      setEditingReview(null);
      refetchDashboard();
    } catch (err) {
      console.error("리뷰 수정 실패:", err);
    }
  };

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-14 text-[#f0ead0]">
      <div className="mx-auto max-w-7xl">
        {shouldBlockForProfileLoad ? (
          <EmptyState title={t("main.loading")} />
        ) : null}

        {shouldBlockForProfileError ? (
          <EmptyState title={t("home.profileLoadError")} />
        ) : null}

        {!shouldBlockForProfileLoad && !shouldBlockForProfileError ? (
          <>
            <ProfileCard
              avatarAlt={t("home.avatarAlt")}
              avatarUrl={profileAvatarUrl || undefined}
              bio={profileBio}
              canEdit={isOwnProfile}
              canFollow={isPublicProfile && Boolean(viewedProfile)}
              closeEditLabel={t("home.closeEdit")}
              displayName={profileDisplayName}
              displayUsername={displayUsername}
              userId={viewedProfile?.id ?? profileUser.id}
              editProfileLabel={t("home.editProfile")}
              followLabel={t("home.follow")}
              initials={initials}
              isEditing={isEditing}
              isFollowLoading={followState.isLoading || unfollowState.isLoading}
              isFollowing={viewedProfile?.isFollowing ?? false}
              joinedYearLabel={joinedLabel}
              onStatClick={handleStatClick}
              onToggleEdit={handleToggleEdit}
              onToggleFollow={handleToggleFollow}
              stats={profileStats}
              unfollowLabel={t("home.following")}
              verifiedLabel={t("home.verifiedMember")}
            />

            <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_320px]">
              <div>
                <div className="mb-7 flex border-b border-[#f0ead0]/10">
                  {[
                    [
                      "reviews",
                      t("home.reviews"),
                      String(visibleReviews.length),
                    ],
                    [
                      "watchlist",
                      t("home.watchlist"),
                      String(userWatchlist.length),
                    ],
                    [
                      "followers",
                      t("home.followers"),
                      String(displayedFollowersCount),
                    ],
                  ].map(([key, label, count]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key as TabKey)}
                      className={`relative -bottom-px shrink-0 border-b-2 px-5 py-3 text-[10px] uppercase tracking-[0.12em] transition ${
                        activeTab === key
                          ? "border-[#d63e2a] text-[#f0ead0]"
                          : "border-transparent text-[#8a8474] hover:text-[#c8c2a8]"
                      }`}
                    >
                      {label}{" "}
                      <span
                        className={
                          activeTab === key
                            ? "text-[#d63e2a]"
                            : "text-[#8a8474]"
                        }
                      >
                        {count}
                      </span>
                    </button>
                  ))}
                </div>

                {activeTab === "reviews" ? (
                  <>
                    {isOwnProfile ? (
                      <ReviewForm onSubmit={handleReviewSubmit} />
                    ) : null}

                    <input
                      type="search"
                      value={reviewSearch}
                      onChange={(e) => setReviewSearch(e.target.value)}
                      placeholder={t("mypage.reviewSearchPlaceholder")}
                      className="mb-4 w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[12px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
                    />

                    <ReviewList
                      onDelete={isOwnProfile ? handleReviewDelete : undefined}
                      onEdit={isOwnProfile ? handleReviewEdit : undefined}
                      reviews={searchedReviews}
                    />
                  </>
                ) : null}

                {activeTab === "watchlist" ? (
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
                      <EmptyState title={t("mypage.empty")} />
                    )}
                  </div>
                ) : null}

                {activeTab === "followers" ? (
                  <div className="grid gap-3">
                    {isFollowersFetching ? (
                      <EmptyState title={t("main.loading")} />
                    ) : isFollowersError ? (
                      <EmptyState title={t("home.followersLoadError")} />
                    ) : followers.length ? (
                      followers.map((follower) => {
                        const followerInitials =
                          follower.username.slice(0, 2).toUpperCase() || "U";
                        const profilePath =
                          follower.id === user.id
                            ? "/profile"
                            : `/profile/${follower.id}`;

                        return (
                          <Link
                            key={follower.id}
                            to={profilePath}
                            className="flex items-center gap-4 border border-[#f0ead0]/10 bg-[#141412] px-4 py-3 transition hover:border-[#f0ead0]/25 hover:bg-[#1c1c19]"
                          >
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden border border-[#f0ead0]/15 bg-[#1c1c19] font-['Bebas_Neue'] text-xl tracking-[0.04em] text-[#c8c2a8]">
                              {follower.avatarUrl ? (
                                <img
                                  src={follower.avatarUrl}
                                  alt={follower.username}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                followerInitials
                              )}
                            </div>
                            <div>
                              <p className="text-sm font-bold tracking-[0.04em] text-[#f0ead0]">
                                {follower.username}
                              </p>
                              <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#8a8474]">
                                ID: {follower.id}
                              </p>
                            </div>
                          </Link>
                        );
                      })
                    ) : (
                      <EmptyState title={t("home.followersEmpty")} />
                    )}
                  </div>
                ) : null}
              </div>

              {isOwnProfile ? (
                <ProfileEditForm
                  apiError={saveError}
                  avatarUrl={avatarPreview ?? ''}
                  avatarUrlLabel={t('home.avatarUrl')}
                  avatarUrlPlaceholder={t('home.avatarUrlPlaceholder')}
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
                  onAvatarUrlChange={(value) => {
                    if (saveError) {
                      setSaveError('');
                    }
                    setAvatarPreview(value);
                  }}
                  onChange={handleProfileFormChange}
                  onSave={handleProfileSave}
                  passwordSectionLabel={t("home.passwordSection")}
                  saveLabel={t("home.saveChanges")}
                  sectionTitle={t("home.editPanelTitle")}
                  settingsTitle={t("home.accountSettings")}
                  toggles={[]}
                  usernameLabel={t("home.username")}
                />
              ) : null}
            </div>
          </>
        ) : null}
      </div>
      {editingReview && (
        <ReviewEditModal
          review={editingReview}
          onClose={() => setEditingReview(null)}
          onSave={handleReviewUpdate}
        />
      )}
    </section>
  );
}
