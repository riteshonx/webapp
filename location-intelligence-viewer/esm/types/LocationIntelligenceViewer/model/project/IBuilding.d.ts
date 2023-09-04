export interface IBuilding {
    buildingId: string;
    externalReferenceId: string;
    modelId: string;
    name: string;
    latitude: number;
    longitude: number;
    heightmapBaseElevation: number;
    flatmapBaseElevation: number;
    baseElevation: number;
    trueNorth: number;
}
