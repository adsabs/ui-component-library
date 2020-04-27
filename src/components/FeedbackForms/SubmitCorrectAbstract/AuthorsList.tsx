import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';
import FlexView from 'react-flexview';
import styled from 'styled-components';
import { Control } from '../components';
import { SubmitCorrectAbstractFormValues, Author } from '../models';

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

const name = 'authors';

const AuthorsList: React.FC = () => {
  const { control, register, errors } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();
  const { fields, append, remove } = useFieldArray<Author>({
    control,
    name,
  });

  const handleRemove = (index: number) => {
    remove(index);
  };
  const handleAdd = () => {
    append({
      aff: '',
      email: '',
      name: '',
    });
  };

  const getErrorMessage = React.useCallback(
    (index: number, type: string, field: string): string | undefined => {
      return errors?.[type]?.[index]?.[field]?.message;
    },
    [errors]
  );

  return (
    <ControlContainer>
      {fields.map(({ id, name: authorName, aff, email }, index) => {
        return (
          <ControlRow key={id} count={3}>
            <Control
              field={`${name}[${index}].name`}
              type="text"
              a11yPrefix="feedback"
              label={`Author Name ${index + 1}`}
              defaultValue={authorName}
              errorMessage={getErrorMessage(index, name, 'name')}
              ref={register()}
            />
            <Control
              field={`${name}[${index}].aff`}
              type="text"
              a11yPrefix="feedback"
              label={`Author Affiliation ${index + 1}`}
              defaultValue={aff}
              errorMessage={getErrorMessage(index, name, 'aff')}
              ref={register()}
            />
            <Control
              field={`${name}[${index}].email`}
              type="text"
              a11yPrefix="feedback"
              label={`Author Email ${index + 1}`}
              defaultValue={email}
              errorMessage={getErrorMessage(index, name, 'email')}
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
          <i className="fa fa-plus" aria-hidden="true" /> Add new author
        </button>
      </FlexView>
    </ControlContainer>
  );
};

export default AuthorsList;
