const SCRIPT_ID = 'ads-recaptcha-script';
let loadingPromise: Promise<typeof window.grecaptcha> | null = null;

const clearLoading = () => {
  loadingPromise = null;
};

const createScript = (siteKey: string) => {
  return new Promise<typeof window.grecaptcha>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing && existing.parentNode) {
      existing.parentNode.removeChild(existing);
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.dataset.siteKey = siteKey;
    script.async = true;
    script.defer = true;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.onload = () => {
      if (window.grecaptcha && typeof window.grecaptcha.ready === 'function') {
        window.grecaptcha.ready(() => resolve(window.grecaptcha));
      } else {
        reject(new Error('reCAPTCHA did not initialize'));
      }
    };
    script.onerror = () => reject(new Error('reCAPTCHA failed to load'));
    document.head.appendChild(script);
  })
    .then((res) => {
      clearLoading();
      return res;
    })
    .catch((err) => {
      clearLoading();
      throw err;
    });
};

export const loadRecaptcha = (siteKey: string) => {
  const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
  if (
    window.grecaptcha &&
    typeof window.grecaptcha.execute === 'function' &&
    existing &&
    existing.dataset.siteKey === siteKey
  ) {
    return Promise.resolve(window.grecaptcha);
  }
  if (loadingPromise) {
    return loadingPromise;
  }
  loadingPromise = createScript(siteKey);
  return loadingPromise;
};

export const executeRecaptcha = (siteKey: string, action: string, timeoutMs = 8000) => {
  return new Promise<string>((resolve, reject) => {
    let finished = false;
    const timeout = setTimeout(() => {
      if (!finished) {
        finished = true;
        reject(new Error('reCAPTCHA timed out'));
      }
    }, timeoutMs);

    loadRecaptcha(siteKey)
      .then(() => {
        window.grecaptcha
          .execute(siteKey, {action})
          .then((token) => {
            finished = true;
            clearTimeout(timeout);
            resolve(token);
          })
          .catch((err) => {
            finished = true;
            clearTimeout(timeout);
            reject(err);
          });
      })
      .catch((err) => {
        finished = true;
        clearTimeout(timeout);
        reject(err);
      });
  });
};
