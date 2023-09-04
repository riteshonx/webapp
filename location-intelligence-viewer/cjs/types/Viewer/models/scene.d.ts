import { Box3, Camera, Light, Object3D, Scene as ThreeScene, Vector3 } from 'three';
import { Coordinate } from '../../LocationIntelligenceViewer/model/map/coordinate';
import { Entity } from './entity';
import { FocusableObject } from './focusableObject';
export declare class Scene extends ThreeScene implements FocusableObject {
    lights: Light[];
    boundingBox: Box3;
    private boundingBoxCenter;
    intermediateCoordinate: Coordinate;
    private width;
    private height;
    private depth;
    private entities;
    private camera;
    constructor(lights: Light[], camera: Camera);
    get cameraFocusPoint(): Vector3;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    private calculateBoundingBox;
    setDebuggingVisible(visible: boolean): void;
    add(...object: Object3D<Event | any>[]): this;
    updateEntites(_entites: Entity[]): void;
    clear(): this;
    private addPermanentFixtures;
}
