import React from 'react';
import FlexView from 'react-flexview';
import { useFormContext } from 'react-hook-form';
import { Control, RecaptchaMessage } from '../components';
import { MissingIncorrectRecordFormValues } from '../models';
import BibcodeList from './BibcodeList';
import FormPreview from './FormPreview';
import FormStatus from './FormStatus';

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
        <FlexView>
          <div style={{ marginRight: '1rem', width: '100%' }}>
            <Control
              type="text"
              field="firstname"
              label="First Name"
              a11yPrefix="feedback"
              placeholder="John"
              ref={register}
              errorMessage={
                errors.firstname ? errors.firstname.message : undefined
              }
              required
            />
          </div>
          <Control
            type="text"
            field="lastname"
            label="Last Name"
            a11yPrefix="feedback"
            placeholder="Smith"
            ref={register}
            errorMessage={errors.lastname ? errors.lastname.message : undefined}
            required
          />
        </FlexView>
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
