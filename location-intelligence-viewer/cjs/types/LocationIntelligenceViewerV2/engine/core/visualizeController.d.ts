import { Camera, Group, Vector3 } from 'three';
import { onZoomInteraction } from '../../hook/useEngine';
import { VisualizeControlMode } from '../internal/enum/visualizeControlMode';
import { VisualizeMapboxMap } from './visualizeMapboxMap';
import { VisualizeRenderer } from './visualizeRenderer';
import { VisualizeScene } from './visualizeScene';
export declare class VisualizeController {
    private _renderer;
    private orbitController;
    private globeController;
    private worldTransform;
    private activeController;
    private updateEvent;
    constructor(camera: Camera, world: Group, renderer: VisualizeRenderer, mapboxMap: VisualizeMapboxMap, scene: VisualizeScene, onZoom: onZoomInteraction);
    setActiveController(controlrMode: VisualizeControlMode): void;
    enableZOrbit(enable: boolean): void;
    get activeControllerType(): import("../internal/enum/visualizeControlScope").VisualizeControlScope;
    get target(): Vector3;
    updateTarget(newTarget: Vector3): void;
    forcePosition(newPosition: Vector3): void;
    update(): void;
    dispose(): void;
}
