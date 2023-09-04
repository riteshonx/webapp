import { IMapboxInfo } from '../../LocationIntelligenceViewer/interfaces/external/IMapboxInfo';
import { onCameraInteraction, onZoomInteraction } from '../hook/useEngine';
export declare class VisualizeFactory {
    private static isCreated;
    static create(container: HTMLDivElement, mapboxInfo: IMapboxInfo, defaultLocation: [number, number], onZoom: onZoomInteraction, onCameraTransistion: onCameraInteraction): Promise<void>;
    static dispose(): void;
    private static instantiate;
    private static createThreeLayer;
    private static setupScene;
}
