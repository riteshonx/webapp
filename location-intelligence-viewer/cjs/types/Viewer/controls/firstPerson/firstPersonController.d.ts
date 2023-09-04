import { Clock, Object3D, PerspectiveCamera, Vector3 } from 'three';
export declare class FirstPersonController extends Object3D {
    type: 'First';
    private _enabled;
    private startPosition;
    private camera;
    private canvas;
    private lookSpeed;
    private movementSpeed;
    private focused;
    private head;
    constructor(camera: PerspectiveCamera, canvas: HTMLCanvasElement);
    setStartPosition(startPosition: Vector3): void;
    set enabled(enabled: boolean);
    get enabled(): boolean;
    get _position(): Vector3;
    animateCameraToPosition(): Promise<[void]>;
    _update(clock: Clock): void;
    private unFocus;
    private refocus;
    private updateMovement;
    private checkIfCanvasStillFocused;
    private updateRotation;
}
