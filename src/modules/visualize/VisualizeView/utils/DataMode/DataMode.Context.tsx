import { createContext, ReactNode, useContext, useState } from 'react';

export type DataModes = 'BIM360' | 'Checklist' | 'Issues' | 'All' | undefined;

export interface DataModeContextObject {
    dataMode?: DataModes,
    setDataMode: (dataMode: DataModes) => void;
}

export const DataModeContext = createContext<DataModeContextObject>({} as DataModeContextObject);

export function useDataMode(): DataModeContextObject {
    return useContext(DataModeContext);
}

interface DataModeContextProviderProps {
    children: ReactNode | ReactNode[];
}

export function DataModeProvider({children}: DataModeContextProviderProps) {
    const [dataMode, setDataMode] = useState<DataModes>();

    const dataModeContextObject: DataModeContextObject = {
        dataMode,
        setDataMode,
    }
    
    return (
        <DataModeContext.Provider value={dataModeContextObject}>
            {children}
        </DataModeContext.Provider>
    )
}