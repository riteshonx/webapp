import { ReactElement, useEffect } from "react";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import moment from "moment";
import "./MapView.scss";
import markerIcon from "../../../assets/images/marker.png";

declare const google: any;

interface Props {
  info: any;
  levelType: string;
  circleDeg: any;
}

const MapView = (props: Props): ReactElement => {
  const { innerHeight: height } = window;
  useEffect(() => {
    async function loadMap() {
      if (props.levelType === "portfolio") {
        const coordinates = props.info
          ? props.info?.projectInfos?.map((project: any) => {
              return {
                lat: project.latitude,
                lng: project.longitude,
                end: moment
                  .utc(project?.endDate)
                  .format("DD MMM YY")
                  .toString(),
                start: moment
                  .utc(project?.startDate)
                  .format("DD MMM YY")
                  .toString(),
                name: project.projectName,
              };
            })
          : [
              {
                lat: 37.6597307,
                lng: -121.8975718,
                end: moment().format("DD MMM YY"),
                start: moment().format("DD MMM YY"),
                name: "Test",
              },
            ];
        const map = new google.maps.Map(document.getElementById("googleMap"), {
          zoom: 10,
          // minZoom: 1,
          center: new google.maps.LatLng(
            coordinates[0]?.lat ? coordinates[0].lat : 37.6597307,
            coordinates[0]?.lng ? coordinates[0].lng : -121.8975718
          ),
          mapTypeControl: false,
          streetViewControl: false,
          zoomControl: false,
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
      } else {
        console.log("props.info?", props.info);
        let lat;
        let lng;
        if (props.info?.latitude === 0 && props.info?.longitude === 0) {
          const res = await getLatLngByZipCode(props.info?.address?.postalCode);
          lat = res.lat;
          lng = res.lng;
          console.log("res", res);
        } else {
          lat = props.info?.latitude;
          lng = props.info?.longitude;
        }
        const myLatLng = {
          lat: lat ? lat : 37.6597307,
          lng: lng ? lng : -121.8975718,
        };
        const map = new google.maps.Map(document.getElementById("googleMap"), {
          zoom: 10,
          center: new google.maps.LatLng(
            lat ? lat : 37.6597307,
            lng ? lng : -121.8975718
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
    }
    loadMap();
  }, [props.info]);

  const getLatLngByZipCode = async (zipcode: any) => {
    console.log("zipcode", zipcode);
    const geocoder = new google.maps.Geocoder();
    const address = zipcode;
    const response = await geocoder.geocode(
      { address: address },
      (results: any, status: any) => {
        if (status == google.maps.GeocoderStatus.OK) {
          const lat = results[0].geometry.location.lat();
          const lng = results[0].geometry.location.lng();
          console.log("lat", lat, "long", lng);
        } else {
          console.log(
            "Geocode was not successful for the following reason: " + status
          );
        }
      }
    );
    return {
      lat: response?.results[0].geometry.location.lat(),
      lng: response?.results[0].geometry.location.lng(),
    };
  };

  return (
    // <Card className={"mapview1-container"}>
    //   <CardContent
    //     style={{
    //       height: height * 0.3,
    //     }}
    //   >
    <div
      style={{
        position: "absolute",
        height: "322px",
        width: "322px",
        zIndex: 6,
        borderRadius: "50%",
        overflow: "hidden",
        transform: `rotate(-${props.circleDeg}deg)`,
        transition: "transform 0.7s linear",
      }}
    >
      <div
        id="googleMap"
        style={{
          height: "100%",
        }}
      ></div>
    </div>
  );
};

export default MapView;
