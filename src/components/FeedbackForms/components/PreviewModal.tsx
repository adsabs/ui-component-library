import React from 'react';
import { Modal, ModalProps } from 'react-bootstrap';
import { Recaptcha } from '../components';

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
        <Recaptcha onSubmit={onSubmit} onCancel={onCancel} />
      </Modal.Footer>
    </Modal>
  );
};

export default PreviewModal;
