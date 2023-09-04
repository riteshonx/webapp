import { ReactElement, ReactNode } from 'react';

export interface Tab {
    label: string;
    panel: ReactNode | ReactNode[];
}