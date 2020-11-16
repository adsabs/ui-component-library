import React from 'react';

export type Ref = HTMLInputElement;

export type CheckboxOption = {
  label: string;
  key: string;
};

export interface CheckboxControlProps {
  field: string;
  label: string;
  a11yPrefix: string;
  helpMessage?: string;
  options: CheckboxOption[];
  inline?: boolean;
}
const CheckboxControl = React.forwardRef<Ref, CheckboxControlProps>(
  (props, ref) => {
    const { field, label, a11yPrefix, inline, helpMessage, options } = props;
    const labelId = `${a11yPrefix}_${field}_checkbox`;
    return (
      <div className="form-group" role="group" aria-labelledby={labelId}>
        <label
          id={labelId}
          className="control-label"
          style={{ display: 'block' }}
        >
          {label}
        </label>
        {inline
          ? options.map(({ label: optionLabel, key: value }) => (
              <label className="checkbox-inline" key={value}>
                <input type="checkbox" name={field} value={value} ref={ref} />
                {optionLabel}
              </label>
            ))
          : options.map(({ label: optionLabel, key: value }) => (
              <div className="checkbox" key={value}>
                <label>
                  <input type="checkbox" name={field} value={value} ref={ref} />
                  {optionLabel}
                </label>
              </div>
            ))}

        {helpMessage && <span className="help-block">{helpMessage}</span>}
      </div>
    );
  }
);

export default CheckboxControl;
