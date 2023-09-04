import { MutableRefObject } from 'react';
import { PerspectiveCamera, Plane, SpotLight, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
import { Scene } from '../../models/scene';
export declare function useScene(onInitialize: (scene: Scene, camera: PerspectiveCamera, canvas: HTMLCanvasElement, resizeCanvas: () => void) => void, debugging: boolean, containerRef: MutableRefObject<HTMLDivElement>): {
    readonly scene: MutableRefObject<Scene>;
    readonly renderer: MutableRefObject<WebGLRenderer>;
    readonly labelRenderer: MutableRefObject<CSS2DRenderer>;
    readonly labelCanvas: MutableRefObject<HTMLElement>;
    readonly camera: PerspectiveCamera;
    readonly canvas: MutableRefObject<HTMLCanvasElement>;
    readonly spotLight: SpotLight;
    readonly composer: MutableRefObject<EffectComposer>;
    readonly setSsaoClippingPlanesFunc: (clippingPlanes: Plane[]) => void;
};
