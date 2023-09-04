import { Box3, Vector3 } from 'three';
import { Coordinate } from '../../LocationIntelligenceViewer/model/map/coordinate';
export interface FocusableObject {
    cameraFocusPoint: Vector3;
    maximumBoundingDimension: number;
    boundingDimensions: Box3;
    intermediateCoordinate: Coordinate;
    bearing?: number;
    nodeType?: string;
}
