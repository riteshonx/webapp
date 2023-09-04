/// <reference types="react" />
import { PerspectiveCamera, Scene, WebGLRenderer } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
export declare function initializeViewer(renderer: React.MutableRefObject<WebGLRenderer>, canvas: React.MutableRefObject<HTMLCanvasElement>, controls: React.MutableRefObject<OrbitControls>, scene: React.MutableRefObject<Scene>, camera: PerspectiveCamera): void;
