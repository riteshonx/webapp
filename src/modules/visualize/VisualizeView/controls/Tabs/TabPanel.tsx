import { ReactNode } from 'react';

const tabHeaderHeight = 48;

export interface TabPanelProps {
    children?: ReactNode | ReactNode[];
    index: number;
    value: number;
}
  
export function TabPanel({children, index, value}: TabPanelProps) {
    return (
        <div
            style={{height: 'calc(100% - 48px)'}}
            role="tabpanel"
            hidden={value !== index}
            id={`tab-${index}`}
        >
            {
                value === index && Boolean(children) && children
            }
        </div>
    );
}