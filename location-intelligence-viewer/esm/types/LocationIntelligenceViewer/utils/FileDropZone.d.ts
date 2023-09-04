import { ReactNode } from 'react';
interface FileDropZoneProps {
    children: ReactNode | ReactNode[];
    onFileDrop: (files: File[]) => void;
}
export declare function FileDropZone({ children, onFileDrop }: FileDropZoneProps): JSX.Element;
export {};
