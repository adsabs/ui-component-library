import { SubmissionState } from './SubmitCorrectAbstract';

// TypeScript compile-time test: SubmissionState error must allow missing code
const stateWithCode: SubmissionState = {
  status: 'error',
  message: 'Something failed',
  code: 500,
  changes: 'some diff',
};

const stateWithoutCode: SubmissionState = {
  status: 'error',
  message: 'Recaptcha not loaded',
  changes: 'some diff',
  // code intentionally omitted
};

it('SubmissionState allows error without code', () => {
  expect(stateWithoutCode.status).toBe('error');
  expect(stateWithCode.code).toBe(500);
  expect(stateWithoutCode.code).toBeUndefined();
});
