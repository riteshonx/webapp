import { MutableRefObject } from 'react';
import { Object3D, PerspectiveCamera } from 'three';
import { Scene } from '../models/scene';
declare type MouseInteraction = (object: Object3D) => void;
export declare function useMouseInteractions(camera: PerspectiveCamera, scene: MutableRefObject<Scene>, canvas: MutableRefObject<HTMLCanvasElement>, onClick: MouseInteraction, onHoverEnter: MouseInteraction, onHoverExit: MouseInteraction): {
    readonly onFrame: () => void;
};
export {};
