import { Vector2 } from "three";
import { Coordinate } from "./coordinate";
export declare function setGpsWorldOrigin(worldOrigin: Coordinate): void;
export declare function gpsToSceneCoordinate(gps: Coordinate): Vector2;
export declare function sceneToGpsCoordinate(scene: Vector2): Vector2;
