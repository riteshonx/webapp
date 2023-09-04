import { useRef, useEffect } from "react";

export default function usePrevious(value: any) {
  const previous = useRef(null);

  useEffect(() => {
    if (previous.current !== value) {
      previous.current = value;
    }
  }, [value]);

  return previous.current;
}
