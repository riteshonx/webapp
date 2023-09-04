import React, { ReactElement, useContext, useEffect } from 'react';
import { setIsLoading } from '../../context/authentication/action';
import { stateContext } from '../../context/authentication/authContext';

export default function Fallback(): ReactElement {
  const {dispatch}: any = useContext(stateContext);

  useEffect(() => {
    dispatch(setIsLoading(true));
    return () => {
      dispatch(setIsLoading(false));
    }
  }, [])

  return (
    <div></div>
  )
}