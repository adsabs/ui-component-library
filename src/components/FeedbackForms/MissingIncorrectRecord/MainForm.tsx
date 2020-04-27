import React from 'react';
import { useFormContext } from 'react-hook-form';
import FlexView from 'react-flexview';
import FormPreview from './FormPreview';
import { Control, RecaptchaMessage } from '../components';
import FormStatus from './FormStatus';
import BibcodeList from './BibcodeList';
import { MissingIncorrectRecordFormValues } from '../models';

interface IMainFormProps {
  onSubmit?: () => void;
}
const MainForm: React.FunctionComponent<IMainFormProps> = ({ onSubmit }) => {
  const { register, errors } = useFormContext<
    MissingIncorrectRecordFormValues
  >();

  return (
    <React.Fragment>
      <FlexView column>
        <Control
          type="text"
          field="name"
          label="Name"
          a11yPrefix="feedback"
          placeholder="John Q. Smith"
          ref={register}
          errorMessage={errors.name ? errors.name.message : undefined}
          required
        />
        <Control
          type="text"
          field="email"
          label="Email"
          a11yPrefix="feedback"
          placeholder="john@example.com"
          ref={register}
          errorMessage={errors.email ? errors.email.message : undefined}
          required
        />
        <BibcodeList />
      </FlexView>
      <hr className="hr" />
      <FormPreview onSubmit={onSubmit} />
      <RecaptchaMessage />
      <FormStatus />
    </React.Fragment>
  );
};

export default MainForm;
