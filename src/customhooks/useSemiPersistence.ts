import { useEffect, useRef, useState } from "react";

export default function useSemiPersistence(
  key: string,
  initValue: number
): [number, (e: any) => void] {
  const [value, setValue] = useState<number>(
    Number(localStorage.getItem(key)) || initValue
  );
  const isMounted: any = useRef(false);

  useEffect(() => {
    if (!isMounted) {
      isMounted.current = true;
      return;
    }
    localStorage.setItem(key, value.toString());
  }, [key, value]);

  return [value, setValue];
}
