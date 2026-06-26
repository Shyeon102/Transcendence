import type { AuthUser } from "../../types";

const AUTH_STORAGE_KEY = "transcendence.auth";

export type PersistedAuthState = {
  user: AuthUser;
  accessToken: string;
  refreshToken: string | null;
};

const canUseSessionStorage = () => typeof window !== "undefined" && Boolean(window.sessionStorage);

export const loadAuthSession = (): PersistedAuthState | null => {
  if (!canUseSessionStorage()) {
    return null;
  }

  try {
    const rawSession = window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawSession) {
      return null;
    }

    const session = JSON.parse(rawSession) as Partial<PersistedAuthState>;
    if (!session.user || !session.accessToken) {
      window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
      return null;
    }

    return {
      user: session.user,
      accessToken: session.accessToken,
      refreshToken: session.refreshToken ?? null,
    };
  } catch {
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const saveAuthSession = (session: PersistedAuthState) => {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  if (!canUseSessionStorage()) {
    return;
  }

  window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
};
