import { ILocation } from './ILocation';

export class Location {
    public locationId: string;
    public name: string;

    constructor(location: ILocation) {
        this.locationId = location.formLocationValue.id;
        this.name = location.formLocationValue.nodeName;
    }
}