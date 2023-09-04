import { Dialog, DialogContent } from '@material-ui/core';
import PropTypes from 'prop-types';
import React from 'react';
import './WarningMessage.scss';
const WarningMessage = (props: any) => {
  return (
    <div className="warning-message">
      <Dialog
        onClose={() => {
          props.onClose();
        }}
        open={props.open}
        maxWidth={'sm'}
        disableBackdropClick={true}
      >
        <DialogContent className="warning-message__content">
          <h3 className="warning-message__content__heading">{props.title}</h3>
          <p className="warning-message__content__text">{props.message}</p>
          {props.okay && (
            <div className="warning-message__content__footer">
              <button
                className="btn-primary warning-message__content__footer__button-ok"
                onClick={props.onOkayClick}
              >
                OK
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

WarningMessage.propType = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  title: PropTypes.string,
  message: PropTypes.string.isRequired,
};
WarningMessage.defaultProps = {
  title: 'Alert',
};

export default WarningMessage;
