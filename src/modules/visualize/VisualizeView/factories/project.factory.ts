import {
    Project,
    ProjectBuilding,
    ProjectLevel,
    ProjectModel,
    ProjectRoom,
    ProjectZone,
} from 'location-intelligence-viewer';

import { LocationModel } from '../models/locationModel';
import { ChildNode, LocationTree } from '../models/locationTree';


export class ProjectFactory {
    public static create(projectId: string, locationModels: LocationModel[], projectLocationTree: LocationTree) {
        if (Boolean(projectId) && Boolean(locationModels) && locationModels.length > 0 && Boolean(projectLocationTree)) {
            const linkedBuildings = projectLocationTree!.linkedBuildings;

            const projectModels = locationModels.map((model) => {
                const building = linkedBuildings.find((building) => building.locationId === model.buildingId);

                const buildingLevels = building!.linkedLevels.map((level) => {
                    const levelInModel = model.building.levels.find((l) => l.sourceId === level?.sourceId);
                    const levelRooms = level.linkedRooms.map((room) => new ProjectRoom(room!.sourceId!, room.locationId!, room.name));

                    const levelZones = level.linkedZones.map(ProjectFactory.buildZone);

                    return new ProjectLevel(level!.sourceId!, level.locationId!, level.name, levelInModel!.bounds!, levelInModel!.elevation!, levelRooms, levelZones)

                });

                return new ProjectModel(model.locationModelId, model.title, model.geometry, buildingLevels);
            });

            const projectBuildings = linkedBuildings.map((building) => {
                const {locationModelId, baseElevation, latitude, longitude, trueNorth} = locationModels.find((model) => building.locationId === model.buildingId)!;
                
                return new ProjectBuilding(building.locationId!, building.locationId!, locationModelId, building.name, baseElevation, latitude, longitude, trueNorth);
            });

            return new Project(Number(projectId), 'Name', projectModels, projectBuildings);
        }
    }

    private static buildZone(zone: ChildNode): ProjectZone {
        const zoneRooms = zone.linkedRooms.map((room) => new ProjectRoom(room!.sourceId!, room.locationId!, room.name));
        const zoneZones = zone.linkedZones.map(ProjectFactory.buildZone);

        return new ProjectZone(zone.name, zone.locationId!, zoneZones, zoneRooms);
    }

}