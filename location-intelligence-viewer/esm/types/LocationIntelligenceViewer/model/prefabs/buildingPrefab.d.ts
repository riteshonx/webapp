import { Gltf } from '../gltf/gltf';
import { BuildingLayout } from '../project/buildingLayout';
export declare class BuildingPrefab {
    modelId: string;
    model: Gltf;
    layout: BuildingLayout;
    constructor(modelId: string, model: Gltf, layout: BuildingLayout);
}
