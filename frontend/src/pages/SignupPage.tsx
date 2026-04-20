import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useI18n } from '../lib/i18n';
import type { AppDispatch } from '../store';
import { setCredentials } from '../store/slices/authSlice';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
  });
  const [errorMsg, setErrorMsg] = useState('');

  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { t } = useI18n();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.username.trim() || !formData.password.trim() || !formData.passwordConfirm.trim()) {
      return t('validation.required');
    }

    if (!EMAIL_REGEX.test(formData.email)) {
      return t('validation.invalidEmail');
    }

    if (formData.password.length < 8) {
      return t('validation.passwordTooShort');
    }

    if (formData.password !== formData.passwordConfirm) {
      return t('validation.passwordMismatch');
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
            email: formData.email.trim(),
            username: formData.username.trim(),
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
            <h1 className="text-3xl font-bold text-white">{t('signup.title')}</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">{t('signup.email')}</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder={t('signup.emailPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-[#131820] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">{t('signup.nickname')}</label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder={t('signup.nicknamePlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-[#131820] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">{t('signup.password')}</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder={t('signup.passwordPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-[#131820] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-200">{t('signup.passwordConfirm')}</label>
              <input
                type="password"
                name="passwordConfirm"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder={t('signup.passwordConfirmPlaceholder')}
                className="w-full rounded-xl border border-white/10 bg-[#131820] px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-200"
              />
            </div>
            {errorMsg && <p className="text-sm text-rose-400">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full rounded-md bg-slate-100 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {t('signup.submit')}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-400">
            {t('signup.hasAccount')}{' '}
            <Link to="/login" className="font-semibold text-white hover:text-cyan-200">
              {t('signup.toLogin')}
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
