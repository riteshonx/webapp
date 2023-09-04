import { useSubscription } from "@apollo/client";
import { useContext } from "react";
import GoogleMapView from "src/modules/shared/components/GoogleMap/GoogleMapView";
import EquipmentDataSubscriptionGQL from "src/modules/equipments-map/EquipmentDataSubscriptionGQL";
import { equipmentsDataToGoogleMapMarker } from "src/modules/equipments-map/EquipmentsMapUtils";
import {
  stateContext,
  stateContextProps,
} from "src/modules/root/context/authentication/authContext";
import moment from "moment";
import { renderToString } from "react-dom/server";
import { MasterMaterialRoles } from "src/utils/role";
import { CURRENT_LEVEL } from "src/modules/root/context/authentication/reducer";
import { LoadingSpinnerCard } from "src/modules/visualize/VisualizeView/utils/LoadingSpinner";

export type ProjectInfo = {
  latitude: number;
  longitude: number;
  projectName?: string;
  startDate?: string;
  endDate?: string;
};

export function MarkerProjectContent({ info }: { info: ProjectInfo }) {
  const { projectName, startDate, endDate } = info;
  return (
    <div style={{ float: "right", paddingLeft: "10px", width: "250px" }}>
      <div
        style={{
          fontWeight: "bold",
          display: "flex",
          fontSize: "1.5rem",
          flex: 1,
          marginBottom: "5px",
        }}
      >
        {projectName}
      </div>
      <div
        style={{
          display: "flex",
          flex: 1,
          flexDirection: "row",
          marginBottom: "5px",
        }}
      >
        <div
          style={{
            flex: 1,
            flexDirection: "column",
          }}
        >
          <span style={{ fontWeight: "bold" }}>Start Date</span>
        </div>
        <div style={{ flex: 1, flexDirection: "column" }}>
          {moment.utc(startDate).format("DD MMM YY").toString()}
        </div>
      </div>
      <div style={{ display: "flex", flex: 1, flexDirection: "row" }}>
        <div style={{ flex: 1, flexDirection: "column" }}>
          <span style={{ fontWeight: "bold" }}>Completion Date</span>
        </div>
        <div style={{ flex: 1, flexDirection: "column" }}>
          {moment.utc(endDate).format("DD MMM YY").toString()}
        </div>
      </div>
    </div>
  );
}

// @todo need fill up the type detail
type PortoflioDetail = any;

export default function DashboardMapView({
  info,
}: {
  info: PortoflioDetail | ProjectInfo;
}) {
  const role = { tenant: MasterMaterialRoles.read };
  sessionStorage.setItem("X-Hasura-Role", JSON.stringify(role));
  const { state }: stateContextProps = useContext(stateContext);
  const { data, error, loading } = useSubscription(
    EquipmentDataSubscriptionGQL
  );
  const { currentLevel, isLoading } = state;

  // @todo should return a loading card
  if (isLoading || loading) {
    return (
      <LoadingSpinnerCard
        className="mapview-container"
        color="inherit"
        contentStyle={{ minHeight: "400px" }}
      />
    );
  }

  if (error) {
    console.error("ProjectMapView", error);
  }

  return (
    <GoogleMapView
      markers={
        data?.equipmentData
          ? equipmentsDataToGoogleMapMarker(data?.equipmentData)
          : []
      }
      info={info}
      levelType={currentLevel || CURRENT_LEVEL.PROJECT}
      getMarkerContent={(info: ProjectInfo) =>
        renderToString(<MarkerProjectContent info={info} />)
      }
    />
  );
}
