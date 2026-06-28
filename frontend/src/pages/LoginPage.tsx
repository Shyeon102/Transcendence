import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthShell from '../components/AuthShell';
import GoogleAuthButton from '../components/GoogleAuthButton';
import Button from '../components/ui/Button';
import StatusMessage from '../components/ui/StatusMessage';
import { useI18n } from '../lib/i18n';
// import { beginOAuth42Login } from '../lib/oauth';
import { useGoogleLoginMutation, useLoginMutation } from '../store/api/authApi';
import type { AuthErrorResponse } from '../store';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const navigate = useNavigate();
  const { t } = useI18n();
  const [login, { isLoading }] = useLoginMutation();
  const [googleLogin, { isLoading: isGoogleLoading }] = useGoogleLoginMutation();

  const validateForm = () => {
    if (!username.trim() || !password.trim()) {
      return t('validation.required');
    }

    return '';
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    setErrorMsg(validationError);

    if (validationError) return;

    try {
      const session = await login({ username, password }).unwrap();

      if (!session?.user) {
        setErrorMsg("Login failed");
        return;
      }

      navigate('/home');
    } catch (err) {
      const apiError = err as AuthErrorResponse;
      if (apiError.status === 401) {
        setErrorMsg(t('login.invalidCredentials'));
        return;
      }
      setErrorMsg(apiError.message ?? t('common.error'));
    }
  };

 const handleGoogleCredential = async (credential: string) => {
    setErrorMsg('');

    try {
      const session = await googleLogin({ id_token: credential }).unwrap();

      const user = session?.user;

      if (!user) {
        console.log("Invalid session:", session);
        setErrorMsg("Login failed: missing user");
        return;
      }

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
            {t('home.username')}
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            <Button size="sm" variant="ghost" className="border-b border-[#f0ead0]/10 px-0 py-0 normal-case tracking-[0.08em]">
              {t('login.forgotPassword')}
            </Button>
          </p>
        </div>

        {errorMsg ? <StatusMessage>{errorMsg}</StatusMessage> : null}

        <Button
          type="submit"
          disabled={isLoading}
          variant="primary"
          className="w-full py-[15px] text-[11px]"
        >
          {isLoading ? t('login.loading') : t('login.submitDisplay')}
        </Button>

        <div className="flex items-center gap-3 py-1">
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
          <span className="text-[9px] uppercase tracking-[0.15em] text-[#8a8474]">{t('login.oauthDivider')}</span>
          <div className="h-px flex-1 bg-[#f0ead0]/10" />
        </div>

        {/* <Button
          onClick={() => {
            if (!beginOAuth42Login()) {
              setErrorMsg(t('oauth.startUrlMissing'));
            }
          }}
          variant="secondary"
          className="w-full py-[13px] text-[11px]"
        >
          <span className="font-['Bebas_Neue'] text-base tracking-[0.05em] text-[#f0ead0]">42</span>
          {t('login.oauth42')}
        </Button> */}

        <GoogleAuthButton
          disabled={isGoogleLoading}
          missingConfigLabel={t('oauth.googleClientMissing')}
          onCredential={(credential) => void handleGoogleCredential(credential)}
          onError={setErrorMsg}
          text="signin_with"
        />
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
