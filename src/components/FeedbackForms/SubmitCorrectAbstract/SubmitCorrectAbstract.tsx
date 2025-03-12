import { yupResolver } from '@hookform/resolvers';
import moment from 'moment';
import React from 'react';
import FlexView from 'react-flexview';
import { FormProvider, useForm } from 'react-hook-form';
import { useSelector } from 'react-redux';
import styled from 'styled-components';
import * as Yup from 'yup';
import { FormErrorBoundary } from '../components';
import { Collection, EntryType, ReduxState, SubmitCorrectAbstractFormValues } from '../models';
import MainForm from './MainForm';

const Heading = styled.h2`
  margin-top: 0;
`;

const validationSchema: Yup.ObjectSchema<SubmitCorrectAbstractFormValues> = Yup.object(
  {
    entryType: Yup.mixed(),
    name: Yup.string().required('Name is required'),
    email: Yup.string()
      .email()
      .required('Email is required'),
    collection: Yup.array().of(Yup.string()),
    bibcode: Yup.string(),
    title: Yup.string(),
    authors: Yup.array(
      Yup.object().shape({
        id: Yup.string(),
        position: Yup.number(),
        name: Yup.string(),
        aff: Yup.string(),
        orcid: Yup.string(),
      }),
    ),
    publication: Yup.string().required('Publication information is required'),
    publicationDate: Yup.string()
      .test(
        'valid date',
        'Invalid date (should be in YYYY-MM format)',
        (value: string) =>
          moment(
            value,
            ['YYYY-MM', 'YYYY-MM-DD', 'YYYY-00', 'YYYY-00-00', 'YYYY-MM-00'],
            true,
          ).isValid(),
      )
      .required('Publication date is required'),
    urls: Yup.array(
      Yup.object({
        type: Yup.mixed(),
        value: Yup.string(),
      }),
    ),
    abstract: Yup.string(),
    keywords: Yup.array(Yup.object().shape({ value: Yup.string() })),
    references: Yup.array(Yup.object().shape({ value: Yup.string() })),
    comments: Yup.string().ensure(),
    recaptcha: Yup.string().ensure(),
    confirmNoAuthor: Yup.boolean().test(
      'confirmNoAuthor',
      'Please confirm, this abstract has no author(s)',
      function (value) {
        const hasAuthors = this?.parent?.authors?.length > 0;
        return (value && !hasAuthors) || (!value && hasAuthors);
      },
    ),
  },
);

export const defaultValues: SubmitCorrectAbstractFormValues = {
  entryType: EntryType.Edit,
  name: '',
  email: '',
  collection: [Collection.Astronomy],
  bibcode: '',
  title: '',
  authors: [],
  publication: '',
  publicationDate: '',
  urls: [{ value: '' }],
  abstract: '',
  keywords: [{ value: '' }],
  references: [{ value: '' }],
  comments: '',
  recaptcha: '',
  confirmNoAuthor: false,
};

export interface IOriginContext {
  origin: SubmitCorrectAbstractFormValues;
  setOrigin: (values: SubmitCorrectAbstractFormValues) => void;
}

export const OriginCtx = React.createContext<IOriginContext>({
  origin: defaultValues,
  setOrigin: () => null,
});

export type SubmissionState =
  | { status: 'pending' }
  | { status: 'error'; message: string; code: number; changes: string }
  | { status: 'success' }
  | null;

export interface IFormSubmissionCtx {
  submissionState: SubmissionState;
  setSubmissionState: (state: SubmissionState) => void;
}

export const FormSubmissionCtx = React.createContext<IFormSubmissionCtx>({
  submissionState: null,
  setSubmissionState: () => null,
});

const emailSelector = ({ user: { email } }: ReduxState) => email;
const bibcodeSelector = ({ main: { bibcode } }: ReduxState) => bibcode;
const SubmitCorrectAbstract: React.FunctionComponent = () => {
  const email = useSelector<
    ReduxState,
    SubmitCorrectAbstractFormValues['email']
  >(emailSelector);

  const bibcode = useSelector<
    ReduxState,
    SubmitCorrectAbstractFormValues['bibcode']
  >(bibcodeSelector);

  const initialValues = {
    ...defaultValues,
    entryType: bibcode ? EntryType.Edit : EntryType.New,
    bibcode: bibcode ? bibcode : '',
    email: email ? email : '',
  };
  const methods = useForm<SubmitCorrectAbstractFormValues>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onBlur',
    reValidateMode: 'onBlur',
    shouldFocusError: true,
  });

  const [origin, setOrigin] = React.useState<SubmitCorrectAbstractFormValues>(
    initialValues,
  );
  const value = React.useMemo(() => ({ origin, setOrigin }), [origin]);

  const [submissionState, setSubmissionState] = React.useState<SubmissionState>(
    null,
  );
  const submissionValue = React.useMemo(
    () => ({ submissionState, setSubmissionState }),
    [submissionState],
  );

  // reset submission state
  React.useEffect(() => {
    let handle: number;
    if (submissionState) {
      handle = setTimeout(
        setSubmissionState,
        submissionState.status === 'success' ? 3000 : 30000,
        null,
      );
    }
    return () => clearTimeout(handle);
  }, [submissionState]);

  return (
    <FormErrorBoundary>
      <FlexView column>
        <Heading>
          Submit or Correct an Abstract for the ADS Abstract Service
        </Heading>
        <FlexView column>
          <p>
            Please use the following form to submit a new bibliographic record
            to ADS or correct an existing record.
          </p>
          <p>
            The required fields will be populated after you enter your contact
            information and select the appropriate database.
          </p>
        </FlexView>
        <FormProvider {...(methods as any)}>
          <FormSubmissionCtx.Provider value={submissionValue}>
            <OriginCtx.Provider value={value}>
              <form>
                <MainForm/>
              </form>
            </OriginCtx.Provider>
          </FormSubmissionCtx.Provider>
        </FormProvider>
      </FlexView>
    </FormErrorBoundary>
  );
};

export default SubmitCorrectAbstract;
