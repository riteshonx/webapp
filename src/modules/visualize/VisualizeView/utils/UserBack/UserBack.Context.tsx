import React, { createContext, MutableRefObject, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import ErrorDialog from 'src/modules/baseService/teammates/pages/AddTeammates/components/ErrorDialog';
import { tokenToString } from 'typescript';
import { useIsMounted } from '../../hooks/useIsMounted';
import { useProjectId } from '../../hooks/useProjectId';
import { UserDetail, useUserDetailContext } from '../UserDetail';
import './UserBackDef'
import { UserbackWidget } from './UserBackDef';
import { Userback } from './UserbackLoader';
const userBackToken = '37590|73397|UcdJnd34WhG6wNSdmP88BiWxy';

export interface UserBackContextObject {
    showUserback: () => void;
    destroyUserback: () => void;
    hideUserback: () => void;
    userbackLoaded: boolean;
}

export const UserBackContext = createContext<UserBackContextObject>({} as UserBackContextObject);

export function useUserBack(): UserBackContextObject {
    return useContext(UserBackContext);
}

interface UserBackContextProviderProps {
    children: ReactNode | ReactNode[];
}

export function UserBackProvider({children}: UserBackContextProviderProps) {
    const userBackRef = useRef<UserbackWidget>();
    const [userbackLoaded, setUserbackLoaded] = useState<boolean>(false);

    const {userDetail} = useUserDetailContext();
    const projectId = useProjectId();
    
    useEffect(() => {
        loadUserBack();
    }, []);

    useEffect(() => {
        if (userbackLoaded && Boolean(userDetail) && Boolean(projectId)) {
            setupUserbackProfile(userBackRef.current!, userDetail!, projectId!);
        }
    }, [userbackLoaded, userDetail, projectId]);

    async function loadUserBack() {
        const userBack = await Userback(userBackToken);

        userBackRef.current = userBack;
        setUserbackLoaded(true);
    }

    function setupUserbackProfile(userBack: UserbackWidget, userDetail: UserDetail, projectId: string) {
        userBack.identify(userDetail.email,
            {
                name: `${userDetail.firstName} ${userDetail.lastName}`,
                email: userDetail.email,
                jobTitle: userDetail.jobTitle,
                projectId: projectId,
                environment: process.env['REACT_APP_ENVIRONMENT']
            }
        );
    }

    function showUserback() {
        // TODO - calling this bugs out, not needed for now as Userback auto shows but this could be useful in the future.
        // userBackRef.current?.show();
    }

    function hideUserback() {
        userBackRef.current?.hide();
    }

    function destroyUserback(){
        userBackRef.current?.destroy();
        userBackRef.current?.removeFromDom();
    }

    const userBackContextObject: UserBackContextObject = {
        showUserback,
        destroyUserback,
        hideUserback,
        userbackLoaded,
    }
    
    return (
        <UserBackContext.Provider value={userBackContextObject}>
            {children}
        </UserBackContext.Provider>
    )
}