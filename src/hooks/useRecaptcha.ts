import React, {useCallback} from 'react';
import {useBumblebee} from './index';
import {executeRecaptcha as executeCoreRecaptcha} from '../utils/recaptchaCore';

declare global {
  export interface Window {
    grecaptcha: {
      ready: (cb: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    }
  }
}
export const useRecaptcha = (formName: string) => {
  const {getAppConfig} = useBumblebee();
  const siteKey = React.useMemo(() => getAppConfig().recaptchaKey, [
    getAppConfig,
  ]);

  const execute = useCallback((action?: string) => {
    const actionName = action || `feedback/${formName}`;
    return new Promise<string>((resolve, reject) => {
      executeCoreRecaptcha(siteKey, actionName)
        .then(resolve)
        .catch(reject);
    });
  }, [siteKey, formName]);

  return {
    execute,
  };
}
