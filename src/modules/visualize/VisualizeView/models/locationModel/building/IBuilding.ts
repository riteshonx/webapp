import { ILevel } from '../level';

export interface IBuilding {
    buildingId: {projectLocationTreeId: string}[];
    levels: ILevel[];
}