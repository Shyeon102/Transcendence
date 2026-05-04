import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import { useI18n } from '../lib/i18n';
import { useLoginMutation } from '../store/slices/authApi';
import type { AuthErrorResponse } from '../store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { t } = useI18n();
  const [login, { isLoading }] = useLoginMutation();

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return t('validation.required');
    }

    if (!EMAIL_REGEX.test(email)) {
      return t('validation.invalidEmail');
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    setErrorMsg(validationError);

    if (validationError) {
      return;
    }

    try {
      await login({ email, password }).unwrap();
      navigate('/home');
    } catch (err) {
      const apiError = err as AuthErrorResponse;
      setErrorMsg(apiError.message ?? t('common.error'));
    }
  };

  return (
    <AuthShell
      eyebrow={t('login.eyebrow')}
      title={
        <>
          {t('login.heroLine1')}
          <br />
          {t('login.heroLine2')}
        </>
      }
      subtitle={t('login.subtitle')}
      backgroundText={t('login.bgText')}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('login.email')}
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
          />
        </div>

        <div>
          <label className="mb-2 block text-[9px] uppercase tracking-[0.18em] text-[#8a8474]">
            {t('login.password')}
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-[#f0ead0]/10 bg-[#1c1c19] px-4 py-3 text-[13px] text-[#f0ead0] outline-none transition placeholder:text-[#8a8474] focus:border-[#f0ead0]/25"
          />
          <p className="mt-1.5 text-[9px] tracking-[0.08em] text-[#8a8474]">
            <button type="button" className="border-b border-[#f0ead0]/10 text-[#8a8474]">
              {t('login.forgotPassword')}
            </button>
          </p>
        </div>

        {errorMsg ? <p className="text-[11px] tracking-[0.06em] text-[#ff4f38]">{errorMsg}</p> : null}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#d63e2a] px-4 py-[15px] text-[11px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? t('login.loading') : t('login.submitDisplay')}
        </button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{t('login.oauthDivider')}</span>
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
        </div>

        <button
          type="button"
          onClick={() => setErrorMsg(t('login.oauthPending'))}
          className="flex w-full items-center justify-center gap-3 border border-[#f0ead0]/25 bg-transparent px-4 py-[13px] text-[11px] uppercase tracking-[0.12em] text-[#c8c2a8] transition hover:border-[#c8c2a8] hover:text-[#f0ead0]"
        >
          <span className="font-['Bebas_Neue'] text-base tracking-[0.05em] text-[#f0ead0]">42</span>
          {t('login.oauth42')}
        </button>
      </form>

      <p className="mt-7 text-center text-[11px] tracking-[0.05em] text-[#8a8474]">
        {t('login.noAccount')}{' '}
        <Link to="/signup" className="border-b border-[#f0ead0]/25 text-[#c8c2a8]">
          {t('login.toSignupCta')}
        </Link>
      </p>

      <p className="mt-4 border border-[#f0ead0]/10 bg-[#141412] px-4 py-3 text-center text-[10px] tracking-[0.08em] text-[#8a8474]">
        {t('login.demoHint')}
      </p>
    </AuthShell>
  );
}
