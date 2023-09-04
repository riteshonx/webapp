import { Mesh, Vector2 } from 'three';
import { Coordinate } from './coordinate';
export declare class TerrainTile extends Mesh {
    satelliteMapUrl: string;
    private satelliteMapTexture;
    streetMapUrl: string;
    private streetMapTexture;
    coordinates: Coordinate;
    centerWorldTileXY: Vector2;
    private tileScaleInMeters;
    private zoom;
    private planeGeometry;
    constructor(satelliteMap: Blob, streetMap: Blob, lat: number, y: number, lon: number, x: number, zoom: number);
    private buildGpuShader;
    private buildTextures;
    private getAsTexture;
}
