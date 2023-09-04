import { Camera, Vector3 } from 'three';
import { VisualizeController } from './visualizeController';
import { VisualizeRenderer } from './visualizeRenderer';
import { onCameraInteraction } from '../../hook/useEngine';
export declare class VisualizeCamera {
    private camera;
    private _renderer;
    private _controller;
    private _lastPosition;
    private updateEvent;
    private _onCameraTransistion;
    constructor(camera: Camera, renderer: VisualizeRenderer, controller: VisualizeController, onCameraTransistion: onCameraInteraction);
    private _update;
    get lastPosition(): Vector3;
    get position(): Vector3;
    get fov(): number;
    forcePosition(newPosition: Vector3): void;
    dispose(): void;
    updateIsMoving(value: boolean): void;
    forceFov(value: number): void;
}
