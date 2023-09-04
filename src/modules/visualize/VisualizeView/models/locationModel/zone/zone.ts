import { Room } from '../room';
import { IZone } from './IZone';

export class Zone {
    public sourceId: string;
    public rooms: Room[];
    public zones: Zone[];

    constructor(zone: IZone) {
        this.sourceId = zone.sourceId;
        this.rooms = Boolean(zone.rooms) ? zone.rooms.map((room) => new Room(room)) : [];
        this.zones = Boolean(zone.zones) ? zone.zones.map((zone) => new Zone(zone)) : [];
    }
}