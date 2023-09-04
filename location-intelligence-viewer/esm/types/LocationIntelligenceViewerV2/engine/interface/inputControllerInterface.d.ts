import { Vector3 } from "three";
import { Coordinate } from "../../../LocationIntelligenceViewer/model/map/coordinate";
import { VisualizeControlMode } from "../internal/enum/visualizeControlMode";
import { VisualizeControlScope } from "../internal/enum/visualizeControlScope";
export interface IInputController {
    enabled: boolean;
    setUp?: () => void;
    dispose?: () => void;
    update: () => void;
    controlScope: VisualizeControlScope;
    controlMode: VisualizeControlMode;
    animateCameraToPosition: () => Promise<any>;
    sceneFocus: Vector3;
    worldFocus: Coordinate;
    cameraPosition: Vector3;
    getBearing(): number;
    getPitch(): number;
    sync(controller: IInputController): void;
    validate: () => void;
}
