import { IBuilding } from '../../project/IBuilding';
export declare class ProjectBuilding implements IBuilding {
    buildingId: string;
    externalReferenceId: string;
    modelId: string;
    name: string;
    baseElevation: number;
    latitude: number;
    longitude: number;
    trueNorth: number;
    heightmapBaseElevation: number;
    flatmapBaseElevation: number;
    constructor(buildingId: string, externalReferenceId: string, modelId: string, name: string, baseElevation: number, latitude: number, longitude: number, trueNorth: number);
}
