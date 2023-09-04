import { Group, PerspectiveCamera } from 'three';
import { onCameraInteraction, onZoomInteraction } from '../hook/useEngine';
import { VisualizeCamera } from './core/visualizeCamera';
import { VisualizeController } from './core/visualizeController';
import { VisualizeDiagnostics } from './core/visualizeDiagnostics';
import { VisualizeFocus } from './core/visualizeFocus';
import { VisualizeInteraction } from './core/visualizeInteraction';
import { VisualizeMapboxMap } from './core/visualizeMapboxMap';
import { VisualizeRenderer } from './core/visualizeRenderer';
import { VisualizeScene } from './core/visualizeScene';
import { VisualizeProjectManager } from './visualizeProjectManager';
export declare class Visualize {
    private static _camera;
    private static _controller;
    private static _focus;
    private static _interaction;
    private static _mapboxMap;
    private static _renderer;
    private static _scene;
    private static _projectManager;
    private static _diagnostics;
    private static _isLoaded;
    static create(container: HTMLDivElement, gl: any, scene: VisualizeScene, camera: PerspectiveCamera, root: Group, mapboxMap: VisualizeMapboxMap, onZoom: onZoomInteraction, onCameraTransistion: onCameraInteraction): void;
    static dispose(): void;
    private static setupCamera;
    static get camera(): VisualizeCamera;
    static get controller(): VisualizeController;
    static get focus(): VisualizeFocus;
    static get interaction(): VisualizeInteraction;
    static get mapboxMap(): VisualizeMapboxMap;
    static get renderer(): VisualizeRenderer;
    static get scene(): VisualizeScene;
    static get projectManager(): VisualizeProjectManager;
    static get diagnostics(): VisualizeDiagnostics;
    static get isLoaded(): boolean;
}