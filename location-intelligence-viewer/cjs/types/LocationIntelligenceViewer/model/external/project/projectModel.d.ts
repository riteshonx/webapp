import { ProjectLevel } from './projectLevel';
export declare class ProjectModel {
    modelId: string;
    title: string;
    geometry: ArrayBuffer;
    levels: ProjectLevel[];
    constructor(modelId: string, title: string, geometry: ArrayBuffer, levels: ProjectLevel[]);
}
