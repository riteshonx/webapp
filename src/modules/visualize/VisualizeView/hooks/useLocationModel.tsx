import { gql, useLazyQuery } from '@apollo/client';
import { useContext, useEffect, useMemo, useState } from 'react';
import { postApi as authenticatedPost } from 'src/services/api';
import { projectFeatureAllowedRoles } from 'src/utils/role';

import { ILocationModel, LocationModel } from '../models/locationModel';
import { useProjectQueryOptions } from './useQueryOptions';

const LIST_LOCATION_MODELS = gql `
    query ListLocationModels {
        locationModels: locationModel {
            geometryKey,
            baseElevation,
            trueNorth,
            latitude,
            longitude
            sourceKey
            id
            title
            buildings: locationBuildings {
                buildingId: linkLocationProjectTreeLocationModel {
                    projectLocationTreeId
                }
                levels: locationLevels {
                    bounds
                    elevation
                    sourceId
                    levelId: linkLocationProjectTreeLocationModel {
                        projectLocationTreeId
                    }
                  	zones: locationZones {
                        sourceId
                        rooms: locationRooms {
                            sourceId
                        }
                    }
                    rooms: locationRooms {
                        sourceId
                    }
                }
            }
        }
    }
`;

export function useLocationModel() {
    const [locationModels, setLocationModels] = useState<LocationModel[]>([]);

    const queryOptions = useProjectQueryOptions(projectFeatureAllowedRoles.viewBimModel);

    const [listLocationModels, { data: locationModelsData }] = useLazyQuery<{locationModels: ILocationModel[]}>(LIST_LOCATION_MODELS);

    useEffect(() => {
        if (Boolean(queryOptions)) {
            listLocationModels(queryOptions);
        }
    }, [queryOptions]);

    useEffect(() => {
        if (Boolean(locationModelsData) && Boolean(locationModelsData?.locationModels)) {
            const {locationModels} = locationModelsData!;
            buildLocationModels(locationModels);
        }
    }, [locationModelsData]);

    async function buildLocationModels(locationModels: ILocationModel[]) {
        const locationModelPromises = locationModels.filter((model) => Boolean(model.geometryKey)).map(buildLocationModel);

        const newLocationModels = await Promise.all(locationModelPromises);
        setLocationModels(newLocationModels);
    }

    async function buildLocationModel(locationModel: ILocationModel) {
        const geometry = await retrieveLocationGeometry(locationModel);
        return new LocationModel(locationModel, geometry);
    }

    async function retrieveLocationGeometry(locationModel: ILocationModel) {
        const key = {
            key: locationModel.geometryKey,
            expiresIn: 604800,
        }

        const {success} = await authenticatedPost('V1/S3/downloadLink', [key]);
        const model = await (await fetch(success[0].url)).arrayBuffer();

        return model;
    }

    return {locationModels, locationModelsLoading: locationModels} as const;
}