import { IZone } from '../../../interfaces/IZone';
import { ProjectRoom } from './projectRoom';
export declare class ProjectZone implements IZone {
    externalReferenceId: string;
    name: string;
    zones: ProjectZone[];
    rooms: ProjectRoom[];
    constructor(name: string, externalReferenceId: string, zones: ProjectZone[], rooms: ProjectRoom[]);
}
