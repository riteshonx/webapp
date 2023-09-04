import { Label } from "../../../Viewer/models/label";
import { VisualizeScene } from "../core/visualizeScene";
export declare class VisualizeLabelManager {
    private labels;
    private _scene;
    constructor(scene: VisualizeScene);
    update(updatedLabels: Label[]): void;
}
