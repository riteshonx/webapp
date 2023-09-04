import { MutableRefObject } from 'react';
import { Object3D } from 'three';
import { IMapboxInfo } from '../../LocationIntelligenceViewer/interfaces/external';
declare type MouseInteraction = (object: Object3D) => void;
export declare type onZoomInteraction = () => void;
export declare type onCameraInteraction = (isMoving: boolean) => void;
interface UseEngineProps {
    onClick: MouseInteraction;
    onHoverEnter: MouseInteraction;
    onHoverExit: MouseInteraction;
    onZoom: onZoomInteraction;
    onCameraTransistion: onCameraInteraction;
    mapElement: MutableRefObject<HTMLDivElement>;
    mapboxInfo: IMapboxInfo;
    defaultLocation: [number, number];
}
export declare function useEngine(props: UseEngineProps): boolean;
export {};
