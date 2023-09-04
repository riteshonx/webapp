import { Group, Vector3 } from "three";
import { VisualizeMapboxMap } from "../core/visualizeMapboxMap";
export declare class WorldTransform {
    private _worldRoot;
    private _currentZoomPower;
    private _state;
    private _lastPosition;
    private _mapboxMap;
    private _translateMap;
    private _rotateMap;
    private _worldRootMatrix;
    private _scaleMatrix;
    private _position;
    private _rotation;
    private _scale;
    constructor(worldRoot: Group, mapboxMap: VisualizeMapboxMap);
    worldScale(worldScale: number): void;
    zoomPower(zoomPower: number): void;
    zoomLevel(zoomLevel: number): void;
    getZoom(): any;
    getWorldLocal(position: Vector3): Vector3;
    getScaledVector(delta: Vector3): Vector3;
    get currentZoomPower(): number;
    get lastPosition(): Vector3;
    updateWorld(): void;
}
