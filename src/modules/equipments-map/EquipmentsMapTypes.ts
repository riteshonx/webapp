export type equipmentTrackingsMetadataBasic = {
  "@datatime": string;
};

export type FuelRemainingMetadata = equipmentTrackingsMetadataBasic & {
  FuelTankCapacityUnits: string;
  Percent: number;
};

export type LocationMetadata = equipmentTrackingsMetadataBasic & {
  Altitude: string;
  AltitudeUnits: string;
  Latitude: string;
  Longitude: string;
};

export type EquipmentData = {
  model: string;
  oemName: string;
  equipmentId: string;
  equipmentTrackings:
    | [
        {
          // todo, should also support FuelRemainingMetadata
          metadata: LocationMetadata;
          trackingParameter: string;
          trackingTimestamp: string;
        }
      ]
    | [];
};