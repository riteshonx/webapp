import { ILevel } from '../../../interfaces/ILevel';
import { ProjectLevelBounds } from './projectLevelBounds';
import { ProjectRoom } from './projectRoom';
import { ProjectZone } from './projectZone';
export declare class ProjectLevel implements ILevel {
    sourceId: string;
    externalReferenceId: string;
    title: string;
    bounds: ProjectLevelBounds;
    elevation: number;
    rooms: ProjectRoom[];
    zones: ProjectZone[];
    constructor(sourceId: string, externalReferenceId: string, title: string, bounds: ProjectLevelBounds, elevation: number, rooms?: ProjectRoom[], zones?: ProjectZone[]);
}
