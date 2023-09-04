import { LngLatLike } from 'mapbox-gl';
import { Vector3 } from 'three';
export declare class Coordinate extends Vector3 {
    constructor(lat: number, lon: number, alt?: number);
    get lon(): number;
    get lat(): number;
    get alt(): number;
    asLonLatArray(): number[];
    toScene(): Vector3;
    static toGps(scene: Vector3): Coordinate;
    private static projectToWorld;
    private static unprojectFromWorld;
    static centerBetween(coordinates: Coordinate[]): Coordinate;
    distanceTo(other: Coordinate): number;
    static fromLngLatLike(lngLatLike: LngLatLike): Coordinate;
}
