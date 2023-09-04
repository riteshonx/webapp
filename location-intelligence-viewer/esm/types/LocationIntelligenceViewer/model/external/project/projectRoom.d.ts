import { IRoom } from '../../../interfaces/IRoom';
export declare class ProjectRoom implements IRoom {
    sourceId: string;
    externalReferenceId: string;
    title: string;
    constructor(sourceId: string, externalReferenceId: string, title: string);
}
