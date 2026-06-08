import { Link, useLocation } from 'react-router-dom';
import { useI18n } from '../lib/i18n';

const DEFAULT_NEXT_PATH = '/login';

export default function OAuthCallbackPage() {
  const { search } = useLocation();
  const { t } = useI18n();
  const params = new URLSearchParams(search);
  const error = params.get('error');
  const message = params.get('message');
  const next = params.get('next') || DEFAULT_NEXT_PATH;
  const isError = Boolean(error);

  const title = isError
    ? t('oauth.callbackErrorTitle')
    : t('oauth.callbackSuccessTitle');

  const description = message
    ? message
    : isError
      ? t('oauth.callbackErrorDescription')
      : t('oauth.callbackSuccessDescription');

  const ctaLabel = isError
    ? t('oauth.callbackRetry')
    : t('oauth.callbackContinue');

  return (
    <section className="min-h-[calc(100vh-85px)] bg-[#0c0c0b] px-6 py-16 text-[#f0ead0]">
      <div className="mx-auto max-w-2xl border border-[#f0ead0]/10 bg-[#141412] p-8 text-center">
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#8a8474]">
          {t('oauth.callbackEyebrow')}
        </p>
        <h1 className="mt-4 font-['Bebas_Neue'] text-5xl tracking-[0.04em]">
          {title}
        </h1>
        <p className="mt-5 font-['IBM_Plex_Serif'] text-sm italic leading-7 text-[#8a8474]">
          {description}
        </p>
        <Link
          to={next}
          className="mt-8 inline-flex bg-[#d63e2a] px-5 py-3 text-[11px] uppercase tracking-[0.15em] text-[#f0ead0] transition hover:bg-[#ff4f38]"
        >
          {ctaLabel}
        </Link>
      </div>
    </section>
  );
}
