import { createContext, ReactNode, useContext } from "react";
import { UserDetail, useUserDetail } from "./useUserDetail";

export interface UserDetailContextObject {
    userDetail?: UserDetail
}

export const UserDetailContext = createContext<UserDetailContextObject>({} as UserDetailContextObject);

export function useUserDetailContext(): UserDetailContextObject {
    return useContext(UserDetailContext);
}

interface UserDetailContextProviderProps {
    children: ReactNode | ReactNode[];
}

export function UserDetailProvider({children}: UserDetailContextProviderProps) {
    const userDetail = useUserDetail();

    const userDetailContextObject: UserDetailContextObject = {
        userDetail
    }
    
    return (
        <UserDetailContext.Provider value={userDetailContextObject}>
            {children}
        </UserDetailContext.Provider>
    )
}