import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'react-bootstrap';

interface IModalButtonProps {
  children?: React.ReactNode;
  disabled?: boolean;
  beforeOpen?: () => Promise<boolean>;
  onSubmit?: () => void;
  onCancel?: () => void;
  buttonText?: string | React.ReactNode;
  buttonStyle?:
    | 'default'
    | 'primary'
    | 'danger'
    | 'warning'
    | 'info'
    | 'success';
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | undefined;
  modalTitle?: string | React.ReactNode;
}

const ModalButton: React.FunctionComponent<IModalButtonProps> = ({
  children,
  disabled,
  beforeOpen,
  onSubmit,
  onCancel,
  buttonText,
  buttonStyle,
  buttonSize,
  modalTitle,
}) => {
  const [open, setOpen] = React.useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (typeof onSubmit === 'function') {
      onSubmit();
    }
    setOpen(false);
  };
  const handleCancel = () => {
    setOpen(false);
    if (typeof onCancel === 'function') {
      onCancel();
    }
  };
  const handleOpen = async () => {
    let allow = true;
    if (typeof beforeOpen === 'function') {
      allow = await beforeOpen();
    }
    if (allow) {
      setOpen(true);
    }
  };

  return (
    <React.Fragment>
      <button
        type="button"
        className={`btn btn-${buttonStyle} ${
          buttonSize ? `btn-${buttonSize}` : ''
        }`}
        onClick={handleOpen}
        disabled={disabled}
      >
        {buttonText}
      </button>
      <Modal show={open} onHide={handleCancel} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>{modalTitle}</Modal.Title>
        </Modal.Header>
        <form onSubmit={handleSubmit}>
          <Modal.Body>{children}</Modal.Body>
          <Modal.Footer>
            <button type="submit" className="btn btn-primary">
              Submit
            </button>
            <button
              type="button"
              className="btn btn-default"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </Modal.Footer>
        </form>
      </Modal>
    </React.Fragment>
  );
};

ModalButton.defaultProps = {
  children: null,
  disabled: false,
  beforeOpen: async () => {
    return true;
  },
  onSubmit: () => {
    return null;
  },
  onCancel: () => {
    return null;
  },
  buttonText: '',
  modalTitle: '',
  buttonSize: undefined,
  buttonStyle: 'default',
};

ModalButton.propTypes = {
  children: PropTypes.node,
  disabled: PropTypes.bool,
  beforeOpen: PropTypes.func,
  onSubmit: PropTypes.func,
  onCancel: PropTypes.func,
  buttonText: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
  modalTitle: PropTypes.oneOf([PropTypes.string, PropTypes.node]),
  buttonSize: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  buttonStyle: PropTypes.oneOf([
    'default',
    'primary',
    'danger',
    'warning',
    'info',
    'success',
  ]),
};

export default ModalButton;
