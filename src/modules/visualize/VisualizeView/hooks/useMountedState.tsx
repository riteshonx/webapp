import { useState } from 'react';

import { useIsMounted } from './useIsMounted';

export function useMountedState<T>(initialValue?: T) {
    const [state, setState] = useState<T | undefined>(initialValue || undefined);
    const isMounted = useIsMounted();

    function mountSafeSet(value: T) {
        if (isMounted.current) {
            setState(value);
        }
    }

    return [state, mountSafeSet] as const;
}