import { MutableRefObject } from 'react';
import { PerspectiveCamera, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { CSS2DRenderer } from 'three/examples/jsm/renderers/CSS2DRenderer';
export declare function useCanvasResizing(canvas: MutableRefObject<HTMLCanvasElement>, renderer: MutableRefObject<WebGLRenderer>, labelRenderer: MutableRefObject<CSS2DRenderer>, camera: PerspectiveCamera, composer: MutableRefObject<EffectComposer>, containerRef: MutableRefObject<HTMLDivElement>): (width: number, height: number) => void;
