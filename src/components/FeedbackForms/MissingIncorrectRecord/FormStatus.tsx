import React from 'react';
import { useFormContext } from 'react-hook-form';
import { MissingIncorrectRecordFormValues } from '../models';

const FormStatus: React.FunctionComponent = () => {
  const [doneSubmitting, setDoneSubmitting] = React.useState(false);

  const {
    errors,
    formState: { isSubmitting, isSubmitted },
  } = useFormContext<MissingIncorrectRecordFormValues>();

  React.useEffect(() => {
    if (!isSubmitting && isSubmitted) {
      setDoneSubmitting(true);
      setTimeout(() => setDoneSubmitting(false), 5000);
    }
  }, [isSubmitting, isSubmitted]);

  if (Object.keys(errors).length > 0) {
    return (
      <div className="alert alert-warning" style={{ marginTop: '1rem' }}>
        Form errors, check entries above
      </div>
    );
  }
  if (isSubmitting) {
    return (
      <div
        className="alert alert-info"
        style={{ marginTop: '1rem', textAlign: 'center' }}
      >
        <i className="fa fa-spinner fa-spin" aria-hidden /> Submitting...
      </div>
    );
  }

  if (doneSubmitting) {
    return (
      <div
        className="alert alert-success"
        style={{ marginTop: '1rem', textAlign: 'center' }}
      >
        <i className="fa fa-check" aria-hidden /> Submitted, Thank you!
      </div>
    );
  }

  return null;
};

export default FormStatus;
