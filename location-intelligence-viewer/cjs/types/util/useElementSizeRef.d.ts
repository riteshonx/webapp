import { RefObject } from 'react';
import { Size } from './size';
export declare function useElementSizeRef<T extends HTMLElement = HTMLDivElement>(elementRef: RefObject<T>): import("react").MutableRefObject<Size>;
