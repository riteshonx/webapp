import { PerspectiveCamera, Vector3 } from 'three';
import { MapControls } from 'three/examples/jsm/controls/OrbitControls';
import { FocusableObject } from '../../models/focusableObject';
export declare class OrbitController extends MapControls {
    type: 'Orbit';
    private _lastCameraPosition;
    private camera;
    private _focusedObject;
    private deltaPosition;
    private tweens;
    constructor(camera: PerspectiveCamera, canvas: HTMLCanvasElement);
    _update(): boolean;
    set focusedObject(focusedObject: FocusableObject);
    get focusedObject(): FocusableObject;
    get lastCameraPosition(): Vector3;
    get _position(): Vector3;
    animateCameraToPosition(): Promise<void>;
    private calculateNewFocusPoint;
    private startCameraTweens;
    private onCameraPositionUpdate;
    private onCameraTargetUpdate;
}
