import { IRoom } from './IRoom';
export interface IZone {
    name: string;
    externalReferenceId: string;
    rooms: IRoom[];
    zones: IZone[];
}
