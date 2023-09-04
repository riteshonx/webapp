import { MutableRefObject } from 'react';
import { Clock, PerspectiveCamera, Vector3 } from 'three';
import { FocusableObject } from '../models/focusableObject';
import { ControlType } from './controlType';
import { FirstPersonController } from './firstPerson/firstPersonController';
import { OrbitController } from './orbit/orbitController';
export declare function useControls(controlType: ControlType, focusedObject: FocusableObject, firstPersonStartPos: Vector3, onPlayerUpdate: ({ position: Vector3 }: {
    position: any;
}) => void): {
    readonly onFrame: (clock: Clock) => void;
    readonly onSceneInitialized: (camera: PerspectiveCamera, canvas: HTMLCanvasElement) => void;
    readonly controls: MutableRefObject<FirstPersonController | OrbitController>;
};
