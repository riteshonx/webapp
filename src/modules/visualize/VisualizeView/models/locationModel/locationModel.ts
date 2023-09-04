import { Building } from './building';
import { ILocationModel } from './ILocationModel';

export class LocationModel {
    public locationModelId: string;
    public baseElevation: number;
    public trueNorth: number;
    public latitude: number;
    public longitude: number;
    public title: string;

    public geometry: ArrayBuffer;

    public building: Building;

    constructor(locationModel: ILocationModel, geometry: ArrayBuffer) {
        this.locationModelId = locationModel.id;
        this.baseElevation = locationModel.baseElevation;
        this.trueNorth = locationModel.trueNorth;
        this.latitude = locationModel.latitude;
        this.longitude = locationModel.longitude;
        this.title = locationModel.title;

        this.geometry = geometry;

        this.building = locationModel.buildings.map((building) => new Building(building))[0];
    }

    public get buildingId() {
        return this.building.buildingId;
    }
}