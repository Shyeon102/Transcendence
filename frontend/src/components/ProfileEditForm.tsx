import { useState, type Dispatch, type SetStateAction } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { useDeleteAccountMutation } from '../store/api/authApi';
import { logout } from '../store/slices/authSlice';
import PasswordChangeForm from './PasswordChangeForm';
import Button from './ui/Button';
import FieldLabel from './ui/FieldLabel';
import SectionCard from './ui/SectionCard';
import StatusMessage from './ui/StatusMessage';
import TextAreaField from './ui/TextAreaField';
import TextField from './ui/TextField';

type ProfileFormState = {
  username: string;
  firstName: string;
  lastName: string;
  bio: string;
};

type ToggleSetting = {
  description: string;
  label: string;
  value: boolean;
  onToggle: Dispatch<SetStateAction<boolean>>;
};

type ProfileEditFormProps = {
  avatarUrl: string;
  avatarUrlLabel: string;
  avatarUrlPlaceholder: string;
  changePasswordLabel: string;
  confirmNewPasswordLabel: string;
  currentPasswordLabel: string;
  deleteAccountLabel: string;
  firstNameLabel: string;
  form: ProfileFormState;
  isEditing: boolean;
  lastNameLabel: string;
  newPasswordLabel: string;
  onAvatarUrlChange: (value: string) => void;
  onChange: (field: keyof ProfileFormState, value: string) => void;
  onSave: () => void;
  saveLabel: string;
  sectionTitle: string;
  settingsTitle: string;
  usernameLabel: string;
  bioLabel: string;
  passwordSectionLabel: string;
  toggles: ToggleSetting[];
};

export default function ProfileEditForm({
  avatarUrl,
  avatarUrlLabel,
  avatarUrlPlaceholder,
  bioLabel,
  changePasswordLabel,
  confirmNewPasswordLabel,
  currentPasswordLabel,
  deleteAccountLabel,
  firstNameLabel,
  form,
  isEditing,
  lastNameLabel,
  newPasswordLabel,
  onAvatarUrlChange,
  onChange,
  onSave,
  passwordSectionLabel,
  saveLabel,
  sectionTitle,
  settingsTitle,
  toggles,
  usernameLabel,
}: ProfileEditFormProps) {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [deleteAccount, { isLoading: isDeleting }] = useDeleteAccountMutation();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState('');
  const [saveError, setSaveError] = useState('');

  const handleSave = () => {
    // username 은 백엔드 필수값 (빈 값이면 400) → first/last name, bio 와 달리 프론트에서 막는다.
    if (!form.username.trim()) {
      setSaveError(t('validation.usernameRequired'));
      return;
    }
    setSaveError('');
    onSave();
  };

  const handleDeleteConfirm = async () => {
    setDeleteStatus(t('home.deleteAccountPending'));

    try {
      await deleteAccount().unwrap();
      dispatch(logout());
      navigate('/login');
    } catch (error) {
      const apiError = error as { message?: string };
      setDeleteStatus(apiError.message ?? t('home.deleteAccountError'));
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <aside>
      {isEditing ? (
        <SectionCard className="mb-7 p-7">
          <div className="mb-5 text-[10px] uppercase tracking-[0.18em] text-[#d63e2a]">▶ {sectionTitle}</div>

          <div className="mb-4">
            <FieldLabel>{avatarUrlLabel}</FieldLabel>
            <TextField
              type="url"
              value={avatarUrl}
              onChange={(e) => onAvatarUrlChange(e.target.value)}
              placeholder={avatarUrlPlaceholder}
            />
          </div>

          <div className="mb-4">
            <FieldLabel>{firstNameLabel}</FieldLabel>
            <TextField
              type="text"
              value={form.firstName}
              onChange={(e) => onChange('firstName', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <FieldLabel>{lastNameLabel}</FieldLabel>
            <TextField
              type="text"
              value={form.lastName}
              onChange={(e) => onChange('lastName', e.target.value)}
            />
          </div>

          <div className="mb-4">
            <FieldLabel>{usernameLabel}</FieldLabel>
            <TextField
              type="text"
              value={form.username}
              onChange={(e) => {
                if (saveError) {
                  setSaveError('');
                }
                onChange('username', e.target.value);
              }}
            />
          </div>

          <div className="mb-4">
            <FieldLabel>{bioLabel}</FieldLabel>
            <TextAreaField
              value={form.bio}
              onChange={(e) => onChange('bio', e.target.value)}
              className="min-h-24 leading-6"
            />
          </div>

          {saveError ? <StatusMessage className="mb-3">{saveError}</StatusMessage> : null}

          <Button onClick={handleSave} className="w-full">
            {saveLabel}
          </Button>
        </SectionCard>
      ) : null}

      <div>
        <div className="mb-5 flex items-center gap-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">{settingsTitle}</span>
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
        </div>

        {toggles.map((toggle) => (
          <div
            key={toggle.label}
            className="flex items-center justify-between gap-3 border-b border-[#f0ead0]/10 py-4"
          >
            <div>
              <div className="text-[11px] tracking-[0.08em] text-[#c8c2a8]">{toggle.label}</div>
              <div className="mt-1 text-[9px] tracking-[0.06em] text-[#8a8474]">{toggle.description}</div>
            </div>
            <button
              type="button"
              onClick={() => toggle.onToggle((prev) => !prev)}
              className={`relative h-[18px] w-[34px] rounded-full border transition ${
                toggle.value ? 'border-[#d63e2a] bg-[#d63e2a]' : 'border-[#f0ead0]/25 bg-[#1c1c19]'
              }`}
            >
              <span
                className={`absolute top-0.5 h-3 w-3 rounded-full bg-[#f0ead0] transition ${
                  toggle.value ? 'left-5' : 'left-0.5'
                }`}
              />
            </button>
          </div>
        ))}

        <div className="mt-7">
          <div className="mb-5 flex items-center gap-4">
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8a8474]">{passwordSectionLabel}</span>
            <div className="h-px flex-1 bg-[#f0ead0]/10" />
          </div>

          <PasswordChangeForm
            changePasswordLabel={changePasswordLabel}
            confirmNewPasswordLabel={confirmNewPasswordLabel}
            currentPasswordLabel={currentPasswordLabel}
            newPasswordLabel={newPasswordLabel}
          />
        </div>

        <div className="mt-7 border-t border-[#f0ead0]/10 pt-7">
          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={() => {
              setDeleteStatus('');
              setIsDeleteModalOpen(true);
            }}
          >
            ⚠ {deleteAccountLabel}
          </Button>
          {deleteStatus ? (
            <p className="mt-3 text-[10px] leading-5 tracking-[0.06em] text-[#8a8474]">
              {deleteStatus}
            </p>
          ) : null}
        </div>
      </div>

      {isDeleteModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#0c0c0b]/80 px-5"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-account-title"
        >
          <SectionCard className="w-full max-w-sm p-6 shadow-2xl shadow-black/40">
            <p className="mb-2 text-[9px] uppercase tracking-[0.18em] text-[#d63e2a]">
              {deleteAccountLabel}
            </p>
            <h2
              id="delete-account-title"
              className="font-['Bebas_Neue'] text-4xl tracking-[0.04em] text-[#f0ead0]"
            >
              {t('home.deleteAccountTitle')}
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#8a8474]">
              {t('home.deleteAccountDescription')}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <Button
                variant="secondary"
                onClick={() => setIsDeleteModalOpen(false)}
              >
                {t('home.deleteAccountCancel')}
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? t('home.deleteAccountPending') : t('home.deleteAccountConfirm')}
              </Button>
            </div>
          </SectionCard>
        </div>
      ) : null}
    </aside>
  );
}
