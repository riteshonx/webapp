import { IProject } from '../../project/IProject';
import { ProjectBuilding } from './projectBuilding';
import { ProjectModel } from './projectModel';
export declare class ProjectOutline implements IProject {
    projectId: number;
    name: string;
    models: ProjectModel[];
    buildings: ProjectBuilding[];
    editable: boolean;
    constructor(projectId: number, name: string, models: ProjectModel[], buildings: ProjectBuilding[]);
}
