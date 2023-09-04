/// <reference types="react" />
export declare function useStateRef<T>(initialState: T): readonly [T, (newState: T) => void, import("react").MutableRefObject<T>];
