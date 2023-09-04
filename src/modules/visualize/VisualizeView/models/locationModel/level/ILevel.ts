import { IBounds } from '../bounds';
import { IRoom } from '../room';
import { IZone } from '../zone';

export interface ILevel {
    sourceId: string;
    bounds: IBounds;
    elevation: number;
    rooms: IRoom[];
    zones: IZone[];
}