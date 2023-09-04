import jwtDecode from 'jwt-decode';
import { useContext, useMemo } from 'react';
import { stateContext as authContext } from 'src/modules/root/context/authentication/authContext';

interface ProjectToken {
    'x-hasura-project-id': number;
}

export function useProjectId() {
    const { state: authState }: any = useContext(authContext);

    const projectId = useMemo(() => {
        if (Boolean(authState?.selectedProjectToken)) {
            const projectToken = authState.selectedProjectToken;
            const decryptedToken = jwtDecode<ProjectToken>(projectToken);

            return decryptedToken['x-hasura-project-id'].toString();
        }
    }, [authState]);

    return projectId;
}