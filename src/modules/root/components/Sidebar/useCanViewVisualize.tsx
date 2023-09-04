import { gql, QueryOptions } from '@apollo/client';
import { useContext, useEffect, useMemo, useState } from 'react';
import { stateContext as authContext } from 'src/modules/root/context/authentication/authContext';
import { decodeProjectExchangeToken } from 'src/services/authservice';
import { client } from 'src/services/graphql';
import { projectFeatureAllowedRoles } from 'src/utils/role';

const LIST_LOCATION_MODELS_GEOMETRY_IDS = gql `
    query ListLocationModels {
        locationModels: locationModel {
            id,
        }
    }
`;

// Todo - Remove this hook once a proper feature flag has been established for the Location-Intelligence feature.
export function useCanViewVisualize() {
    const [canViewLocationIntelligence, setCanViewLocationIntelligence] = useState<boolean>(false);

    const { state }: any = useContext(authContext);

    useEffect(() => {
        const queryOptions = buildQueryOptions();

        if (queryOptions) {
            checkIfUserCanViewVisualize(queryOptions);
        } else {
            setCanViewLocationIntelligence(false);
        }
    }, [state?.selectedProjectToken]);

    function buildQueryOptions() {
        if (Boolean(state?.selectedProjectToken)) {
            const permissions = decodeProjectExchangeToken(state?.selectedProjectToken).allowedRoles;
            const canViewBimModels = permissions.includes(projectFeatureAllowedRoles.viewBimModel);

            if (canViewBimModels) {
                const options: QueryOptions = {
                    query: LIST_LOCATION_MODELS_GEOMETRY_IDS,
                    context: {
                        role: projectFeatureAllowedRoles.viewBimModel,
                        token: state!.selectedProjectToken,
                    }, 
                    fetchPolicy: 'network-only',
                }
    
                return options;
            }
        }
    }

    async function checkIfUserCanViewVisualize(queryOptions: QueryOptions) {
        const {data} = await client.query<{locationModels: {id: number}[]}>(queryOptions!);
        const {locationModels} = data;

        const areLocationIntelligenceModelsTiedToThisProject = locationModels.length > 0;
        
        setCanViewLocationIntelligence(areLocationIntelligenceModelsTiedToThisProject);
    }

    return canViewLocationIntelligence;
}