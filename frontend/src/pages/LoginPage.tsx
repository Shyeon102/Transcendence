import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useI18n } from '../lib/i18n';
import { setCredentials } from '../store/slices/authSlice';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const validateForm = () => {
    if (!email.trim() || !password.trim()) {
      return t('validation.required');
    }

    if (!EMAIL_REGEX.test(email)) {
      return t('validation.invalidEmail');
    }

    return '';
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validationError = validateForm();
    setErrorMsg(validationError);

    if (validationError) {
      return;
    }

    try {
      dispatch(
        setCredentials({
          user: {
            id: Date.now(),
            email: email.trim(),
            username: email.split('@')[0] || 'user',
          },
          token: 'mock-token',
        })
      );
      navigate('/home');
    } catch {
      setErrorMsg(t('common.error'));
    }
  };

  return (
    <div className="min-h-screen">
      <main className="mx-auto flex min-h-[calc(100vh-85px)] w-full max-w-6xl items-center justify-center px-4 py-10">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 shadow-2xl shadow-black/20 backdrop-blur">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">{t('login.title')}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">{t('login.email')}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('login.emailPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-[#131820] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">{t('login.password')}</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('login.passwordPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-[#131820] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
              />
            </div>
            {errorMsg && <p className="text-sm text-rose-400">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('login.submit')}
            </button>
            <button
              type="button"
              onClick={() => setErrorMsg(t('login.oauthPending'))}
              className="w-full rounded-md border border-white/12 bg-white/[0.03] px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.07]"
            >
              {t('login.oauth42')}
            </button>
          </form>

          <p className="mt-4 rounded-xl border border-white/10 bg-black/10 px-4 py-3 text-xs leading-5 text-slate-400">
            {t('login.demoHint')}
          </p>

          <p className="mt-6 text-center text-sm text-slate-400">
            {t('login.noAccount')}{' '}
            <Link to="/signup" className="font-semibold text-white hover:text-cyan-200">
              {t('login.toSignup')}
            </Link>
          </p>

          <p className="mt-2 text-center text-sm text-slate-500">
            <Link to="/" className="hover:text-white hover:underline">
              {t('common.backHome')}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
