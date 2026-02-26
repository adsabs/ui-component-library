import React from 'react';
import { useFormContext } from 'react-hook-form';
import { AlertModal } from '../components';
import { AlertType } from '../components/AlertModal';
import { SubmitCorrectAbstractFormValues } from '../models';
import { FormSubmissionCtx } from './SubmitCorrectAbstract';

const CopyableChanges: React.FunctionComponent<{ changes: string }> = ({ changes }) => {
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

  return (
    <details style={{ marginTop: '0.75rem' }}>
      <summary style={{ cursor: 'pointer' }}>
        Copy your changes to include in an email
      </summary>
      <pre
        style={{
          marginTop: '0.5rem',
          padding: '0.75rem',
          background: '#f5f5f5',
          border: '1px solid #ddd',
          borderRadius: '3px',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          userSelect: 'all',
        }}
      >
        {decoded}
      </pre>
    </details>
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
    return <AlertModal type={AlertType.LOADING}>Submitting...</AlertModal>;
  }

  if (submissionState?.status === 'success') {
    return (
      <AlertModal type={AlertType.SUCCESS}>Submitted, thank you!</AlertModal>
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
        <AlertModal type={AlertType.ERROR} timeout={0}>
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
      <AlertModal type={AlertType.ERROR} timeout={0}>
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
