import React, {useContext} from 'react';
import {useFormContext} from 'react-hook-form';
import {AlertModal} from '../components';
import {AlertType} from '../components/AlertModal';
import {EntryType, SubmitCorrectAbstractFormValues} from '../models';
import {FormSubmissionCtx, OriginCtx} from './SubmitCorrectAbstract';
import {createFeedbackString} from './FormPreview';
import {Button} from 'react-bootstrap';

const FormStatus: React.FunctionComponent = () => {
  const {submissionState} = React.useContext(FormSubmissionCtx);

  const {errors} = useFormContext<SubmitCorrectAbstractFormValues>();

  if (Object.keys(errors).length > 0) {
    return (
      <div className="alert alert-warning" style={{marginTop: '1rem'}}>
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
    return (
      <div className="alert alert-warning" style={{marginTop: '1rem'}}>
        <p>{submissionState.message}</p>
        <p>
          Unable to submit. Please try again, or send an email with your changes to{' '}
          <a target="_top"
             href="mailto:adshelp@cfa.harvard.edu?subject=Submit%2FCorrect%20Abstract&body=Changes%3A">adshelp(at)cfa.harvard.edu</a>.
          {' '}Sorry for the inconvenience.
        </p>
        <Changes/>
      </div>
    );
  }

  return null;
};

const Changes = () => {
  const [isCopied, setIsCopied] = React.useState(false);
  const [copyFailed, setCopyFailed] = React.useState(false);
  const {origin} = useContext(OriginCtx);
  const {getValues} = useFormContext<SubmitCorrectAbstractFormValues>();
  const isEdit = origin.entryType === EntryType.Edit;
  let changes: string | null;
  try {
    const feedback = createFeedbackString(origin, getValues(), '');
    if (isEdit) {
      changes = JSON.stringify({original: feedback.original, updated: feedback.new});
    } else {
      changes = JSON.stringify(feedback.new);
    }
  } catch (e) {
    changes = null;
  }

  const copy = () => {
    if (changes && 'clipboard' in navigator) {
      navigator.clipboard.writeText(changes).then(() => {
        setIsCopied(true);
      }).catch(() => {
        setCopyFailed(true);
      }).finally(() => {
        setTimeout(() => setIsCopied(false), 1000);
        setTimeout(() => setCopyFailed(false), 3000)
      })
    }
  }

  if (!changes) {
    return null;
  }

  return (<>
    <p>{isEdit ? 'Changes to be made:' : 'New submission:'}</p>
    <p>
        <pre>{changes}</pre>
        <Button onClick={copy}>Copy {isEdit ? 'changes' : 'submission'} to clipboard</Button>
        {isCopied && <span style={{marginLeft: '1rem'}}>Copied!</span>}
        {copyFailed && <span style={{marginLeft: '1rem'}}>Copy is unsupported in this browser for some reason, please try manually</span>}
    </p>
  </>);
}

export default FormStatus;
