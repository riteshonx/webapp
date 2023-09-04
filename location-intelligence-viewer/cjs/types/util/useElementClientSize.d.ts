import { RefObject } from 'react';
import { Size } from './size';
export declare function useElementClientSize<T extends HTMLElement = HTMLDivElement>(elementRef: RefObject<T>): Size;
