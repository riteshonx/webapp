import { gql, QueryHookOptions, useLazyQuery } from '@apollo/client';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { setCurrentProject } from 'src/modules/root/context/authentication/action';
import { stateContext as authContext } from 'src/modules/root/context/authentication/authContext';
import { decodeToken, getExchangeToken } from 'src/services/authservice';
import { myProjectRole } from 'src/utils/role';

interface Project {
    id: number;
    name: string;
}

const LIST_PROJECTS = gql `
    query ListProjects {
        projects: project {
            id
            name
        }
    }
`;

const headerLogoId = 'Header-Logo';
const gettStartedUserFlowId = 'userflow-ui';

export function usePCLMode() {
    const [isPCL, setIsPCL] = useState<boolean>();
    const [isUserPCLButNotAdmin, setIsPCLButNotAdmin] = useState<boolean>(false);
    const isUserPCLButNotAdminRef = useRef<boolean>(false);
    const isPCLRef = useRef<boolean>(false);
    const [pclProjectId, setPCLProjectId] = useState<number>();
    const { dispatch, state: authState }: any = useContext(authContext);

    const gettingStartedRemovalInterval = useRef<number>();

    const [listProjects] = useLazyQuery<{projects: Project[]}>(LIST_PROJECTS);
    
    useEffect(() => {
        setupPCLModeIfNeeded();
    }, []);
    
    useEffect(() => {
        if (authState?.projectList?.length > 1 && isUserPCLButNotAdmin) {
            setTimeout(() => {
                dispatch(setCurrentProject(authState?.projectList[1]));
                authState?.projectList[1] && setPCLProjectId(authState?.projectList[1].projectId)
            }, 100);
        }
    }, [authState?.projectList, isUserPCLButNotAdmin]);

    function setupPCLModeIfNeeded() {
        const {adminUser, tenantCompany} = decodeToken();
        const isPCL = tenantCompany.includes('PCL');
        const isPCLButNotAdmin = !adminUser && isPCL;
        setIsPCLButNotAdmin(isPCLButNotAdmin);
        setIsPCL(isPCL);

        isUserPCLButNotAdminRef.current = isPCLButNotAdmin;
        isPCLRef.current = isPCL;

        if (isPCLButNotAdmin) {
            disableAndHideHeaderElements();
        } else {
            enableAndShowHeaderElements();
        }

        //retrievePCLProjectId();
    }

    async function retrievePCLProjectId() {
        const options: QueryHookOptions | undefined = {
            context: {
                role: myProjectRole.viewMyProjects,
                token: getExchangeToken(),
            },
            fetchPolicy: 'no-cache'
        }
        const {data} = await listProjects(options);

        if (Boolean(data) && data!.projects.length > 0) {
            const projectId = data!.projects[0].id;
            setPCLProjectId(projectId);
        }
    }

    function disableAndHideHeaderElements() {
        const logoElement = document.getElementById(headerLogoId);
        logoElement!.style.cursor = 'default';
        logoElement!.style.pointerEvents = 'none';
    }

    function enableAndShowHeaderElements() {
        const logoElement = document.getElementById(headerLogoId);
        logoElement!.style.cursor = 'pointer';
        logoElement!.style.pointerEvents = 'all';
    }

    function onGettingStartedUserFlowInitialized() {
        if (isUserPCLButNotAdminRef.current) {
            findAndRemoveGettingStartedUserFlowOverlay();
        } else {
            findAndShowGettingStartedUserFlowOverlay();
        }
    }

    function findAndRemoveGettingStartedUserFlowOverlay() {
        clearInterval(gettingStartedRemovalInterval.current);

        gettingStartedRemovalInterval.current = +setInterval(() => {
            const gettingStartedUserFlowElement = document.getElementById(gettStartedUserFlowId);
            if (Boolean(gettingStartedUserFlowElement)) {
                gettingStartedUserFlowElement!.style.display = 'none';
                clearInterval(gettingStartedRemovalInterval.current);
            }
        }, 100);
    }

    function findAndShowGettingStartedUserFlowOverlay() {
        clearInterval(gettingStartedRemovalInterval.current);

        gettingStartedRemovalInterval.current = +setInterval(() => {
            const gettingStartedUserFlowElement = document.getElementById(gettStartedUserFlowId);
            if (Boolean(gettingStartedUserFlowElement)) {
                gettingStartedUserFlowElement!.style.display = 'block';
                clearInterval(gettingStartedRemovalInterval.current);
            }
        }, 100);

        // If it can't be found after 5 seconds stop looking
        setTimeout(() => {
            clearInterval(gettingStartedRemovalInterval.current);
        }, 5000)
    }

    return {isUserPCLButNotAdmin, isUserPCLButNotAdminRef, isPCL, isPCLRef, pclProjectId, onGettingStartedUserFlowInitialized} as const;
}