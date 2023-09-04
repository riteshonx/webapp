import { Label } from "../../../Viewer/models/label";
import { VisualizeMapboxMap } from "../core/visualizeMapboxMap";
import { VisualizeScene } from "../core/visualizeScene";
import { VisualizeControlScope } from "./enum/visualizeControlScope";
export declare class VisualizeRendererState {
    private labelManager;
    private threeCanvas;
    private mapboxCanvas;
    private _mapboxMap;
    private _scene;
    private labels;
    private listenerScope;
    private _displayBelowGrade;
    private stateIsCurrent;
    constructor(mapboxMap: VisualizeMapboxMap, scene: VisualizeScene);
    init(threeCanvas: HTMLCanvasElement, mapboxCanvas: HTMLCanvasElement): void;
    private updateInputListener;
    updateLabels(labels: Label[]): void;
    setInputListener(visualizeScope: VisualizeControlScope): void;
    setRenderBelowGrade(displayBelowGrade: boolean): void;
    get isDisplayingBelowGrade(): boolean;
}
