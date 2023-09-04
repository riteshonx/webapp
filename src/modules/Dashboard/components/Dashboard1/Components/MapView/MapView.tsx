import { ReactElement, useEffect } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import moment from "moment";
import "./MapView.scss";
import markerIcon from "../../../../../../assets/images/marker.png";

declare const google: any;

interface Props {
  info: any;
  levelType: string;
}

// @todo PLA-4082
const MapView = (props: Props): ReactElement => {
  const { innerHeight: height } = window;
  const { REACT_APP_DEFAULT_LOGITUDE, REACT_APP_DEFAULT_LATITUDE } =
    process.env;
  useEffect(() => {
    if (props.levelType === "portfolio") {
      const coordinates = props.info
        ? props.info?.projectInfos?.map((project: any) => {
            return {
              lat: project.latitude,
              lng: project.longitude,
              end: moment.utc(project?.endDate).format("DD MMM YY").toString(),
              start: moment
                .utc(project?.startDate)
                .format("DD MMM YY")
                .toString(),
              name: project.projectName,
            };
          })
        : [
            {
              lat: REACT_APP_DEFAULT_LATITUDE || 37.6597307,
              lng: REACT_APP_DEFAULT_LOGITUDE || -121.8975718,
              end: moment().format("DD MMM YY"),
              start: moment().format("DD MMM YY"),
              name: "Test",
            },
          ];
      const map = new google.maps.Map(document.getElementById("googleMap"), {
        zoom: 10,
        // minZoom: 1,
        center: new google.maps.LatLng(
          coordinates[0]?.lat
            ? coordinates[0].lat
            : REACT_APP_DEFAULT_LATITUDE || 37.6597307,
          coordinates[0]?.lng
            ? coordinates[0].lng
            : REACT_APP_DEFAULT_LOGITUDE || -121.8975718
        ),
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
      });
      for (let i = 0; i < coordinates?.length; i++) {
        const myLatLng = {
          lat: coordinates[i]?.lat
            ? coordinates[i].lat
            : REACT_APP_DEFAULT_LATITUDE || 37.6597307,
          lng: coordinates[i]?.lng
            ? coordinates[i].lng
            : REACT_APP_DEFAULT_LOGITUDE || -121.8975718,
        };
        const marker = new google.maps.Marker({
          position: myLatLng,
          map,
          icon: {
            url: markerIcon,
            scaledSize: new google.maps.Size(35, 35), // scaled size
          },
        });

        const infowindow = new google.maps.InfoWindow({
          content:
            "<div style='float:right; padding-left: 10px;width: 250px;'><div><b>" +
            coordinates[i].name +
            "</b></div><br/><div style='display: flex;flex: 1; flex-direction: row;margin-bottom: 5px;'>" +
            "<div style='flex: 1; flex-direction: column;'><b>Start Date</b></div><div style='flex: 1; flex-direction: column;'>" +
            coordinates[i].start +
            "</div></div><div style='display: flex;flex: 1; flex-direction: row;'><div style='flex: 1; flex-direction: column;'>" +
            "<b>Completion Date</b></div><div style='flex: 1; flex-direction: column;'>" +
            coordinates[i].end +
            "</div></div></div>",
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
      }
    } else {
      const myLatLng = {
        lat: props.info?.latitude
          ? props.info?.latitude
          : REACT_APP_DEFAULT_LATITUDE || 37.6597307,
        lng: props.info?.longitude
          ? props.info?.longitude
          : REACT_APP_DEFAULT_LOGITUDE || -121.8975718,
      };
      const map = new google.maps.Map(document.getElementById("googleMap"), {
        zoom: 10,
        center: new google.maps.LatLng(
          props.info?.latitude
            ? props.info?.latitude
            : REACT_APP_DEFAULT_LATITUDE || 37.6597307,
          props.info?.longitude
            ? props.info?.longitude
            : REACT_APP_DEFAULT_LOGITUDE || -121.8975718
        ),
        mapTypeControl: false,
        streetViewControl: false,
        zoomControl: false,
        draggable: false,
      });
      const marker = new google.maps.Marker({
        position: myLatLng,
        map,
        icon: {
          url: markerIcon,
          scaledSize: new google.maps.Size(35, 35), // scaled size
        },
      });

      const infowindow = new google.maps.InfoWindow({
        content:
          "<div style='float:right; padding-left: 10px;width: 250px;'><div><b>" +
          props.info?.projectName +
          "</b></div><br/><div style='display: flex;flex: 1; flex-direction: row;margin-bottom: 5px;'>" +
          "<div style='flex: 1; flex-direction: column;'><b>Start Date</b></div><div style='flex: 1; flex-direction: column;'>" +
          moment.utc(props.info?.startDate).format("DD MMM YY").toString() +
          "</div></div><div style='display: flex;flex: 1; flex-direction: row;'><div style='flex: 1; flex-direction: column;'>" +
          "<b>Completion Date</b></div><div style='flex: 1; flex-direction: column;'>" +
          moment.utc(props.info?.endDate).format("DD MMM YY").toString() +
          "</div></div></div>",
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
    }
  }, [props.info]);

  return (
    <Card className={"mapview1-container"}>
      <CardContent
        style={{
          height: height * 0.3,
        }}
      >
        <div
          id="googleMap"
          style={{
            height: "100%",
          }}
        ></div>
      </CardContent>
    </Card>
  );
};

export default MapView;
