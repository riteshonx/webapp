import { Group } from 'three';
import { Building } from './building';
export declare class BuildingMesh {
    private meshes;
    private meshesAsInteractables;
    constructor(group: Group);
    private cacheInteractableMeshes;
    claimInteractables(building: Building): void;
}
