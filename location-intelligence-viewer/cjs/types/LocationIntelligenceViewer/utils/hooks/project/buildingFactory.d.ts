import { VisualizeRenderer } from '../../../../LocationIntelligenceViewerV2/engine/core/visualizeRenderer';
import { Building } from '../../../model/building/building/building';
import { ProjectBuilding } from '../../../model/external';
import { BuildingPrefab } from '../../../model/prefabs';
export declare class BuildingFactory {
    static create(buildings: ProjectBuilding[], buildingPrefabs: BuildingPrefab[], renderer: VisualizeRenderer): Building[];
    private static loadBuildings;
}
