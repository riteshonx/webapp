import { QueryHookOptions } from '@apollo/client';
import { useContext, useMemo } from 'react';
import { stateContext as authContext } from 'src/modules/root/context/authentication/authContext';
import { getExchangeToken } from 'src/services/authservice';

export function useProjectQueryOptions(role: string) {
    const { state: authState }: any = useContext(authContext);

    const queryOptions = useMemo(() => {
        const token = authState?.selectedProjectToken;

        if (Boolean(role) && Boolean(token)) {
            const options: QueryHookOptions | undefined = {
                context: {
                    role: role,
                    token: token,
                },
                fetchPolicy: 'no-cache'
            }

            return options;
        }
    }, [authState?.selectedProjectToken, role]);

    return queryOptions;
}

export function useLoginQueryOptions(role: string) {
    const queryOptions = useMemo(() => {
        const token = getExchangeToken();

        if (Boolean(role) && Boolean(token)) {
            const options: QueryHookOptions | undefined = {
                context: {
                    role: role,
                    token: token,
                },
                fetchPolicy: 'no-cache'
            }

            return options;
        }
    }, [role]);

    return queryOptions;
}