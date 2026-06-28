import { useEffect, useRef, useState } from 'react';
import Button from './ui/Button';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleAccounts = {
  id: {
    initialize: (options: {
      client_id: string;
      callback: (response: GoogleCredentialResponse) => void;
      use_fedcm_for_prompt?: boolean;
    }) => void;
    renderButton: (
      parent: HTMLElement,
      options: {
        theme?: 'outline' | 'filled_blue' | 'filled_black';
        size?: 'large' | 'medium' | 'small';
        width?: number;
        text?: 'signin_with' | 'signup_with' | 'continue_with';
      },
    ) => void;
  };
};

declare global {
  interface Window {
    google?: {
      accounts?: GoogleAccounts;
    };
  }
}

const GOOGLE_SCRIPT_ID = 'google-identity-services';
const GOOGLE_SCRIPT_SRC = 'https://accounts.google.com/gsi/client';
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? '';
let googleInitialized = false; 

let googleScriptPromise: Promise<void> | null = null;

const isGoogleReady = () => Boolean(window.google?.accounts?.id);

const loadGoogleScript = () => {
  if (isGoogleReady()) return Promise.resolve();

  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const handleLoad = () => {
      if (isGoogleReady()) return resolve();
      googleScriptPromise = null;
      reject(new Error('Google script loaded but accounts not available.'));
    };

    const handleError = () => {
      googleScriptPromise = null;
      reject(new Error('Google script failed to load.'));
    };

    const existing = document.getElementById(GOOGLE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', handleLoad, { once: true });
      existing.addEventListener('error', handleError, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.addEventListener('load', handleLoad, { once: true });
    script.addEventListener('error', handleError, { once: true });

    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

type GoogleAuthButtonProps = {
  disabled?: boolean;
  missingConfigLabel: string;
  onCredential: (credential: string) => void;
  onError: (message: string) => void;
  text?: 'signin_with' | 'signup_with' | 'continue_with';
};

export default function GoogleAuthButton({
  disabled,
  missingConfigLabel,
  onCredential,
  onError,
  text = 'continue_with',
}: GoogleAuthButtonProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onCredentialRef = useRef(onCredential);
  const onErrorRef = useRef(onError);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    onCredentialRef.current = onCredential;
    onErrorRef.current = onError;
  }, [onCredential, onError]);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID || disabled) return;
    if (googleInitialized) return;

    let mounted = true;

    loadGoogleScript()
      .then(() => {
        if (!mounted || !containerRef.current || !window.google?.accounts) return;

        googleInitialized = true;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: (response) => {
            if (!response.credential) {
              onErrorRef.current('Google did not return a credential.');
              return;
            }
            onCredentialRef.current(response.credential);
          },
          use_fedcm_for_prompt: false,
        });

        containerRef.current.innerHTML = '';

        window.google.accounts.id.renderButton(containerRef.current, {
          theme: 'outline',
          size: 'large',
          text,
          width: containerRef.current.offsetWidth || 360,
        });

        setIsReady(true);
      })
      .catch((error) => {
        onErrorRef.current(
          error instanceof Error ? error.message : 'Google auth failed to load.',
        );
      });

    return () => {
      mounted = false;
    };
  }, [disabled, text]);

  if (!GOOGLE_CLIENT_ID) {
    return (
      <Button disabled variant="secondary" className="w-full py-[13px] text-[11px]">
        {missingConfigLabel}
      </Button>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`min-h-[44px] w-full overflow-hidden ${
        disabled || !isReady ? 'opacity-60' : ''
      }`}
    />
  );
}