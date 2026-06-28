import Button from './ui/Button';

type ProfileStat = {
  label: string;
  value: string;
};

type ProfileCardProps = {
  avatarAlt: string;
  avatarUrl?: string;
  bio: string;
  canEdit?: boolean;
  canFollow?: boolean;
  closeEditLabel: string;
  displayName: string;
  displayUsername: string;
  editProfileLabel: string;
  followLabel?: string;
  initials: string;
  isFollowLoading?: boolean;
  isFollowing?: boolean;
  isEditing: boolean;
  joinedYearLabel: string;
  onAvatarSelect: (file: File | null) => void;
  onToggleFollow?: () => void;
  onToggleEdit: () => void;
  stats: ProfileStat[];
  unfollowLabel?: string;
  uploadAvatarLabel: string;
  verifiedLabel: string;
};

export default function ProfileCard({
  avatarAlt,
  avatarUrl,
  bio,
  canEdit = true,
  canFollow = false,
  closeEditLabel,
  displayName,
  displayUsername,
  editProfileLabel,
  followLabel = 'Follow',
  initials,
  isFollowLoading = false,
  isFollowing = false,
  isEditing,
  joinedYearLabel,
  onAvatarSelect,
  onToggleFollow,
  onToggleEdit,
  stats,
  unfollowLabel = 'Following',
  uploadAvatarLabel,
  verifiedLabel,
}: ProfileCardProps) {
  return (
    <div className="grid gap-10 border-b border-[#f0ead0]/10 pb-10 lg:grid-cols-[110px_1fr_auto]">
      <div className="relative h-[110px] w-[110px]">
        <div className="relative flex h-[110px] w-[110px] items-center justify-center overflow-hidden border-2 border-[#f0ead0]/25 bg-[#1c1c19] font-['Bebas_Neue'] text-[44px] tracking-[0.05em] text-[#c8c2a8]">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,transparent,transparent_3px,rgba(240,234,210,0.02)_3px,rgba(240,234,210,0.02)_6px)]" />
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={avatarAlt}
              className="relative z-10 h-full w-full object-cover"
            />
          ) : (
            <span className="relative z-10">{initials}</span>
          )}
        </div>
        {canEdit ? (
          <>
            <button
              type="button"
              onClick={onToggleEdit}
              className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center border-2 border-[#0c0c0b] bg-[#d63e2a] text-[11px]"
            >
              ✎
            </button>
            <label className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 cursor-pointer border border-[#f0ead0]/20 bg-[#141412] px-3 py-1 text-[8px] uppercase tracking-[0.14em] text-[#c8c2a8] transition hover:border-[#f0ead0]/35 hover:text-[#f0ead0]">
              {uploadAvatarLabel}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => onAvatarSelect(event.target.files?.[0] ?? null)}
              />
            </label>
          </>
        ) : null}
      </div>

      <div>
        <span className="mb-3 inline-block border border-[#d63e2a]/20 bg-[#d63e2a]/15 px-3 py-1 text-[9px] uppercase tracking-[0.18em] text-[#ff4f38]">
          {verifiedLabel}
        </span>
        <h1 className="mb-2 font-['Bebas_Neue'] text-[46px] leading-none tracking-[0.03em]">
          {displayName.toUpperCase()}
        </h1>
        <p className="mb-3 text-xs tracking-[0.08em] text-[#8a8474]">@{displayUsername} · {joinedYearLabel}</p>
        <p className="max-w-[440px] font-['IBM_Plex_Serif'] text-sm font-light italic leading-7 text-[#c8c2a8]">
          {bio}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-6 lg:flex-col lg:items-end">
        {canEdit ? (
          <Button
            onClick={onToggleEdit}
            size="sm"
            variant={isEditing ? 'primary' : 'secondary'}
            className="px-5"
          >
            {isEditing ? `✕ ${closeEditLabel}` : editProfileLabel}
          </Button>
        ) : null}

        {!canEdit && canFollow ? (
          <Button
            disabled={isFollowLoading}
            onClick={onToggleFollow}
            size="sm"
            variant={isFollowing ? 'secondary' : 'primary'}
            className="px-5"
          >
            {isFollowing ? unfollowLabel : followLabel}
          </Button>
        ) : null}

        {stats.map((stat) => (
          <div key={stat.label} className="min-w-[88px] text-left lg:text-right">
            <div className="font-['Bebas_Neue'] text-4xl leading-none tracking-[0.05em]">{stat.value}</div>
            <div className="mt-0.5 text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{stat.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
