import { useEffect, useRef } from "react";

export default function useUpdateEffect(callback: any, deps: any) {
  const mount = useRef(false);

  useEffect(() => {
    if (!mount.current) {
      mount.current = true;
      return;
    }
    callback();
  }, deps);
}
