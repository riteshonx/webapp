import { Vector3 } from 'three';
import { Color, ColorRepresentation, Group, Mesh } from 'three';
import { HighlightOptions } from '../../../utils/highlightOptions';
import { Building } from '../building';
import { Level } from './level';
import { Box3 } from 'three';
export declare class LevelMesh {
    private parentGroup;
    private meshes;
    private meshesAsInteractables;
    private ceilingMeshes;
    private floorMeshes;
    private additionalFloorMeshes;
    private defaultHighlightColor;
    private defaultHighlightStrength;
    private persistedColor;
    private persistedColorStrength;
    private colorPersist;
    private hoverHighlightMode;
    private building;
    constructor(parentGroup: Group, defaultHighlightColor: Color | ColorRepresentation, defaultHighlightStrength: number, building: Building);
    private processGeometry;
    postProcess(levelCenter: Vector3, heightOffset: number): void;
    add(mesh: Mesh): void;
    addAdditionalFloorGeometry(meshes: Mesh[]): void;
    highlight(color?: Color, options?: HighlightOptions): void;
    private _highlight;
    unHighlight(removeHighlightPersistance?: boolean): void;
    private _unHighlight;
    setInteractable(isInteractable: boolean): void;
    claimInteractable(level: Level): void;
    setHighlightLimits(min: number, max: number): void;
    isolateVisibility(show: boolean): void;
    resetVisibility(): void;
    getTemporaryBounds(): Box3;
    private setCeilingVisibility;
}
