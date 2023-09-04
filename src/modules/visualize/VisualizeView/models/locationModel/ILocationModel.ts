import { IBuilding } from './building';

export interface ILocationModel {
    id: string;
    baseElevation: number;
    trueNorth: number;
    geometryKey: string;
    latitude: number;
    longitude: number;
    title: string;

    buildings: IBuilding[];

    locationModelStatuses: [{status: string}];
}