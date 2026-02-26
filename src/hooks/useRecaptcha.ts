import React, {useCallback, useRef} from 'react';
import {useBumblebee} from './index';

declare global {
  export interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (
        siteKey: string,
        options: { action: string }
      ) => Promise<string>;
    };
  }
}

const SCRIPT_ID = 'ads-recaptcha-script';

const loadScript = (siteKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.defer = true;
    script.src =
      'https://www.google.com/recaptcha/api.js?render=' +
      encodeURIComponent(siteKey);

    script.onload = () => {
      if (
        window.grecaptcha &&
        typeof window.grecaptcha.ready === 'function'
      ) {
        window.grecaptcha.ready(() => resolve());
      } else {
        reject(new Error('reCAPTCHA did not initialize'));
      }
    };

    script.onerror = () => {
      reject(new Error('reCAPTCHA failed to load'));
    };

    document.head.appendChild(script);
  });
};

export const useRecaptcha = (formName: string) => {
  const {getAppConfig} = useBumblebee();
  const siteKey = React.useMemo(
    () => getAppConfig().recaptchaKey,
    [getAppConfig],
  );
  const loadPromiseRef = useRef<Promise<void> | null>(null);

  React.useEffect(() => {
    if (window.grecaptcha) {
      return;
    }
    if (!siteKey) {
      return;
    }
    loadPromiseRef.current = loadScript(siteKey);
  }, [siteKey]);

  const execute = useCallback(() => {
    return new Promise<string>((resolve, reject) => {
      const run = () => {
        if (!window.grecaptcha) {
          reject(new Error('reCAPTCHA not loaded'));
          return;
        }
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(siteKey, {action: `feedback/${formName}`})
            .then(resolve)
            .catch(reject);
        });
      };

      if (window.grecaptcha) {
        run();
      } else if (loadPromiseRef.current) {
        loadPromiseRef.current.then(run).catch(reject);
      } else {
        reject(new Error('reCAPTCHA not loaded'));
      }
    });
  }, [siteKey, formName]);

  return {
    execute,
  };
};
