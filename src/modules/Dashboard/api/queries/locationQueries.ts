import { gql } from "@apollo/client";

export const LIST_LOCATION_MODELS = gql`
query ListLocationModels {
    locationModels: locationModel {
        locationModelStatuses {
            status
        }
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