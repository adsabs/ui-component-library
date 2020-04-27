import React from 'react';
import { useFormContext, Controller } from 'react-hook-form';
import { CheckboxControl, Control } from '../components';
import UrlsList from './UrlsList';
import KeywordsList from './KeywordsList';
import ReferencesList from './ReferencesList';
import AuthorTable from './AuthorTable';
import { SubmitCorrectAbstractFormValues, collectionOptions } from '../models';
import styled from 'styled-components';

export interface IRecordFormProps {
  edit?: boolean;
}
const RecordForm: React.FC<IRecordFormProps> = () => {
  const { register, errors } = useFormContext<
    SubmitCorrectAbstractFormValues
  >();

  return (
    <>
      <CheckboxControl
        field="collection"
        label="Collection"
        a11yPrefix="feedback"
        ref={register}
        options={collectionOptions}
      />
      <Control
        type="text"
        field="title"
        label="Title"
        a11yPrefix="feedback"
        placeholder=""
        ref={register}
        errorMessage={errors.title ? errors.title.message : undefined}
        required
      />
      <Label>Authors</Label>
      <AuthorTable />
      <Control
        type="text"
        field="publication"
        label="Publication"
        a11yPrefix="feedback"
        placeholder=""
        ref={register}
        errorMessage={
          errors.publication ? errors.publication.message : undefined
        }
        helpMessage="include volume and page"
        required
      />
      <Control
        type="text"
        field="publicationDate"
        label="Publication Date"
        a11yPrefix="feedback"
        placeholder="YYYY-MM-DD"
        ref={register}
        errorMessage={
          errors.publicationDate ? errors.publicationDate.message : undefined
        }
        required
      />
      <Label>Urls</Label>
      <div className="well">
        <UrlsList />
      </div>
      <div className="form-group">
        <label htmlFor="feedback-abstract-textarea">Abstract</label>
        <Controller
          as="textarea"
          name="abstract"
          rows={5}
          id="feedback-abstract-textarea"
          className="form-control"
        />
      </div>
      <Label>Keywords</Label>
      <div className="well">
        <KeywordsList />
      </div>
      <Label>References</Label>
      <div className="well">
        <ReferencesList />
      </div>
      <div className="form-group">
        <label htmlFor="feedback-comments-textarea">User Comments</label>
        <Controller
          as="textarea"
          name="comments"
          rows={5}
          id="feedback-comments-textarea"
          className="form-control"
        />
      </div>
    </>
  );
};

const Label = styled.h3`
  font-size: inherit;
  display: inline-block;
  max-width: 100%;
  margin-bottom: 5px;
  font-weight: bold;
`;

export default RecordForm;
