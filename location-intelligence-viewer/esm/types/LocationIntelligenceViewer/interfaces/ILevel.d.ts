import { IRoom } from './IRoom';
import { IZone } from './IZone';
export interface ILevel {
    title: string;
    externalReferenceId: string;
    sourceId: string;
    elevation: number;
    rooms: IRoom[];
    bounds: {
        min: number[];
        max: number[];
    };
    zones: IZone[];
}
