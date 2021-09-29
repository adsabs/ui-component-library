import React from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useFormContext } from 'react-hook-form';
import { useBumblebee } from '../../../hooks';

const Recaptcha = () => {
  const { getAppConfig } = useBumblebee();
  const {
    register,
    setValue,
    formState: { isSubmitting },
  } = useFormContext();
  const ref = React.useRef<ReCAPTCHA>(null);
  const siteKey = React.useMemo(() => getAppConfig().recaptchaKey, [
    getAppConfig,
  ]);
  React.useEffect(() => register({ name: 'recaptcha' }, { required: true }));
  React.useEffect(() => {
    if (ref.current !== null) {
      ref.current.execute();
    }
  }, [isSubmitting]);

  const handleRecaptchaChange = (token: string | null) => {
    if (typeof token === 'string') {
      setValue('recaptcha', token);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <ReCAPTCHA
        ref={ref}
        size="invisible"
        sitekey={siteKey}
        onChange={handleRecaptchaChange}
        badge="inline"
      />
      <div className="form-group">
        <small className="recaptcha-msg">
          This site is protected by reCAPTCHA and the Google{' '}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noreferrer"
          >
            Privacy Policy
          </a>{' '}
          and{' '}
          <a
            href="https://policies.google.com/terms"
            target="_blank"
            rel="noreferrer"
          >
            Terms of Service
          </a>{' '}
          apply.
        </small>
      </div>
    </div>
  );
};

export default Recaptcha;
