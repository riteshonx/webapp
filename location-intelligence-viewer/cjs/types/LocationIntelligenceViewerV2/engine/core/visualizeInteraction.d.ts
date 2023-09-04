import { Camera, Object3D } from 'three';
import { VisualizeRenderer } from './visualizeRenderer';
declare type MouseInteraction = (object: Object3D) => void;
export declare class VisualizeInteraction {
    private raycaster;
    private minDragDelta;
    private raycastHits;
    private camera;
    private canvas;
    private onClick;
    private onHoverEnter;
    private onHoverExit;
    private objectsMouseWasOver;
    private objectsMouseIsOver;
    private mouseOverCanvas;
    private mouseDown;
    private mousePosOnMouseDown;
    private mousePos;
    private raycastMousePos;
    private eventListeners;
    private _updateEvent;
    private _renderer;
    private activePointerIdsDown;
    private isDragging;
    private inputListenerScopeChangeEvent;
    constructor(camera: Camera, renderer: VisualizeRenderer);
    private addEventListeners;
    private removeEventListeners;
    private getObjectsMouseIsOver;
    private _onClick;
    private onPointerDown;
    private onPointerUp;
    private onPointerMove;
    private calculateRaycastMousePosition;
    private onPointerLeave;
    private onPointerEnter;
    private onInputListenerScopeChange;
    private checkIfDragging;
    private checkForHoveredObjects;
    private checkForUnHoveredObjects;
    private _update;
    connectMouseInteractions(onClick: MouseInteraction, onHoverEnter: MouseInteraction, onHoverExit: MouseInteraction): void;
    update(): void;
    dispose(): void;
}
export {};