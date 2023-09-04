import { PerspectiveCamera, Plane } from 'three';
import { Label } from '../../../Viewer/models/label';
import { VisualizeControlScope } from '../internal/enum/visualizeControlScope';
import { VisualizeDiagnostics } from './visualizeDiagnostics';
import { VisualizeMapboxMap } from './visualizeMapboxMap';
import { VisualizeScene } from './visualizeScene';
export declare class VisualizeRenderer {
    private externalRenderFuncs;
    private state;
    private _ssaoPass;
    private _composer;
    private _mapboxCanvas;
    private _threeCanvas;
    private _container;
    private _renderer;
    private _labelRenderer;
    private _scene;
    private _camera;
    private _autoRender;
    private _mapboxMap;
    private _diagnostics;
    private _resizeObserver;
    constructor(container: HTMLDivElement, gl: WebGLRenderingContext, scene: VisualizeScene, camera: PerspectiveCamera, mapboxMap: VisualizeMapboxMap, diagnostics: VisualizeDiagnostics);
    private setupComposer;
    private createRenderer;
    private createLabelRenderer;
    private setupResize;
    private resizeCanvas;
    private internalRender;
    private _internalRender;
    render(): void;
    set autoRender(autoRender: boolean);
    setSsaoClippingPlanesFunc(clippingPlanes: Plane[]): void;
    addRenderFunc(renderFunc: () => void): void;
    removeRenderFunc(renderFunc: () => void): void;
    get threeCanvas(): HTMLCanvasElement;
    get mapboxCanvas(): HTMLCanvasElement;
    updateLabels(labels: Label[]): void;
    setInputListener(visualizeScope: VisualizeControlScope): void;
    setRenderBelowGrade(displayBelowGrade: boolean): void;
    get isDisplayingBelowGrade(): boolean;
    dispose(): void;
    enableSsaoPass(enable: boolean): void;
}