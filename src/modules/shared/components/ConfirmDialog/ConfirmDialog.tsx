import React, { ReactElement } from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';

import './ConfirmDialog.scss';
import { Button } from '@material-ui/core';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import WarningIcon from '@material-ui/icons/Warning';

export default function ConfirmDialog(props: any): ReactElement {
  const handleClose = () => {
    props.close();
    sessionStorage.setItem('promptResponse', 'COMPLTETD');
  };

  const handleProceed = () => {
    props.proceed();
    sessionStorage.setItem('promptResponse', 'PROCEED');
    handleClose();
  };

  return (
    <div>
      <Dialog
        open={props.open}
        onClose={handleClose}
        disableBackdropClick={true}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
        className={`${props.styleName}`}
      >
        <DialogContent>
          <div className="dialog">
            {props.message?.successIcon && (
              <div className="dialog__success">
                <div className="dialog__success__box">
                  <ThumbUpIcon className="dialog__success__box__icon" />
                </div>
              </div>
            )}
            {props.message?.warningIcon && (
              <div className="dialog__warning">
                <div className="dialog__warning__box">
                  <WarningIcon className="dialog__warning__box__icon" />
                </div>
              </div>
            )}
            {props?.message?.header ? (
              <div className="dialog__header">
                <div className="dialog__header__text">
                  {props?.message?.header}
                </div>
              </div>
            ) : (
              ''
            )}
            <div className="dialog__body">
              <p dangerouslySetInnerHTML={{ __html: props?.message?.text }}></p>
            </div>
            <div className="dialog__footer">
              {props?.message?.cancel ? (
                <Button
                  data-testid={'cancel-action'}
                  variant="outlined"
                  type="submit"
                  onClick={handleClose}
                  className="btn-secondary"
                  style={{
                    fontSize: '12px',
                  }}
                >
                  {props?.message?.cancel}
                </Button>
              ) : (
                ''
              )}
              {props.message?.proceed ? (
                <Button
                  autoFocus={true}
                  data-testid={'confirm-action'}
                  variant="contained"
                  type="submit"
                  onClick={handleProceed}
                  className="btn-primary"
                  style={{
                    fontSize: '12px',
                  }}
                >
                  {props.message.proceed}
                </Button>
              ) : (
                ''
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
