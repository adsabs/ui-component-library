import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FlexView from 'react-flexview';
import styled from 'styled-components';
import RecordForm from './RecordForm';
import { Control, RadioControl, RecaptchaMessage } from '../components';
import FormPreview from './FormPreview';
import BibcodeLoaderBtn from './BibcodeLoaderBtn';
import FormStatus from './FormStatus';
import {
  SubmitCorrectAbstractFormValues,
  entryTypeOptions,
  EntryType,
} from '../models';

interface IMainFormProps {
  onSubmit?: () => void;
}
const MainForm: React.FunctionComponent<IMainFormProps> = ({ onSubmit }) => {
  const { register, errors, control } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();

  const [isLoaded, setIsLoaded] = React.useState(false);
  const entryType = useWatch<SubmitCorrectAbstractFormValues['entryType']>({
    control,
    name: 'entryType',
  });

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
        <RadioControl
          field="entryType"
          label="Entry Type"
          a11yPrefix="feedback"
          ref={register}
          options={entryTypeOptions}
          inline
        />
        <BibcodeLoaderBtn
          onLoaded={() => setIsLoaded(true)}
          onLoading={() => setIsLoaded(false)}
        />
      </FlexView>
      {entryType === EntryType.Edit && !isLoaded ? null : <RecordForm />}
      <hr className="hr" />
      <FormPreview
        onSubmit={onSubmit}
        disabled={entryType === EntryType.Edit && !isLoaded}
      />
      <RecaptchaMessage />
      <FormStatus />
    </React.Fragment>
  );
};

interface INewEditRadiosProps {
  onChange(value: string): void;
  defaultValue: string;
}
const NewEditRadios: React.FC<INewEditRadiosProps> = ({
  onChange,
  defaultValue,
}) => {
  const [val, setVal] = React.useState(defaultValue);
  const handleChange = React.useCallback(
    (e: React.FormEvent<HTMLInputElement>) => {
      setVal(e.currentTarget.name);
    },
    []
  );

  React.useEffect(() => {
    onChange(val);
  }, [val, onChange]);

  return (
    <div
      role="radio-group"
      className="form-group"
      aria-aria-labelledby="feedback-entry-type"
    >
      <RadioTitle id="feedback-entry-type">Record Type</RadioTitle>
      <label className="radio-inline">
        <input
          type="radio"
          name="new"
          checked={val === 'new'}
          onChange={handleChange}
        />
        New Record
      </label>
      <label className="radio-inline">
        <input
          type="radio"
          name="edit"
          checked={val === 'edit'}
          onChange={handleChange}
        />
        Edit Record
      </label>
    </div>
  );
};

NewEditRadios.defaultProps = {
  onChange: () => null,
  defaultValue: 'new',
};

const RadioTitle = styled.h3`
  font-size: inherit;
  font-weight: bold;
  margin-top: 0;
`;

export default MainForm;
