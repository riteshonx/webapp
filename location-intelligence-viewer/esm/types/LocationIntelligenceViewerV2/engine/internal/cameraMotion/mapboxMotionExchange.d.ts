import { VisualizeMapboxMap } from '../../core/visualizeMapboxMap';
export declare class MapboxMotionExchange {
    private static instance;
    private eventMap;
    private _mapboxMap;
    private constructor();
    static create(mapboxMap: VisualizeMapboxMap): void;
    static for(id: string, resolve: () => void): void;
    private eventListener;
    private listenForEvents;
}
