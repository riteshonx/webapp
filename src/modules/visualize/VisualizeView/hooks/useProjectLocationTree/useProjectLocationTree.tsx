import { gql, useLazyQuery } from '@apollo/client';
import { useEffect, useMemo, useState } from 'react';
import { projectFeatureAllowedRoles } from 'src/utils/role';

import { LocationTree } from '../../models/locationTree';
import { ILocationModelLink } from '../../models/locationTree/ILocationModelLink';
import { IProjectTreeNode } from '../../models/locationTree/IProjectTreeNode';
import { useProjectQueryOptions } from '../useQueryOptions';

const GET_PROJECT_LOCATION_NODES = gql `
    query GetProjectLocationTreeNodes {
        projectLocationNodes: projectLocationTree(order_by: {nodeName: asc}) {
            projectLocationTreeId: id
            nodeName
            parentProjectLocationTreeId: parentId
        }
    }
`;

const GET_PROJECT_LOCATION_MODELS = gql `
    query GetProjectLocationModelLinks {
        locationModelLinks: linkLocationProjectTreeLocationModel { 
            projectLocationTreeId
            locationBuildingId
            locationLevelId
            locationZoneId
            locationRoomId
            locationRoom {
                sourceId
            }
          	locationZone {
                sourceId
            }
            locationLevel {
                sourceId
            }
        }
    }
`

export function useProjectLocationTree() {
    const queryOptions = useProjectQueryOptions(projectFeatureAllowedRoles.viewBimModel);

    const [getProjectLocationTreeNodes, { data: projectLocationNodesData }] = useLazyQuery<{projectLocationNodes: IProjectTreeNode[]}>(GET_PROJECT_LOCATION_NODES);
    const [getProjectLocationTreeModels, { data: locationModelLinksData }] = useLazyQuery<{locationModelLinks: ILocationModelLink[]}>(GET_PROJECT_LOCATION_MODELS);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            getProjectLocationTreeNodes(queryOptions);
            getProjectLocationTreeModels(queryOptions);
        }
    }, [queryOptions]);

    const projectLocationTree = useMemo(() => {
        if (Boolean(projectLocationNodesData?.projectLocationNodes) && Boolean(locationModelLinksData?.locationModelLinks)) {
            const {projectLocationNodes} = projectLocationNodesData!;
            const {locationModelLinks} = locationModelLinksData!;

            const locationTree = new LocationTree(projectLocationNodes, locationModelLinks);
            
            return locationTree;
        }

        return undefined;
    }, [projectLocationNodesData, locationModelLinksData]);

    return projectLocationTree;
}