import { useEffect, useRef } from "react";

export default function useSkipFirstRender(
  callbackFunction: any,
  deps: Array<any>
) {
  const isMounted = useRef(false);
  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }
    callbackFunction();
  }, [...deps]);
}
