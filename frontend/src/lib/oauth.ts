const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const OAUTH_42_START_URL =
  import.meta.env.VITE_OAUTH_42_START_URL ?? '';

export const OAUTH_42_CALLBACK_PATH =
  import.meta.env.VITE_OAUTH_42_CALLBACK_PATH ?? '/oauth/42/callback';

export const getOAuth42StartUrl = () => {
  if (!OAUTH_42_START_URL) {
    return '';
  }

  if (/^https?:\/\//.test(OAUTH_42_START_URL)) {
    return OAUTH_42_START_URL;
  }

  const origin = window.location.origin;
  const normalizedPath = OAUTH_42_START_URL.startsWith('/')
    ? OAUTH_42_START_URL
    : `/${OAUTH_42_START_URL}`;

  return `${trimTrailingSlash(origin)}${normalizedPath}`;
};

export const beginOAuth42Login = () => {
  const startUrl = getOAuth42StartUrl();
  if (!startUrl) {
    return false;
  }

  window.location.assign(startUrl);
  return true;
};
