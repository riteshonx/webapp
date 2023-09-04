import { createContext, MutableRefObject, ReactNode, useContext, useMemo } from 'react';

import { usePCLMode } from './usePCLMode';

export interface IsPCLContextObject {
    isUserPCLButNotAdmin: boolean,
    isUserPCLButNotAdminRef: MutableRefObject<boolean>,
    isPCL?: boolean,
    isPCLRef: MutableRefObject<boolean>,
    pclProjectId?: number,
    tilesets: string[],
    onGettingStartedUserFlowInitialized: () => void,
}

export const IsPCLContext = createContext<IsPCLContextObject>({} as IsPCLContextObject);

export function useIsPCL(): IsPCLContextObject {
    return useContext(IsPCLContext);
}

interface EngineContextProviderProps {
    children: ReactNode | ReactNode[];
}

export function IsPCLProvider({children}: EngineContextProviderProps) {
    const {isUserPCLButNotAdmin, isUserPCLButNotAdminRef, isPCL, isPCLRef, pclProjectId, onGettingStartedUserFlowInitialized} = usePCLMode();
    const tilesets = useMemo(() => isPCL ? ['slateit.PCL-MMH'] : [], [isPCL]);
    const isPCLContextObject: IsPCLContextObject = {
        isUserPCLButNotAdmin,
        isUserPCLButNotAdminRef,
        isPCL,
        isPCLRef,
        pclProjectId,
        tilesets,
        onGettingStartedUserFlowInitialized,
    }
    
    return (
        <IsPCLContext.Provider value={isPCLContextObject}>
            {children}
        </IsPCLContext.Provider>
    )
}