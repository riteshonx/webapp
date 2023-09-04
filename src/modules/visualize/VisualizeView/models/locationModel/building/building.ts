import { Level } from '../level';
import { IBuilding } from './IBuilding';

export class Building {
    public buildingId: string;
    public levels: Level[];

    constructor(building: IBuilding) {
        this.buildingId = building.buildingId[0].projectLocationTreeId;
        
        this.levels = Boolean(building.levels) ? building.levels.map((level) => new Level(level)) : [];
    }
}