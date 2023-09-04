import { Box3, Material, Vector3 } from 'three';
import { Boundary } from '../../LocationIntelligenceViewer/model/gltf/boundary';
import { Coordinate } from '../../LocationIntelligenceViewer/model/map/coordinate';
import { VisualizeFocusType } from '../../LocationIntelligenceViewerV2/engine/internal/enum/visualizeFocusType';
import { Interactable } from './Interactable';
import { LocalFocusableObject } from './localFocusableObject';
export declare class Area extends Interactable implements LocalFocusableObject {
    focusableType: VisualizeFocusType.LOCAL;
    isArea: 'Area';
    isValid: boolean;
    boundingBox: Box3;
    private _center;
    private heightOffset;
    private boundary;
    intermediateCoordinate: Coordinate;
    constructor(boundary: Boundary, floorHeight: number, floorCenter: Vector3, material: Material, heightOffset: number, focusOnIntermediateCoordinate: Coordinate);
    get boundingVolume(): Box3;
    get cameraFocusPoint(): Vector3;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    get center(): Vector3;
}
