import { ProjectModel } from '../../../model/external';
import { BuildingPrefab } from '../../../model/prefabs';
export declare class BuildingPrefabFactory {
    static create(models: ProjectModel[]): Promise<BuildingPrefab[]>;
    private static loadBuildingPrefabs;
}
