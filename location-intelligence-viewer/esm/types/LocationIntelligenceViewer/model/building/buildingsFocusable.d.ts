import { Box3, Vector3 } from 'three';
import { VisualizeFocusType } from '../../../LocationIntelligenceViewerV2/engine/internal/enum/visualizeFocusType';
import { GlobeFocusableObject } from '../../../Viewer/models/globeFocusableObject';
import { Coordinate } from '../map/coordinate';
import { Building } from './building';
export declare class BuildingsFocusable implements GlobeFocusableObject {
    focusableType: VisualizeFocusType.GLOBE;
    private buildings;
    constructor(buildings: Building[]);
    get cameraFocusPoint(): Vector3;
    get bearing(): number;
    get intermediateCoordinate(): Coordinate;
    get maximumBoundingDimension(): number;
    get boundingDimensions(): Box3;
    private getBox3;
}
