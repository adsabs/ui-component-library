import React from 'react';

interface LabelProps {
  htmlFor: string;
  children: React.ReactNode;
  required: boolean;
}
const Label: React.FC<LabelProps> = ({ htmlFor, children, required }) => {
  return (
    <label htmlFor={htmlFor} className="control-label">
      {required ? (
        <>
          {children}{' '}
          <span aria-hidden="true" className="text-danger">
            *
          </span>
        </>
      ) : (
        children
      )}
    </label>
  );
};

export type Ref = HTMLInputElement;

export interface IControlProps {
  type: string;
  field: string;
  a11yPrefix: string;
  label: string;
  placeholder?: string;
  errorMessage?: string | React.ReactElement;
  helpMessage?: string;
  defaultValue?: string;
  required?: boolean;
  onChange?: React.FormEventHandler<HTMLInputElement>;
  actionButton?: React.ReactNode;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}
const Control = React.forwardRef<Ref, IControlProps>((props, ref) => {
  const {
    type,
    field,
    label,
    a11yPrefix,
    placeholder,
    errorMessage,
    helpMessage,
    defaultValue,
    actionButton,
    onChange,
    required,
    inputProps,
  } = props;
  const inputId = `${a11yPrefix}_${field}_${type}`;
  const formGroupClasses = [
    'form-group',
    'has-feedback',
    errorMessage ? 'has-error' : '',
  ].join(' ');

  return (
    <div className={formGroupClasses}>
      <Label htmlFor={inputId} required={!!required}>
        {label}
      </Label>
      {actionButton ? (
        <div className="input-group">
          <input
            type={type}
            name={field}
            id={inputId}
            ref={ref}
            defaultValue={defaultValue}
            placeholder={placeholder}
            className="form-control"
            aria-required={required}
            onChange={onChange}
            {...inputProps}
          />
          <span className="input-group-btn">{actionButton}</span>
        </div>
      ) : (
        <input
          type={type}
          name={field}
          id={inputId}
          ref={ref}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="form-control"
          aria-required={required}
          onChange={onChange}
          {...inputProps}
        />
      )}
      {(() => {
        if (errorMessage) {
          return <span className="help-block with-errors">{errorMessage}</span>;
        } else if (helpMessage) {
          return <span className="help-block">{helpMessage}</span>;
        }
        return null;
      })()}
    </div>
  );
});

export default Control;
