import React, { useContext, useEffect, useState } from 'react';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';

const NavigationInterceptor = (props: any) => {
  const { message, callBack } = props;
  const [show, setShow] = useState(true);

  useEffect(() => {
    setShow(true);
    return () => {
      setShow(false);
    };
  }, [message, callBack]);

  return show ? (
    <ConfirmDialog
      open={show}
      message={{ text: message, cancel: 'Stay', proceed: 'Leave' }}
      close={() => {
        callBack(false);
        setShow(false);
      }}
      proceed={() => {
        callBack(true);
        setShow(false);
      }}
    />
  ) : null;
};

export default NavigationInterceptor;
