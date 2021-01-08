import React from 'react';
import { useFormContext } from 'react-hook-form';

declare var bbb: any;
const getRecaptchaManager = () => {
  return bbb.getBeeHive().getObject('RecaptchaManager');
};

interface IRecaptchaProps {
  onSubmit(): void;
  onCancel(): void;
}

const Recaptcha: React.FC<IRecaptchaProps> = ({ onSubmit, onCancel }) => {
  const el = React.useRef<HTMLDivElement>(null);
  const [canSubmit, setCanSubmit] = React.useState<boolean>(false);
  const { setValue, register } = useFormContext();
  const handleSubmit = React.useCallback(() => {
    if (canSubmit) {
      onSubmit();
    }
  }, [canSubmit]);

  React.useEffect(() => {
    const render = async () => {
      register('recaptcha');
      const { siteKeyDeferred, grecaptchaDeferred } = getRecaptchaManager();
      const [sitekey, grecaptcha] = await Promise.all([
        siteKeyDeferred,
        grecaptchaDeferred,
      ]);
      if (el.current) {
        grecaptcha.render(el.current, {
          sitekey,
          size: 'normal',
          callback: (recaptcha: any) => {
            setValue('recaptcha', recaptcha);
            setCanSubmit(true);
          },
        });
      }
    };
    render();
  }, [el]);

  return (
    <>
      <div
        id="recaptcha-container"
        ref={el}
        style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}
      />
      <button
        type="submit"
        className="btn btn-primary g-recaptcha"
        onClick={handleSubmit}
      >
        Submit
      </button>
      <button type="button" className="btn btn-default" onClick={onCancel}>
        Cancel
      </button>
    </>
  );
};

export const RecaptchaMessage = () => {
  return (
    <div
      style={{ marginTop: '1rem' }}
      className="form-group"
      dangerouslySetInnerHTML={{ __html: getRecaptchaManager().googleMsg() }}
    ></div>
  );
};

export default Recaptcha;
