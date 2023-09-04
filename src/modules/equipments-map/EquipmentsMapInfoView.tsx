import {
  useState,
  CSSProperties,
  useContext,
  createContext,
} from "react";
import { Container, List, ListItem, Typography } from "@mui/material";
import { MarkerType } from "./FullMapViewContainer";
import moment from "moment";
import { useSubscription } from "@apollo/client";
import {
  SUBSCRIBE_EQUIPMENT_TRACKING_INSIGHTS,
  SUBSCRIBE_EQUIPMENT_TRACKING_INSIGHTS_TRACKINGDATE,
} from "src/graphhql/queries/equipment";
import { MasterMaterialRoles } from "src/utils/role";

const InfoViewContext = createContext<any>({
  infoObj: {},
});

export default function EquipmentsMapInfoView({
  infoObj,
  style,
}: {
  infoObj: any;
  style: CSSProperties;
}) {
  const [currentState, setCurrentState] = useState();
  const [equipments, setEquipments] = useState([]);

  // const builder = new XMLBuilder();
  // const xmlContent = builder.build(jObj);

  // console.log(xmlReader(apiFeed));
  // // console.log('xmlContent', xmlContent);

  // console.log(xmlParser(apiFeed));
  // console.log(apiFeed);
  // useEffect(() => {

  //   axios
  //     .get(apiFeed, {
  //       "Content-Type": "application/xml; charset=utf-8",
  //     })
  //     .then((response) => {
  //       // console.log('Your xml file as string', response.data);
  //       const parser = new XMLParser();
  //       const { Fleet: fleet } = parser.parse(response.data);
  //       console.log("fleet.Equipment", fleet);
  //       console.log("fleet.Equipment", fleet.Equipment);
  //       setEquipments(fleet.Equipment);
  //     })
  //     .then(() => {
  //       console.log("equipments", equipments);
  //     });
  // }, []);

  // useEffect(() => {
  //   const equipmentSet = new Set();
  //   equipments.length &&
  //     equipments.forEach((item) => {
  //       equipmentSet.add(item.EquipmentHeader.oemName);
  //     });
  //   console.log("equipmentSet", equipmentSet);
  // }, [equipments]);

  const infoObjKeys = Object.keys(infoObj || {});
  if (!infoObjKeys.length) return null;

  const { equipmentTrackings } = infoObj;

  return (
    <InfoViewContext.Provider
      value={{
        infoObj,
      }}
    >
      <Container
        style={{
          paddingTop: 20,
          paddingBottom: 20,
          ...style,
        }}
        className="EquipmentsMapInfoView"
      >
        <Typography variant="h3" style={{ fontSize: 20 }}>
          Info View
        </Typography>
        {/* <Typography color="gray" variant="body2">
        Display {infoObj?.name || "object"} detail here.
      </Typography> */}
        {equipmentTrackings && (
          <Typography color="gray" variant="body2">
            {equipmentTrackings[0] &&
              moment(equipmentTrackings[0]["trackingTimestamp"]).fromNow()}
          </Typography>
        )}
        <List>
          {infoObjKeys
            .filter((item) => !["camera"].includes(item))
            .map((item, idx) => (
              <EquipmentsMapInfoItem key={idx} item={item} infoObj={infoObj} />
            ))}
          {infoObj["center"] && (
            <>
              <ListItem>lat: {infoObj["center"]["lat"]}</ListItem>
              <ListItem>lng: {infoObj["center"]["lng"]}</ListItem>
            </>
          )}
        </List>
        <EquipmentsMapInfoMatrics />
      </Container>
    </InfoViewContext.Provider>
  );
}

function EquipmentsMapInfoMatrics() {
  const { infoObj } = useContext(InfoViewContext);
  const { equipmentId } = infoObj;

  if (!equipmentId) return null;
  // equipmentId = String(equipmentId);

  const role = { tenant: MasterMaterialRoles.read };
  sessionStorage.setItem("X-Hasura-Role", JSON.stringify(role));

  const { data, loading, error } = useSubscription(
    SUBSCRIBE_EQUIPMENT_TRACKING_INSIGHTS,
    {
      variables: {
        equipmentId,
      },
      context: {
        role: "viewTenantMaterialMaster",
      },
    }
  );

  if (loading) return null;
  if (error) {
    console.error(error);
    return null;
  }

  const rows = data.equipmentTrackingInsights[0];
  const keys = Object.keys(rows);

  return (
    <List>
      {keys.map((key, idx) => (
        <EquipmentsMapInfoMetricItem key={idx} label={key} value={rows[key]} />
      ))}
    </List>
  );
}

function EquipmentsMapInfoMetricItemTrackingDate({
  label,
  date,
}: {
  label: string;
  date: string;
}) {
  const { infoObj } = useContext(InfoViewContext);
  const { equipmentId } = infoObj;
  const { data, loading, error } = useSubscription(
    SUBSCRIBE_EQUIPMENT_TRACKING_INSIGHTS_TRACKINGDATE,
    {
      variables: {
        equipmentId,
        trackingDate: date,
      },
      context: {
        role: "viewTenantMaterialMaster",
      },
    }
  );
  if (error) {
    console.error(error);
    return null;
  }
  if (loading) return null;

  const { equipmentTrackingInsights } = data;

  return equipmentTrackingInsights && equipmentTrackingInsights[0] ? (
    <div>
      {equipmentTrackingInsights[0][label].toFixed(2)}% (
      {moment(date).fromNow()})
    </div>
  ) : (
    <div>No Data ({moment(date).fromNow()})</div>
  );
}

function EquipmentsMapInfoMetricItem({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  const dates: {
    value?: moment.DurationInputArg1;
    unit: moment.unitOfTime.DurationConstructor;
  }[] = [
    {
      value: 0,
      unit: "day",
    },
    {
      value: -1,
      unit: "week",
    },
    {
      value: -1,
      unit: "month",
    },
  ];
  let notes: JSX.Element[] = [];
  switch (label) {
    case "__typename":
      return null;
    case "carbonUsage":
    // break-throw
    case "idlePercentage":
      if (typeof value !== "number") {
        return null;
      }
      value = `${(parseFloat(value) * 100).toFixed(2)}%`;
      notes = dates.map(({ value: v, unit }, idx) => (
        <EquipmentsMapInfoMetricItemTrackingDate
          key={idx}
          label={label}
          date={moment().add(v, unit).format("YYYY-MM-DD")}
        />
      ));
      break;
    case "lastUsed":
      value = moment(value).fromNow();
      break;
    default:
    // do nothing
  }

  return (
    <ListItem
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "start",
      }}
    >
      <span>{label}</span>
      <span>
        {typeof value === "number" ? Number(value).toFixed(2) : value}
        <br />
        {notes}
      </span>
    </ListItem>
  );
}

function EquipmentsMapInfoItem({
  infoObj,
  item,
}: {
  infoObj: any;
  item: string;
}) {
  switch (item) {
    case "type":
      return (
        <ListItem style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{item}</span>
          <span style={{ display: "block-inline", float: "right" }}>
            {item === "type"
              ? MarkerType[infoObj[item]]
              : infoObj[item].toString()}
          </span>
        </ListItem>
      );
    case "equipmentTrackings":
      return (
        <ListItem style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{infoObj["equipmentTrackings"][0]["trackingParameter"]}</span>
          <span style={{ display: "block-inline", float: "right" }}>
            {`Latitude: ${infoObj["equipmentTrackings"][0]["metadata"]["Latitude"]}`}
            <br />
            {`Longitude: ${infoObj["equipmentTrackings"][0]["metadata"]["Longitude"]}`}
            <br />
            {`Altitude: ${infoObj["equipmentTrackings"][0]["metadata"]["Altitude"]}`}
            <br />
            <span style={{ color: "#999", float: "right" }}>
              {moment(
                infoObj["equipmentTrackings"][0]["trackingTimestamp"]
              ).fromNow()}
            </span>
          </span>
        </ListItem>
      );
    default:
      return (
        <ListItem style={{ display: "flex", justifyContent: "space-between" }}>
          <span>{item}</span>
          <span style={{ display: "block-inline", float: "right" }}>
            {infoObj[item] && infoObj[item].toString()}
          </span>
        </ListItem>
      );
  }
}
