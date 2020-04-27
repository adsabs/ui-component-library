import React from 'react';
import { useFormContext } from 'react-hook-form';
import { SubmitCorrectAbstractFormValues } from '../models';
import { FormSubmissionCtx } from './SubmitCorrectAbstract';

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
    return (
      <div
        className="alert alert-info"
        style={{ marginTop: '1rem', textAlign: 'center' }}
      >
        <i className="fa fa-spinner fa-spin" aria-hidden /> Submitting...
      </div>
    );
  }

  if (submissionState?.status === 'success') {
    return (
      <div
        className="alert alert-success"
        style={{ marginTop: '1rem', textAlign: 'center' }}
      >
        <i className="fa fa-check" aria-hidden /> Submitted, Thank you!
      </div>
    );
  }

  if (submissionState?.status === 'error') {
    if (submissionState.code === 500 || submissionState.code === 404) {
      return (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          There was an error processing the request, please try again, or send
          an email with your changes to{' '}
          <strong>adshelp(at)cfa.harvard.edu</strong>.
        </div>
      );
    } else {
      return (
        <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
          <p>{submissionState.message}</p>
          <p>
            Please try again, or send an email with your changes to{' '}
            <strong>adshelp(at)cfa.harvard.edu</strong>.
          </p>
        </div>
      );
    }
  }

  return null;
};

export default FormStatus;
