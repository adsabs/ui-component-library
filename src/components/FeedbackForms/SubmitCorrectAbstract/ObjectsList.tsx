import React from 'react';
import FlexView from 'react-flexview';
import { useFieldArray, useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { Control } from '../components';
import { SubmitCorrectAbstractFormValues } from '../models';

interface IControlRow {
  count: number;
}
const ControlRow = styled.div<IControlRow>`
  display: flex;
  & > * {
    flex-basis: ${({ count }) => `${(1 / count) * 100}%`};
  }
`;

const ControlContainer = styled.div`
  margin-bottom: 1rem;
`;

const name = 'objects';

const KeywordsList: React.FC = () => {
  const { control, register, errors } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();
  const { fields, append, remove } = useFieldArray<{ value: string }>({
    control,
    name,
  });

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({ value: '' });
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
      {fields.map(({ id, value }, index) => {
        return (
          <ControlRow key={id} count={1}>
            <Control
              field={`${name}[${index}].value`}
              type="text"
              a11yPrefix="feedback"
              label={`Object ${index + 1}`}
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
          <i className="fa fa-plus" aria-hidden="true" /> Add new object
        </button>
      </FlexView>
    </ControlContainer>
  );
};

export default KeywordsList;
