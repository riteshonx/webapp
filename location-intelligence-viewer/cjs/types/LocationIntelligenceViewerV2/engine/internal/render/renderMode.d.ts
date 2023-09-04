import { VisualizeMapboxMap } from "../../core/visualizeMapboxMap";
import { VisualizeRenderer } from "../../core/visualizeRenderer";
export declare class RenderMode {
    private static _mapboxMap;
    private static _renderer;
    static init(mapboxMap: VisualizeMapboxMap, renderer: VisualizeRenderer): void;
    static mapbox(): void;
    static three(): void;
    private static setRenderMode;
}
