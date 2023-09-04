import { IRoom } from './IRoom';

export class Room {
    public sourceId: string;

    constructor(room: IRoom) {
        this.sourceId = room.sourceId;
    }
}