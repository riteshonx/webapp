import { RefObject, useEffect, useRef } from 'react';

export function useEventListener<T extends HTMLElement | undefined>(
    eventName: keyof WindowEventMap,
    handler: (event: Event) => void,
    element?: RefObject<T>,
) {
    const savedHandler = useRef<(event: Event) => void>()

    useEffect(() => {
        const targetElement: T | Window = element?.current || window
        if (!(targetElement && targetElement.addEventListener)) {
            return
        }

        if (savedHandler.current !== handler) {
            savedHandler.current = handler
        }

        const eventListener = (event: Event) => {
            if (!!savedHandler?.current) {
                savedHandler.current(event)
            }
        }

    targetElement.addEventListener(eventName, eventListener);

    return () => {
        targetElement.removeEventListener(eventName, eventListener);
    }
  }, [eventName, element, handler]);
}