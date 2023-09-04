import { Clock, Object3D, Vector3 } from 'three';
import { ControlType } from './controls/controlType';
import { Entity } from './models/entity';
import { FocusableObject } from './models/focusableObject';
import { Label } from './models/label';
import { Model } from './models/model';
import { Scene } from './models/scene';
declare type MouseObjectInteraction = (object: Object3D) => void;
interface ViewerProps {
    models: Model[];
    scenery?: Object3D[];
    entities?: Entity[];
    firstPersonStartPos?: Vector3;
    labels?: Label[];
    focusedObject?: FocusableObject;
    controlType?: ControlType;
    onSceneInitialize?: ({ scene, canvas, resizeCanvas }: {
        scene: Scene;
        canvas: HTMLCanvasElement;
        resizeCanvas: () => void;
    }) => void;
    onObjectClick?: MouseObjectInteraction;
    onObjectHoverEnter?: MouseObjectInteraction;
    onObjectHoverExit?: MouseObjectInteraction;
    onPlayerUpdate?: ({ position }: {
        position: Vector3;
    }) => void;
    debugging?: boolean;
    onFrame?: (clock: Clock) => void;
}
export declare function Viewer({ models, labels, scenery, entities, firstPersonStartPos, focusedObject, controlType, onSceneInitialize, onObjectClick, onObjectHoverEnter, onObjectHoverExit, onPlayerUpdate, debugging, onFrame: _onFrame }: ViewerProps): JSX.Element;
export {};
