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

type ExecuteRef = () => void;

const Recaptcha: React.FC<IRecaptchaProps> = ({ onSubmit, onCancel }) => {
  const el = React.useRef<HTMLButtonElement>(null);
  const execute = React.useRef<ExecuteRef | null>(null);
  const { setValue, register, unregister } = useFormContext();
  const handleSubmit = () => {
    if (typeof execute.current === 'function') {
      execute.current();
    }
  };

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
          size: 'invisible',
          badge: 'inline',
          callback: (recaptcha: any) => {
            setValue('recaptcha', recaptcha);
            onSubmit();
          },
        });
      }

      execute.current = grecaptcha.execute;
    };
    render();
    return () => {
      unregister('recaptcha');
    };
  }, [el, execute]);

  return (
    <>
      <button
        type="submit"
        className="btn btn-primary g-recaptcha"
        ref={el}
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
