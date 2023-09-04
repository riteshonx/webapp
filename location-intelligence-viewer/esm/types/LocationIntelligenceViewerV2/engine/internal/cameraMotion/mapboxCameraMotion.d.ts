import { FocusableObject } from '../../../../Viewer/models/focusableObject';
import { CancellationToken } from '../../cancellationToken';
import { VisualizeMapboxMap } from '../../core/visualizeMapboxMap';
import { VisualizeScene } from '../../core/visualizeScene';
export declare class MapboxCameraMotion {
    static mapboxMap: VisualizeMapboxMap;
    static scene: VisualizeScene;
    static flyTo(focusableObject: FocusableObject, zoom: number, duration: number, cancellationToken?: CancellationToken): Promise<void>;
    static jumpTo(focusableObject: FocusableObject, zoom: number): void;
    static jumpToCoordinates({ lat, lon, zoom }: {
        lat: number;
        lon: number;
        zoom: number;
    }): void;
    static flyToCoordinates({ lat, lon, zoom, cancellationToken }: {
        lat: number;
        lon: number;
        zoom: number;
        cancellationToken?: CancellationToken;
    }): Promise<void>;
}
