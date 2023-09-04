import React, { useEffect, useContext } from 'react';
import { setIsNewSlateVersion } from 'src/modules/root/context/authentication/action';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

export const Schedule = (): React.ReactElement => {
  const { dispatch }: any = useContext(stateContext);
  useEffect(() => {
    dispatch(setIsNewSlateVersion(false));
  }, []);
  return <></>;
};
