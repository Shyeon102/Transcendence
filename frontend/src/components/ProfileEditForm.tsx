import type { Dispatch, SetStateAction } from 'react';
import PasswordChangeForm from './PasswordChangeForm';
import FieldLabel from './ui/FieldLabel';
import SectionCard from './ui/SectionCard';
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
  changePasswordLabel: string;
  confirmNewPasswordLabel: string;
  currentPasswordLabel: string;
  deleteAccountLabel: string;
  firstNameLabel: string;
  form: ProfileFormState;
  isEditing: boolean;
  lastNameLabel: string;
  newPasswordLabel: string;
  onChange: (field: keyof ProfileFormState, value: string) => void;
  onSave: () => void;
  saveLabel: string;
  sectionTitle: string;
  settingsTitle: string;
  twoFactorLabel: string;
  twoFactorDescription: string;
  usernameLabel: string;
  bioLabel: string;
  passwordSectionLabel: string;
  toggles: ToggleSetting[];
};

export default function ProfileEditForm({
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
  onChange,
  onSave,
  passwordSectionLabel,
  saveLabel,
  sectionTitle,
  settingsTitle,
  toggles,
  usernameLabel,
}: ProfileEditFormProps) {
  return (
    <aside>
      {isEditing ? (
        <SectionCard className="mb-7 p-7">
          <div className="mb-5 text-[10px] uppercase tracking-[0.18em] text-[#d63e2a]">▶ {sectionTitle}</div>

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
              onChange={(e) => onChange('username', e.target.value)}
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

          <button
            type="button"
            onClick={onSave}
            className="w-full border border-[#f0ead0]/25 bg-[#1c1c19] px-4 py-3 text-[10px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:border-[#d63e2a] hover:bg-[#d63e2a]"
          >
            {saveLabel}
          </button>
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
          <button
            type="button"
            className="w-full border border-[#d63e2a]/30 bg-transparent px-4 py-2.5 text-[9px] uppercase tracking-[0.12em] text-[#d63e2a]/70 transition hover:border-[#d63e2a] hover:text-[#ff4f38]"
          >
            ⚠ {deleteAccountLabel}
          </button>
        </div>
      </div>
    </aside>
  );
}
