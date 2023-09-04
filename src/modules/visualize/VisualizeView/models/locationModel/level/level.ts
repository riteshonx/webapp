import { IBounds } from '../bounds';
import { Room } from '../room';
import { Zone } from '../zone';
import { ILevel } from './ILevel';

export class Level {
    public sourceId: string;
    public bounds: IBounds;
    public elevation: number;
    public rooms: Room[];
    public zones: Zone[];

    constructor(level: ILevel) {
        this.sourceId = level.sourceId;
        this.bounds = level.bounds;
        this.elevation = level.elevation;

        this.rooms = Boolean(level.rooms) ? level.rooms.map((room) => new Room(room)) : [];
        this.zones = Boolean(level.zones) ? level.zones.map((zone) => new Zone(zone)) : [];
    }
}