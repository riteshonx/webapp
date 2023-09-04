import { ReactElement, useEffect } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import moment from "moment";
import "./MapView.scss";
import markerIcon from "../../../../../../assets/images/marker.png";

declare const google: any;

interface Props {
  location: any;
}

const MapView = (props: Props): ReactElement => {
  const { innerHeight: height } = window;
  useEffect(() => {
    const coordinates = [
      {
        lat: props.location?.lat,
        lng: props.location?.long,
        end: moment().format("DD MMM YY"),
        start: moment().format("DD MMM YY"),
        name: props.location?.prjName
          ? props.location?.prjName
          : "Aurora Palms",
      },
    ];
    const map = new google.maps.Map(document.getElementById("googleMap"), {
      zoom: 17,
      center: new google.maps.LatLng(
        coordinates[0]?.lat && coordinates[0].lng
          ? coordinates[0].lat
          : 25.4478874,
        coordinates[0]?.lat && coordinates[0].lng
          ? coordinates[0].lng
          : -80.496929
      ),
      mapTypeControl: false,
      streetViewControl: true,
    });
    for (let i = 0; i < coordinates?.length; i++) {
      const myLatLng = {
        lat: coordinates[i]?.lat ? coordinates[i].lat : 37.6597307,
        lng: coordinates[i]?.lng ? coordinates[i].lng : -121.8975718,
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
  }, [props?.location]);

  return (
    <Card className={"mapview2-container"}>
      <CardContent
        style={{
          height: height * 0.9,
        }}
      >
        <div id="googleMap"></div>
      </CardContent>
    </Card>
  );
};

export default MapView;
