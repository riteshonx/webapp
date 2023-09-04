import { Coordinate } from "../model/map/coordinate";
export declare function lon2tile(lon: number, zoom: number): number;
export declare function lat2tile(lat: number, zoom: number): number;
export declare function tile2lon(lon: number, zoom: number): number;
export declare function tile2lat(lat: number, zoom: number): number;
export declare function tile2BoundingBox(lon: number, lat: number, zoom: number): {
    north: number;
    south: number;
    west: number;
    east: number;
};
export declare function tileCenter(lon: number, lat: number, zoom: number): Coordinate;
export declare function getElevationData(imageUrl: string): Promise<number[]>;
export declare function decodeTerrainRGBToElevation(r: number, g: number, b: number): number;
export declare function pixelDistanceBasedOnZoomAndLat256X256(zoom: number, lat: number): number;
