import React from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import ReCAPTCHA from 'react-google-recaptcha';
import { useFormContext } from 'react-hook-form';
import { useBumblebee } from '../../../hooks';

interface IPreviewModalProps extends ModalProps {
  onSubmit: () => void;
  onCancel: () => void;
}
const PreviewModal: React.FunctionComponent<IPreviewModalProps> = ({
  onSubmit,
  onCancel,
  children,
  ...modalProps
}) => {
  const [confirmed, setConfirmed] = React.useState(false);

  return (
    <Modal
      backdrop="static"
      bsSize="large"
      {...modalProps}
      className="feedback-preview-modal"
    >
      <Modal.Header closeButton>
        <Modal.Title>Previewing...</Modal.Title>
      </Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <div
          className="btn-toolbar"
          role="toolbar"
          aria-label="Recaptcha submission toolbar"
          style={{ marginBottom: '1rem' }}
        >
          <button
            type="submit"
            className="btn btn-primary"
            onClick={onSubmit}
            disabled={!confirmed}
          >
            Submit
          </button>
          <button type="button" className="btn btn-default" onClick={onCancel}>
            Cancel
          </button>
        </div>
        <Recaptcha onConfirm={() => setConfirmed(true)} />
      </Modal.Footer>
    </Modal>
  );
};

const Recaptcha = ({ onConfirm }: { onConfirm: () => void }) => {
  const { getAppConfig } = useBumblebee();
  const { register, setValue } = useFormContext();
  const siteKey = React.useMemo(() => getAppConfig().recaptchaKey, [
    getAppConfig,
  ]);
  React.useEffect(() => register({ name: 'recaptcha' }, { required: true }));

  const handleRecaptchaChange = (token: string | null) => {
    if (typeof token === 'string') {
      setValue('recaptcha', token);
      if (typeof onConfirm === 'function') {
        onConfirm();
      }
    }
  };

  return (
    <ReCAPTCHA
      size="normal"
      sitekey={siteKey}
      onChange={handleRecaptchaChange}
    />
  );
};

export default PreviewModal;
