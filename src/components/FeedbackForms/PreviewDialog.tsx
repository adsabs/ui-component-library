import React from 'react';
import PropTypes from 'prop-types';
import { Dialog, DialogFooter, DialogType } from '@fluentui/react/lib/Dialog';
import { DefaultButton, PrimaryButton } from '@fluentui/react/lib/Button';
import { hiddenContentStyle, mergeStyles } from '@fluentui/react/lib/Styling';

interface IPreviewDialogProps {
  children?: React.ReactNode;

  /**
   * Fired when the submit button is pressed
   *
   * @param {Function} closeDialog - callback to close dialog
   */
  onSubmit?(): void;

  disabled?: boolean;
}

const screenReaderOnly = mergeStyles(hiddenContentStyle);
const labelId = 'preview_label';

const PreviewDialog: React.FunctionComponent<IPreviewDialogProps> = ({
  children,
  onSubmit,
  disabled,
}) => {
  const [hidden, setHidden] = React.useState(true);

  return (
    <React.Fragment>
      <PrimaryButton
        text="Preview"
        secondaryText="opens dialog to preview submission"
        onClick={() => setHidden(false)}
        disabled={disabled}
      />
      <label id={labelId} className={screenReaderOnly}>
        Preview submission before you send.
      </label>
      <Dialog
        hidden={hidden}
        dialogContentProps={{
          type: DialogType.normal,
          title: 'Previewing Submission',
          closeButtonAriaLabel: 'Close',
        }}
        modalProps={{
          titleAriaId: labelId,
          isBlocking: false,
          styles: {
            main: {
              selectors: {
                ['@media (min-width: 480px)']: {
                  minWidth: 450,
                },
              },
            },
          },
        }}
      >
        {children}
        <DialogFooter>
          <PrimaryButton
            text="Submit"
            onClick={() => {
              if (typeof onSubmit === 'function') {
                onSubmit();
              }
              setHidden(true);
            }}
          />
          <DefaultButton text="Cancel" onClick={() => setHidden(true)} />
        </DialogFooter>
      </Dialog>
    </React.Fragment>
  );
};

PreviewDialog.defaultProps = {
  children: null,
  onSubmit: () => {
  },
  disabled: false,
};

PreviewDialog.propTypes = {
  children: PropTypes.element,
  onSubmit: PropTypes.func,
  disabled: PropTypes.bool,
};

export default PreviewDialog;
