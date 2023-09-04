export interface ILocationModelLink {
    projectLocationTreeId: string;
    locationBuildingId?: string;
    locationLevelId?: string;
    locationZoneId?: string;
    locationRoomId?: string;
    locationRoom?: {
        sourceId: string;
    };
    locationZone?: {
        sourceId: string;
    }
    locationLevel: {
        sourceId: string;
    }
}