import { IRoom } from '../room';

export interface IZone {
    sourceId: string;
    rooms: IRoom[];
    zones: IZone[];
}