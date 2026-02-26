import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertModal } from '../components';
import { AlertType } from '../components/AlertModal';
import { SubmitCorrectAbstractFormValues } from '../models';
import { FormSubmissionCtx } from './SubmitCorrectAbstract';

const CopyableChanges: React.FunctionComponent<{ changes: string }> = ({ changes }) => {
  const [copied, setCopied] = React.useState(false);

  if (!changes || changes === 'Unable%20to%20generate%20diff') {
    return null;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(changes);
  } catch (_e) {
    return null;
  }

  if (!decoded.trim()) {
    return null;
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(decoded).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div style={{ marginTop: '0.75rem' }}>
      <button
        type="button"
        className="btn btn-default"
        onClick={handleCopy}
      >
        <i
          className={`fa ${copied ? 'fa-check' : 'fa-clipboard'}`}
          aria-hidden
        />{' '}
        {copied ? 'Copied!' : 'Copy your changes to include in an email'}
      </button>
    </div>
  );
};

const FormStatus: React.FunctionComponent = () => {
  const { submissionState } = React.useContext(FormSubmissionCtx);
  const { errors } = useFormContext<SubmitCorrectAbstractFormValues>();

  if (Object.keys(errors).length > 0) {
    return (
      <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
        Form errors, check entries above
      </div>
    );
  }

  if (submissionState === null) {
    return null;
  }

  if (submissionState?.status === 'pending') {
    return <AlertModal key="pending" type={AlertType.LOADING}>Submitting...</AlertModal>;
  }

  if (submissionState?.status === 'success') {
    return (
      <AlertModal key="success" type={AlertType.SUCCESS}>Submitted, thank you!</AlertModal>
    );
  }

  if (submissionState?.status === 'error') {
    const hasHttpError =
      submissionState.code === 500 ||
      (submissionState.code != null &&
        submissionState.code >= 400 &&
        submissionState.code <= 499);

    const isRecaptchaError =
      !submissionState.code &&
      typeof submissionState.message === 'string' &&
      submissionState.message.toLowerCase().includes('recaptcha');

    if (isRecaptchaError) {
      return (
        <AlertModal
          key="error-recaptcha"
          type={AlertType.ERROR}
          title="Security Check Failed"
          timeout={0}
        >
          <p>
            Our security check could not load. Please refresh the page and
            try again.
          </p>
          <p>
            If the problem persists, send an email with your changes to{' '}
            <strong>adshelp@cfa.harvard.edu</strong>.
          </p>
          <CopyableChanges changes={submissionState.changes} />
        </AlertModal>
      );
    }

    if (hasHttpError) {
      return (
        <AlertModal key="error-http" type={AlertType.ERROR} timeout={0}>
          <p>
            There was an error processing the request, please try again, or
            send an email with your changes to{' '}
            <strong>adshelp@cfa.harvard.edu</strong>.
          </p>
          <CopyableChanges changes={submissionState.changes} />
        </AlertModal>
      );
    }

    return (
      <AlertModal key="error-generic" type={AlertType.ERROR} timeout={0}>
        <p>{submissionState.message}</p>
        <p>
          Please try again, or send an email with your changes to{' '}
          <strong>adshelp@cfa.harvard.edu</strong>.
        </p>
        <CopyableChanges changes={submissionState.changes} />
      </AlertModal>
    );
  }

  return null;
};

export default FormStatus;
