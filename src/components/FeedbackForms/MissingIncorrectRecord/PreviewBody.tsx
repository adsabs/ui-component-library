import React from 'react';
import { useFormContext } from 'react-hook-form';
import Async from 'react-async';
import { apiFetch, ApiTarget } from '../api';
import { MissingIncorrectRecordFormValues } from '../models';

export const generatePreview = (
  { bibcodes, email, name }: MissingIncorrectRecordFormValues,
  data: { export: string },
  ref: React.Ref<HTMLPreElement>
) => {
  if (data && data.export) {
    return (
      <pre ref={ref}>
        {`From: ${name}
Address: ${email}

Missing references:
${data.export
  .split(/\n/g)
  .map((reference, i) => {
    if (reference.length > 0) {
      return `${i + 1}:${i < 9 ? '  ' : ' '}${bibcodes[i].citing} -> ${
        bibcodes[i].cited
      } (${reference})`;
    }
    return undefined;
  })
  .join('\n')}`}
      </pre>
    );
  } else {
    return 'Sorry, unable to generate preview (you can still submit)';
  }
};

export const fetchReference = (
  bibcodes: MissingIncorrectRecordFormValues['bibcodes']
) => {
  return apiFetch({
    target: ApiTarget.EXPORT + 'custom',
    options: {
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({
        bibcode: bibcodes.map((e) => e.cited),
        format: ['%1l (%Y), %Q'],
      }),
    },
  });
};

const PreviewBody = React.forwardRef<HTMLPreElement>((_, ref) => {
  const { getValues } = useFormContext<MissingIncorrectRecordFormValues>();

  const fetchReferenceString = React.useCallback(() => {
    const { bibcodes } = getValues();
    return fetchReference(bibcodes);
  }, []);

  return (
    <Async promiseFn={fetchReferenceString}>
      <Async.Pending>loading...</Async.Pending>
      <Async.Fulfilled>
        {(data: any) => generatePreview(getValues(), data, ref)}
      </Async.Fulfilled>
      <Async.Rejected>
        {(error) => (
          <>
            <p>Sorry, unable to generate preview (you can still submit)</p>
            <div className="alert alert-danger">
              {(error as any)?.responseJSON?.error || 'Server Error'}
            </div>
          </>
        )}
      </Async.Rejected>
    </Async>
  );
});

export default PreviewBody;
