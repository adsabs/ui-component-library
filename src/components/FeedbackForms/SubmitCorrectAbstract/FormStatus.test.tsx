// MutationObserver is used by react-hook-form but is absent from the jsdom version
// shipped with react-scripts 3.x. Provide a minimal stub to prevent crashes.
if (typeof MutationObserver === 'undefined') {
  (global as any).MutationObserver = class {
    observe() {}
    disconnect() {}
    takeRecords() { return []; }
  };
}

import React from 'react';
import { render, screen } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SubmitCorrectAbstractFormValues } from '../models';
import FormStatus from './FormStatus';
import { FormSubmissionCtx } from './SubmitCorrectAbstract';

// Mock the SubmitCorrectAbstract internal API module (uses lodash global _ which is unavailable in jsdom)
jest.mock('./api', () => ({
  fetchFullRecord: jest.fn(),
}));

const Wrapper: React.FC<{ submissionState: any }> = ({ submissionState }) => {
  const methods = useForm<SubmitCorrectAbstractFormValues>();
  return (
    <FormProvider {...(methods as any)}>
      <FormSubmissionCtx.Provider
        value={{ submissionState, setSubmissionState: () => null }}
      >
        <FormStatus />
      </FormSubmissionCtx.Provider>
    </FormProvider>
  );
};

it('shows user-friendly message when recaptcha fails', () => {
  render(
    <Wrapper
      submissionState={{
        status: 'error',
        message: 'Recaptcha not loaded',
        changes: encodeURIComponent('title: Old Title -> New Title'),
      }}
    />
  );
  expect(screen.getByText(/security check could not load/i)).toBeTruthy();
});

it('shows copy button when diff is available', () => {
  render(
    <Wrapper
      submissionState={{
        status: 'error',
        message: 'Recaptcha not loaded',
        changes: encodeURIComponent('title: Old Title -> New Title'),
      }}
    />
  );
  expect(
    screen.getByText(/copy your changes to include in an email/i)
  ).toBeTruthy();
});

it('shows generic server error for 500', () => {
  render(
    <Wrapper
      submissionState={{
        status: 'error',
        message: 'Internal Server Error',
        code: 500,
        changes: '',
      }}
    />
  );
  expect(screen.getByText(/error processing/i)).toBeTruthy();
});

it('does not show copyable block when changes is empty', () => {
  render(
    <Wrapper
      submissionState={{
        status: 'error',
        message: 'Something failed',
        code: 500,
        changes: '',
      }}
    />
  );
  expect(screen.queryByText(/copy your changes/i)).toBeNull();
});
