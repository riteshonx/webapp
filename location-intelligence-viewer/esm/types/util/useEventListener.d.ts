import { RefObject } from 'react';
export declare function useEventListener<T extends HTMLElement = HTMLDivElement>(eventName: keyof WindowEventMap, handler: (event: Event) => void, element?: RefObject<T>): void;
