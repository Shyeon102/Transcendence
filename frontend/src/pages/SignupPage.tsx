import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell.tsx';
import { useI18n } from '../lib/i18n';
import { useSignupMutation } from '../store/slices/authApi';
import type { AuthErrorResponse } from '../store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    password: '',
    passwordConfirm: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { t } = useI18n();
  const [signup, { isLoading }] = useSignupMutation();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const validateForm = () => {
    if (
      !formData.email.trim() ||
      !formData.username.trim() ||
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.password.trim() ||
      !formData.passwordConfirm.trim()
    ) {
      return t('validation.required');
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      return t('validation.invalidEmail');
    }

    if (formData.username.length < 3 || !USERNAME_REGEX.test(formData.username)) {
      return t('validation.usernameInvalid');
    }

    if (formData.password.length < 8) {
      return t('validation.passwordTooShort');
    }

    if (formData.password !== formData.passwordConfirm) {
      return t('validation.passwordMismatch');
    }

    return '';
  };

  const getNicknameHint = () => {
    if (!formData.username) return t('signup.nicknameHintDefault');
    if (formData.username.length < 3) return `✗ ${t('signup.nicknameHintShort')}`;
    if (!USERNAME_REGEX.test(formData.username)) return `✗ ${t('signup.nicknameHintInvalid')}`;
    return `✓ ${t('signup.nicknameHintAvailable')}`;
  };

  const getNicknameHintClass = () => {
    if (!formData.username) return 'text-[#8a8474]';
    if (formData.username.length < 3 || !USERNAME_REGEX.test(formData.username)) return 'text-[#ff4f38]';
    return 'text-[#6bbf72]';
  };

  const getPasswordStrength = () => {
    let strength = 0;
    if (formData.password.length >= 6) strength += 1;
    if (formData.password.length >= 10) strength += 1;
    if (/\d/.test(formData.password) || /[^a-zA-Z0-9]/.test(formData.password)) strength += 1;
    if (/\d/.test(formData.password) && /[^a-zA-Z0-9]/.test(formData.password) && formData.password.length >= 12) strength += 1;
    return strength;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    setErrorMsg(validationError);

    if (validationError) {
      return;
    }

    try {
      await signup(formData).unwrap();
      navigate('/home');
    } catch (err) {
      const apiError = err as AuthErrorResponse;
      setErrorMsg(apiError.message ?? t('common.error'));
    }
  };

  const passwordStrength = getPasswordStrength();
  const passwordHint =
    !formData.passwordConfirm
      ? ''
      : formData.password === formData.passwordConfirm
        ? `✓ ${t('signup.passwordsMatch')}`
        : `✗ ${t('signup.passwordsMismatch')}`;

  return (
    <AuthShell
      eyebrow={t('signup.eyebrow')}
      title={
        <>
          {t('signup.heroLine1')}
          <br />
          {t('signup.heroLine2')}
        </>
      }
      subtitle={t('signup.subtitle')}
      backgroundText={t('signup.bgText')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('signup.email')}
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
          />
        </div>

        <div>
          <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('signup.nickname')}
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
          />
          <p className={`mt-1.5 text-[9px] tracking-[0.08em] ${getNicknameHintClass()}`}>{getNicknameHint()}</p>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t('signup.firstName')}
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
            />
          </div>

          <div>
            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t('signup.lastName')}
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
            />
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t('signup.password')}
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder={t('signup.passwordPlaceholder')}
              className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
            />
            <div className="mt-2 flex gap-1">
              {[0, 1, 2, 3].map((index) => {
                let barClass = 'bg-[#f0ead0]/10';
                if (index < passwordStrength) {
                  barClass =
                    passwordStrength <= 1 ? 'bg-[#d63e2a]' : passwordStrength <= 2 ? 'bg-[#d4a847]' : 'bg-[#6bbf72]';
                }
                return <div key={index} className={`h-0.5 flex-1 ${barClass}`} />;
              })}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
              {t('signup.passwordConfirm')}
            </label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              placeholder={t('signup.passwordConfirmPlaceholder')}
              className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
            />
            <p
              className={`mt-1.5 text-[9px] tracking-[0.08em] ${
                !passwordHint ? 'text-transparent' : formData.password === formData.passwordConfirm ? 'text-[#6bbf72]' : 'text-[#ff4f38]'
              }`}
            >
              {passwordHint || 'placeholder'}
            </p>
          </div>
        </div>

        {errorMsg ? <p className="text-[11px] tracking-[0.06em] text-[#ff4f38]">{errorMsg}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#d63e2a] px-4 py-[15px] text-[11px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? t('signup.loading') : t('signup.submitDisplay')}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{t('signup.oauthDivider')}</span>
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
        </div>

        <button
          type="button"
          onClick={() => setErrorMsg(t('login.oauthPending'))}
          className="flex w-full items-center justify-center gap-3 border border-[#f0ead0]/25 bg-transparent px-4 py-[13px] text-[11px] uppercase tracking-[0.12em] text-[#c8c2a8] transition hover:border-[#c8c2a8] hover:text-[#f0ead0]"
        >
          <span className="font-['Bebas_Neue'] text-base tracking-[0.05em] text-[#f0ead0]">42</span>
          {t('signup.oauth42Intra')}
        </button>
      </form>

      <p className="mt-7 text-center text-[11px] tracking-[0.05em] text-[#8a8474]">
        {t('signup.hasAccount')}{' '}
        <Link to="/login" className="border-b border-[#f0ead0]/25 text-[#c8c2a8]">
          {t('signup.toLoginCta')}
        </Link>
      </p>
    </AuthShell>
  );
}
