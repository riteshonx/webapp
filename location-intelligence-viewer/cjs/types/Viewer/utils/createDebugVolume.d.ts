import { BoxGeometry, ColorRepresentation, LineSegments, WireframeGeometry } from 'three';
export declare function createDebugVolume(width: number, depth: number, height: number, color: ColorRepresentation, opacity: number): LineSegments<WireframeGeometry<BoxGeometry>, import("three").Material | import("three").Material[]>;
