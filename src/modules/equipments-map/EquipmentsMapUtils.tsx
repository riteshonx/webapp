import { MapMarker } from "src/modules/shared/components/GoogleMap/GoogleMapView";
import { EquipmentData } from "./EquipmentsMapTypes";
import EquipomentIcon from "../../assets/images/equipments-map-excavator-icon.png";
// @todo, should takeout @ to support graphql

export function equipmentsDataToGoogleMapMarker(
  equipmentData: EquipmentData[]
): MapMarker[] {
  return equipmentData
    .filter((item) =>
      item.equipmentTrackings.find(
        (trackingItem) => trackingItem.trackingParameter === "Location"
      )
    )
    .map((item) => ({
      position: {
        lat: parseFloat(item.equipmentTrackings[0]?.metadata.Latitude || ""),
        lng: parseFloat(item.equipmentTrackings[0]?.metadata.Longitude || ""),
      },
      icon: EquipomentIcon,
      info: item
    }));
}