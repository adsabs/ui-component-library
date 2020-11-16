import React from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import FlexView from 'react-flexview';
import { Control, SelectControl, RecaptchaMessage } from '../components';
import { relationOptions, AssociatedArticlesFormValues } from '../models';
import FormPreview from './FormPreview';
import FormStatus from './FormStatus';
import BibcodeList from './BibcodeList';

interface IMainFormProps {
  onSubmit?: () => void;
}
const MainForm: React.FunctionComponent<IMainFormProps> = ({ onSubmit }) => {
  const { register, errors } = useFormContext<AssociatedArticlesFormValues>();

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
        <SelectControl
          field="relation"
          label="Relation type"
          a11yPrefix="feedback"
          ref={register}
          errorMessage={errors.relation ? errors.relation.message : undefined}
          required
        >
          {[
            <option value="none" key="none">
              Choose a relation
            </option>,
            ...relationOptions.map(({ key, text }) => (
              <option value={key} key={key}>
                {text}
              </option>
            )),
          ]}
        </SelectControl>
        <RelationField />
      </FlexView>
      <hr className="hr" />
      <FormPreview onSubmit={onSubmit} />
      <RecaptchaMessage />
      <FormStatus />
    </React.Fragment>
  );
};

const RelationField: React.FunctionComponent = () => {
  const { register, errors, control } = useFormContext<
    AssociatedArticlesFormValues
  >();
  const relationKey = useWatch<AssociatedArticlesFormValues['relation']>({
    control,
    name: 'relation',
  });

  if (relationKey !== 'none') {
    const match = relationOptions.find((r) => r.key === relationKey);
    if (match) {
      const { label, secondaryLabel, key } = match;

      return (
        <>
          {key === 'other' && (
            <Control
              type="text"
              field="customRelation"
              label="Custom relation type"
              a11yPrefix="feedback"
              ref={register}
              errorMessage={
                errors.customRelation
                  ? errors.customRelation.message
                  : undefined
              }
            />
          )}
          <BibcodeList label={label} secondaryLabel={secondaryLabel} />
        </>
      );
    }
  }
  return null;
};

export default MainForm;
