import { useEffect, useRef } from 'react';

export function useIsMounted() {
    const isMounted = useRef<boolean>();

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return isMounted;
}