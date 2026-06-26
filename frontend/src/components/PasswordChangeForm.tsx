import { useState } from 'react';
import { useChangePasswordMutation } from '../store/api/authApi';
import { useI18n } from '../lib/i18n';
import Button from './ui/Button';
import FieldLabel from './ui/FieldLabel';
import StatusMessage from './ui/StatusMessage';
import TextField from './ui/TextField';

type PasswordChangeFormProps = {
  changePasswordLabel: string;
  confirmNewPasswordLabel: string;
  currentPasswordLabel: string;
  newPasswordLabel: string;
};

export default function PasswordChangeForm({
  changePasswordLabel,
  confirmNewPasswordLabel,
  currentPasswordLabel,
  newPasswordLabel,
}: PasswordChangeFormProps) {
  const { t } = useI18n();
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [changePassword, { isLoading: isSubmitting }] = useChangePasswordMutation();

  const handleChange = (field: keyof typeof form, value: string) => {
    if (errorMsg) {
      setErrorMsg('');
    }
    if (successMsg) {
      setSuccessMsg('');
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    if (
      !form.currentPassword.trim() ||
      !form.newPassword.trim() ||
      !form.confirmNewPassword.trim()
    ) {
      return t('validation.required');
    }

    if (form.newPassword.length < 8) {
      return t('validation.passwordTooShort');
    }

    if (
      !/[a-z]/.test(form.newPassword) ||
      !/[A-Z]/.test(form.newPassword) ||
      !/\d/.test(form.newPassword)
    ) {
      return t('validation.passwordWeak');
    }

    if (form.newPassword !== form.confirmNewPassword) {
      return t('validation.passwordMismatch');
    }

    if (form.currentPassword === form.newPassword) {
      return t('home.passwordSameAsCurrent');
    }

    return '';
  };

  const handleSubmit = async () => {
    const validationError = validate();
    setErrorMsg(validationError);

    if (validationError) {
      return;
    }

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      }).unwrap();
      setSuccessMsg(t('home.passwordChangeSuccess'));
      setForm({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      });
    } catch (error) {
      const apiError = error as { message?: string };
      setErrorMsg(apiError.message ?? t('common.error'));
    }
  };

  return (
    <div>
      <div className="space-y-4">
        <div>
          <FieldLabel>{currentPasswordLabel}</FieldLabel>
          <TextField
            type="password"
            value={form.currentPassword}
            onChange={(e) => handleChange('currentPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <FieldLabel>{newPasswordLabel}</FieldLabel>
          <TextField
            type="password"
            value={form.newPassword}
            onChange={(e) => handleChange('newPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>

        <div>
          <FieldLabel>{confirmNewPasswordLabel}</FieldLabel>
          <TextField
            type="password"
            value={form.confirmNewPassword}
            onChange={(e) => handleChange('confirmNewPassword', e.target.value)}
            placeholder="••••••••"
          />
        </div>
      </div>

      {errorMsg ? (
        <StatusMessage className="mt-4">{errorMsg}</StatusMessage>
      ) : null}

      {successMsg ? (
        <StatusMessage tone="success" className="mt-4">{successMsg}</StatusMessage>
      ) : null}

      <Button onClick={handleSubmit} disabled={isSubmitting} className="mt-4 w-full">
        {isSubmitting ? t('home.passwordChanging') : changePasswordLabel}
      </Button>
    </div>
  );
}
