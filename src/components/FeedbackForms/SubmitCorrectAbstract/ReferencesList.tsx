import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import FlexView from 'react-flexview';
import styled from 'styled-components';
import {
  referenceOptions,
  SubmitCorrectAbstractFormValues,
  Reference,
  EntryType,
} from '../models';
import { Control, SelectControl } from '../components';

interface IControlRow {
  count: number;
}
const ControlRow = styled.div<IControlRow>`
  display: flex;
  justify-content: flex-start;
  & > * {
    flex-basis: ${({ count }) => `${(1 / count) * 100}%`};
  }

  & > *:not(:first-child) {
    margin-left: 1rem;
  }
`;

const ControlContainer = styled.div`
  margin-bottom: 1rem;
`;

const name = 'references';

const ReferencesList: React.FC = () => {
  const { control, register, errors, getValues } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();
  const { fields, append, remove } = useFieldArray<Reference>({
    control,
    name,
  });

  const { entryType } = getValues();

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({
      value: '',
    });
  };

  const getErrorMessage = React.useCallback(
    (index: number, type: string, field: string): string | undefined => {
      if (
        field &&
        errors &&
        errors[type] &&
        errors[type].length &&
        errors[type][index] &&
        errors[type][index][field] &&
        errors[type][index][field].message
      ) {
        return errors[type][index][field].message;
      }
      return;
    },
    [errors]
  );

  return (
    <ControlContainer>
      {fields.map(({ id, type, value }, index) => {
        return (
          <ControlRow key={id} count={entryType === EntryType.Edit ? 2 : 1}>
            {entryType === EntryType.Edit && (
              <SelectControl
                field={`${name}[${index}].type`}
                label={`Reference ${index + 1} type`}
                a11yPrefix="feedback"
                ref={register()}
                defaultValue={type}
                errorMessage={getErrorMessage(index, name, 'type')}
              >
                {[
                  <option value="none" key="none">
                    Choose a type
                  </option>,
                  ...referenceOptions.map(({ key, text }) => (
                    <option value={key} key={key}>
                      {text}
                    </option>
                  )),
                ]}
              </SelectControl>
            )}
            <Control
              field={`${name}[${index}].value`}
              type="text"
              a11yPrefix="feedback"
              label={`Reference ${index + 1}`}
              defaultValue={value}
              errorMessage={getErrorMessage(index, name, 'value')}
              actionButton={
                <button
                  disabled={fields.length <= 1}
                  className="btn btn-danger"
                  onClick={() => handleRemove(index)}
                >
                  <i className="fa fa-trash" aria-hidden="true" />
                  <span className="sr-only">Remove</span>
                </button>
              }
              ref={register()}
            />
          </ControlRow>
        );
      })}
      <FlexView hAlignContent="left">
        <button type="button" className="btn btn-default" onClick={handleAdd}>
          <i className="fa fa-plus" aria-hidden="true" /> Add new reference
        </button>
      </FlexView>
    </ControlContainer>
  );
};

export default ReferencesList;
