import { yupResolver } from '@hookform/resolvers';
import React from 'react';
import FlexView from 'react-flexview';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as Yup from 'yup';
import { FormErrorBoundary } from '../components';
import { MissingIncorrectRecordFormValues, ReduxState } from '../models';
import MainForm from './MainForm';

export const defaultValues: MissingIncorrectRecordFormValues = {
  name: '',
  email: '',
  bibcodes: [{ cited: '', citing: '' }],
  recaptcha: '',
};

const validationSchema: Yup.ObjectSchema<MissingIncorrectRecordFormValues> = Yup.object().shape(
  {
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email()
      .required('Required'),
    bibcodes: Yup.array()
      .of(
        Yup.object().shape({
          citing: Yup.string()
            .trim()
            .length(19, 'Invalid Bibcode'),
          cited: Yup.string()
            .trim()
            .length(19, 'Invalid Bibcode')
            .test(
              'citing and cited not equal',
              'Bibcode is same as citing',
              function() {
                return this.parent.citing !== this.parent.cited;
              }
            ),
        })
      )
      .ensure(),
    recaptcha: Yup.string().ensure(),
  }
);

const emailSelector = ({ user }: ReduxState) => user.email;

const MissingIncorrectRecord: React.FunctionComponent = () => {
  const email = useSelector<
    ReduxState,
    MissingIncorrectRecordFormValues['email']
  >(emailSelector);

  const methods = useForm<MissingIncorrectRecordFormValues>({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      ...defaultValues,
      email: email ? email : '',
    },
  });

  const onSubmit = methods.handleSubmit((data) => {
    console.log('done', data);
  });

  return (
    <FormErrorBoundary>
      <FlexView column>
        <Heading>
          Submit missing references for the ADS Abstract Service
        </Heading>
        <FlexView column>
          <p>
            Please use this form to submit one or more citations currently
            missing from our databases.
          </p>
          <p>
            In order to use this form you will need to know the bibcodes of the
            citing and cited papers, and enter them in the appropriate fields.
          </p>
          <p>
            If either the citing or cited paper is not in ADS you should{' '}
            <a href="#feedback/correctabstract">submit a record</a> for it
            first.
          </p>
        </FlexView>
        <FormProvider {...(methods as any)}>
          <form>
            <MainForm onSubmit={onSubmit} />
          </form>
        </FormProvider>
      </FlexView>
    </FormErrorBoundary>
  );
};

const Heading = styled.h2`
  margintop: 0;
`;

export default MissingIncorrectRecord;
