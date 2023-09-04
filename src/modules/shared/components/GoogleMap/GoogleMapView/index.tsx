/**
 * @todo we should update the project/portfolio location lat and lng
 */

import type { EquipmentData } from "../../../../equipments-map/EquipmentsMapTypes";
import { renderToString } from "react-dom/server";
import { ReactElement, SetStateAction, useEffect, useState } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import moment from "moment";
import {
  QueryBuilder as QueryBuilderIcon,
  AvTimer as AvTimerIcon,
} from "@material-ui/icons";
import "./index.scss";
import markerIcon from "../../../../../assets/images/marker.png";
import locIcon from "../../../../../assets/images/loc.png";
import { DEFAULT_LATITUDE, DEFAULT_LONGITUDE } from "./GoogleMapViewUtils";
import { useHistory } from "react-router-dom";
import { ProjectInfo } from "src/modules/Dashboard/components/Dashboard2/Components/DashboardMapViewContainer";
import ReactDOMServer from "react-dom/server";

declare const google: any;

/**
 * @reference https://developers.google.com/maps/documentation/javascript/reference/marker
 */
type LatLng = {
  lat: number;
  lng: number;
};

export type MapMarker = {
  position?: LatLng;
  icon?: string;
  label?: string;
  title?: string;
  info?: any;
};

const defaultValues = {
  zoom: 13,
};

const createMark = (
  map: any,
  position: { lat: number; lng: number },
  content?: string,
  icon?: string
) => {
  const marker = new google.maps.Marker({
    position,
    map,
    icon: {
      url: icon || markerIcon,
      scaledSize: new google.maps.Size(35, 35), // scaled size
    },
  });

  const infowindow = new google.maps.InfoWindow({
    content,
  });

  marker.addListener("click", () => {
    infowindow.open(map, marker);
  });

  marker.addListener("mouseover", () => {
    infowindow.open(map, marker);
  });

  marker.addListener("mouseout", () => {
    infowindow.close();
  });
};

function createGoogleMap({
  elementId,
  position,
}: {
  elementId?: string;
  position?: LatLng;
}) {
  return new google.maps.Map(
    document.getElementById(elementId || "googleMap"),
    {
      zoom: defaultValues.zoom,
      // minZoom: 1,
      center: new google.maps.LatLng(
        position?.lat || DEFAULT_LATITUDE,
        position?.lng || DEFAULT_LONGITUDE
      ),
      mapTypeControl: false,
      streetViewControl: false,
      fullscreenControl: false,
      // zoomControl: false,
      // draggable: false,
      // fullscreenControlOptions: {
      //   position: google.maps.ControlPosition.BOTTOM_RIGHT,
      // }
    }
  );
}

function MarkerEquipmentContent({
  model,
  oemName,
  equipmentId,
}: EquipmentData) {
  return (
    <div style={{ paddingLeft: "10px", width: "250px" }}>
      <div
        style={{
          fontWeight: "bold",
          display: "flex",
          fontSize: "1.5rem",
          flex: 1,
          marginBottom: "5px",
        }}
      >
        {`${oemName} ${model} (${equipmentId})`}
      </div>
    </div>
  );
}

// @todo, shoiuld use markers instead of coordinates

interface Props {
  info: any;
  levelType: string;
  markers?: MapMarker[];
  getMarkerContent?: (arg: any) => string;
}

declare global {
  interface Document {
    mozCancelFullScreen?: () => Promise<void>;
    msExitFullscreen?: () => Promise<void>;
    webkitExitFullscreen?: () => Promise<void>;
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    onwebkitfullscreenchange?: any;
    onmsfullscreenchange?: any;
    onmozfullscreenchange?: any;
  }

  interface HTMLElement {
    msRequestFullScreen?: () => Promise<void>;
    mozRequestFullScreen?: () => Promise<void>;
    webkitRequestFullScreen?: () => Promise<void>;
  }
}

const FullscreenControl = () => (
  <button
    style={{
      background: "none rgb(255, 255, 255)",
      border: 0,
      margin: "10px",
      padding: "4px",
      textTransform: "none",
      appearance: "none",
      position: "absolute",
      cursor: "pointer",
      userSelect: "none",
      borderRadius: "2px",
      height: "40px",
      width: "40px",
      boxShadow: "rgba(0, 0, 0, 0.3) 0px 1px 4px -1px",
      overflow: "hidden",
      top: 0,
      right: 0,
    }}
  >
    <img
      src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M0%200v6h2V2h4V0H0zm16%200h-4v2h4v4h2V0h-2zm0%2016h-4v2h6v-6h-2v4zM2%2012H0v6h6v-2H2v-4z%22/%3E%3C/svg%3E"
      alt="full screen icon"
      style={{ height: "18px", width: "18px" }}
    />
  </button>
);

const GoogleMapView = ({
  markers,
  info,
  levelType,
  getMarkerContent,
}: Props): ReactElement => {
  const { innerHeight: height } = window;
  const [map, setMap] = useState();
  const history = useHistory();

  function initFullscreenControl(map: any) {
    const fullscreenControlOrigin = document.querySelector(
      ".gm-fullscreen-control"
    );
    fullscreenControlOrigin && fullscreenControlOrigin.remove();

    const fullscreenControl = document.createElement("span");
    fullscreenControl.innerHTML = ReactDOMServer.renderToStaticMarkup(
      <FullscreenControl />
    );

    fullscreenControl.onclick = (e) => {
      e.preventDefault();
      history.push("/equipments-map");
    };
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(fullscreenControl);
  }

  useEffect(() => {
    // @todo should remove setTimeout
    setTimeout(() => {
      map && initFullscreenControl(map);
    }, 1000);
    return map;
  }, [map]);

  const createMap = () => {
    if (!info) return;
    let newMap: SetStateAction<any>;
    switch (levelType) {
      case "portfolio":
        const coordinates = info.projectInfos.map(
          ({
            latitude,
            longitude,
            endDate,
            startDate,
            projectName,
          }: ProjectInfo) => ({
            position: {
              lat: latitude,
              lng: longitude,
            },
            endDate,
            startDate,
            projectName,
          })
        );

        newMap = createGoogleMap({
          elementId: "googleMap",
          position: coordinates[0].position,
        });

        for (let i = 0; i < coordinates?.length; i++) {
          createMark(
            newMap,
            {
              lat: coordinates[i]?.position?.lat || DEFAULT_LATITUDE,
              lng: coordinates[i]?.position?.lng || DEFAULT_LONGITUDE,
            },
            getMarkerContent && getMarkerContent(coordinates[i])
          );
        }
        break;

      case "project": // break-through

      default:
        const position = {
          lat: info?.latitude || DEFAULT_LATITUDE,
          lng: info?.longitude || DEFAULT_LONGITUDE,
        };

        newMap = createGoogleMap({
          elementId: "googleMap",
          position,
        });

        createMark(
          newMap,
          position,
          getMarkerContent && getMarkerContent(info)
        );
    }
    setMap(newMap);
    return newMap;
  };

  const createGoogleMarkers = (map: any) => {
    markers?.forEach(({ position, info, icon }: MapMarker) => {
      if (!position) return;
      const content = renderToString(<MarkerEquipmentContent {...info} />);
      createMark(map, position, content, icon);
    });
  };

  // useEffect(() => {
  //   if (!map) return;
  //   createGoogleMarkers();
  // }, [markers]);

  // @todo, should move the markers logic to container level

  // useEffect(() => {
  //   createMap();
  // }, [info]);

  useEffect(() => {
    const aMap = createMap();
    createGoogleMarkers(aMap);
  }, []);

  return (
    <>
      <Card
        className={
          levelType === "portfolio"
            ? "mapview-container mapview-container__portfolio"
            : "mapview-container"
        }
      >
        <CardContent
          className={
            levelType === "portfolio"
              ? "mapview-container__portfolioContent"
              : "mapview-container__portfolioContent"
          }
          style={{ flexDirection: "column" }}
        >
          <div
            style={{
              padding: levelType !== "portfolio" ? "0.5rem" : "",
              display: "flex",
            }}
          >
            <div
              id="googleMap"
              style={{
                height: levelType === "project" ? height * 0.26 : height * 0.3,
              }}
            ></div>
            {levelType === "project" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "2rem 0",
                }}
              >
                <div className={"date-container"}>
                  <QueryBuilderIcon className={"t-icon"} />
                  <div className={"label"}>Start date</div>
                  {info && (
                    <div>
                      {/* {moment(props.info.startDate).format("MM/DD/YY")} */}
                      {moment
                        .utc(info.startDate)
                        .format("DD MMM YY")
                        .toString()}
                    </div>
                  )}
                </div>
                <div style={{ flex: 0.1 }}></div>
                <div className={"date-container"}>
                  <AvTimerIcon className={"t-icon"} />
                  <div className={"label"}>Completion date</div>
                  {info &&
                    moment.utc(info.endDate).format("DD MMM YY").toString()}
                </div>
              </div>
            ) : (
              // <div className={"details-container"}>
              //   <div className={"date-container"}>
              //     <div className={"left"}>
              //       <QueryBuilderIcon className={"t-icon"} />
              //     </div>
              //     <div className={"right"}>
              //       <div className={"label"}>Start date</div>
              //       {props.info && (
              //         <div>
              //           {/* {moment(props.info.startDate).format("MM/DD/YY")} */}
              //           {moment
              //             .utc(props.info.startDate)
              //             .format("DD MMM YY")
              //             .toString()}
              //         </div>
              //       )}
              //     </div>
              //   </div>
              //   <div style={{ flex: 0.1 }}></div>
              //   <div className={"date-container"}>
              //     <div className={"left"}>
              //       <AvTimerIcon className={"t-icon"} />
              //     </div>
              //     <div className={"right"}>
              //       <div className={"label"}>Completion date</div>
              //       {props.info &&
              //         moment
              //           .utc(props.info.endDate)
              //           .format("DD MMM YY")
              //           .toString()}
              //     </div>
              //   </div>
              // </div>
              <div className={"projects-container"}>
                <div className={"count"}>
                  {info ? info?.projectInfos?.length : 0}
                </div>
                <div>Active projects</div>
              </div>
            )}
          </div>

          {levelType === "project" && info && (
            <div className={"address-container"}>
              <img src={locIcon} className={"loc-icon"} />
              <Typography
                variant="body2"
                color="textSecondary"
                component="p"
                className={"location"}
              >
                {info?.address?.fullAddress
                  ? info?.address?.fullAddress
                  : "100 WEST WASHINGTON ST. CHICAGO"}
              </Typography>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default GoogleMapView;
