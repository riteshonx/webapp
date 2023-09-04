import { Vector3 } from 'three';
import { FocusableObject } from '../../../../Viewer/models/focusableObject';
import { CancellationToken } from '../../cancellationToken';
import { VisualizeCamera } from '../../core/visualizeCamera';
import { VisualizeController } from '../../core/visualizeController';
export declare class ThreeCameraMotition {
    private static deltaPosition;
    private static tweens;
    static controller: VisualizeController;
    static camera: VisualizeCamera;
    static focusOn(focusedObject: FocusableObject, cancellationToken?: CancellationToken): Promise<void> | Promise<[void, void]>;
    private static calculateNewFocusPoint;
    static startCameraTweens(deltaPositionRelativeToNewFocusPoint: Vector3, focusParentOriginalPosition: Vector3, focusedObject: FocusableObject): Promise<[void, void]>;
    static onCameraPositionUpdate(newPosition: Vector3): void;
    static onCameraTargetUpdate(newPosition: Vector3): void;
    private static stop;
}
