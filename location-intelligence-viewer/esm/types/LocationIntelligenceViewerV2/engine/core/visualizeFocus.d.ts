import { FocusableObject } from '../../../Viewer/models/focusableObject';
import { VisualizeController } from './visualizeController';
import { VisualizeMapboxMap } from './visualizeMapboxMap';
import { VisualizeRenderer } from './visualizeRenderer';
export declare class VisualizeFocus {
    private _cancellationToken;
    private _focusedObject;
    private _mapboxMap;
    private _renderer;
    private _controller;
    constructor(mapboxMap: VisualizeMapboxMap, renderer: VisualizeRenderer, controller: VisualizeController);
    private jumpToRange;
    private getWithinRange;
    private transition;
    private run;
    private runImmediate;
    private action;
    private jumpToAction;
    private _focusOn;
    private _jumpTo;
    focusOn: (focusedObject: FocusableObject) => Promise<void>;
    jumpTo: (focusedObject: FocusableObject) => void;
    get focusedObject(): FocusableObject;
    reFocus(): Promise<void>;
    tiltCurrentFocusPoint(): void;
}
