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
import { render, screen, fireEvent, act, wait } from '@testing-library/react';
import { FormProvider, useForm } from 'react-hook-form';
import { SubmitCorrectAbstractFormValues } from '../models';
import FormPreview from './FormPreview';
import { FormSubmissionCtx, OriginCtx, defaultValues } from './SubmitCorrectAbstract';

// Mock the recaptcha hook to simulate reCAPTCHA not being loaded
jest.mock('../../../hooks/useRecaptcha', () => ({
  useRecaptcha: () => ({
    execute: () => Promise.reject('Recaptcha not loaded'),
  }),
}));

// Mock apiFetch so no real network calls happen
jest.mock('../api', () => ({
  apiFetch: jest.fn(),
  ApiTarget: { FEEDBACK: 'feedback', FEEDBACK_FALLBACK: 'feedback_fallback', SEARCH: 'search' },
}));

// Mock the SubmitCorrectAbstract internal API module (uses lodash global _ which is unavailable in jsdom)
jest.mock('./api', () => ({
  fetchFullRecord: jest.fn(),
}));

const Wrapper: React.FC = ({ children }) => {
  const methods = useForm<SubmitCorrectAbstractFormValues>({ defaultValues });
  const [submissionState, setSubmissionState] = React.useState<any>(null);
  const submissionValue = { submissionState, setSubmissionState };
  const originValue = { origin: defaultValues, setOrigin: () => null };

  return (
    <FormProvider {...(methods as any)}>
      <FormSubmissionCtx.Provider value={submissionValue}>
        <OriginCtx.Provider value={originValue}>
          {children}
          <div data-testid="submission-state">
            {submissionState ? JSON.stringify(submissionState) : 'null'}
          </div>
        </OriginCtx.Provider>
      </FormSubmissionCtx.Provider>
    </FormProvider>
  );
};

it('sets error state when recaptcha is not loaded', async () => {
  render(
    <Wrapper>
      <FormPreview />
    </Wrapper>
  );

  // Click Preview to open the modal
  await act(async () => {
    fireEvent.click(screen.getByText('Preview'));
  });

  // Click Submit inside the modal — triggers handleSubmit which calls execute()
  await act(async () => {
    fireEvent.click(screen.getByText('Submit'));
  });

  // Wait for the async rejection to propagate and state to update
  await wait(() => {
    const stateEl = screen.getByTestId('submission-state');
    expect(stateEl.textContent).not.toBe('null');
  });

  const stateEl = screen.getByTestId('submission-state');
  const state = JSON.parse(stateEl.textContent!);
  expect(state.status).toBe('error');
  expect(state.message).toContain('Recaptcha');
});
