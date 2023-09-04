import { Object3D, Vector3 } from 'three';
import { IMapboxInfo } from '../../interfaces/external';
import { Coordinate } from './coordinate';
import { GeoMappedObject } from './geoMappedObject';
export declare class Map extends Object3D implements GeoMappedObject {
    worldTileOrigin: Coordinate;
    tileSize: number;
    offset: Vector3;
    coordinate: Coordinate;
    elevation: number;
    private worldCenterTileInXandY;
    private mapboxInfo;
    constructor(worldOrigin: Coordinate, mapboxInfo: IMapboxInfo);
    private getMapBoxData;
    private getMapBoxSatellite;
    private buildTile;
    private buildTiles;
    private setMapCenter;
    private setTileSize;
}
