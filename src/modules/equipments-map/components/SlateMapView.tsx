// @todo, need reslove Google Maps already loaded outside @googlemaps/js-api-loader error
import GoogleMapReact from "google-map-react";
import {
  CSSProperties,
  FC,
  MouseEventHandler,
  useContext,
  useRef,
  useState,
} from "react";
import { useHistory } from "react-router-dom";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { EquipmentsMapContext } from "..";
import ExavatorIcon from "../../../assets/images/equipments-map-excavator-icon.png";
import ProjectIcon from "../../../assets/images/marker.png";
import { MarkerType } from "../FullMapViewContainer";

const { REACT_APP_DEFAULT_LATITUDE, REACT_APP_DEFAULT_LONGITUDE } = process.env;

const defaultProps = {
  center: {
    lat: parseFloat(REACT_APP_DEFAULT_LATITUDE || "") || 37.6597349,
    lng: parseFloat(REACT_APP_DEFAULT_LONGITUDE || "") || -121.8997658,
  },
  zoom: 11,
};

// @todo should we display the project location?
// @reference: https://developers.google.com/maps/documentation/javascript/reference/marker
export type MapMarker = {
  label?: string;
  title?: string;
  position: google.maps.LatLngLiteral;
  icon?: string;
  info?: any;
  onClick?: () => void;
};

interface MarkerProps {
  label?: string;
  lat: number;
  lng: number;
  Icon: FC;
  style?: CSSProperties;
  info?: any;
  onClick?: MouseEventHandler<HTMLDivElement>;
}

function Marker({ style, label, Icon, onClick }: MarkerProps) {
  return (
    <div
      style={style}
      onClick={onClick}
      onDoubleClick={() => {
        console.log("double click");
      }}
    >
      <div>{label}</div>
      <Icon />
    </div>
  );
}

export type MapMarkers = MapMarker[];

interface MarkerIconProps {
  src?: string;
  style: CSSProperties;
  markerType?: MarkerType;
}

function MarkerIcon({
  style,
  src,
  markerType = MarkerType.PROJECT,
}: MarkerIconProps) {
  const typeIcons = {
    [MarkerType.PROJECT]: ProjectIcon,
    [MarkerType.EQUIPMENT]: ExavatorIcon,
  };
  return (
    <img
      src={src || typeIcons[markerType] || ProjectIcon}
      height={32}
      width={32}
      style={style}
    />
  );
}

export default function SlateMapView({
  markers,
  location,
  mapLogo,
  fullscreenControl,
  mapZoom,
  setMapZoom,
  onMarkerClick,
}: {
  fullscreenControl?: boolean;
  currentItemId?: number;
  markers: MapMarker[];
  location?: {
    lat: number;
    lng: number;
  };
  mapZoom?: number;
  onMarkerClick?: (idx: number) => void;
  setMapZoom?: (zoomlevel: number) => void;
  mapLogo?: string;
}) {
  // console.log("SlateMapView", location, markers);
  const { selectedIndex }: any = useContext(EquipmentsMapContext);
  const { state } = useContext(stateContext);
  const history = useHistory();
  const googleMapRef = useRef();
  const [map, setMap] = useState();
  // console.log("SlateMapView", location, markers, selectedIndex);

  // useEffect(() => {
  //   let clickBuffer = false;
  //   const bufferTimer = 300;
  //   equipmentMarkers.forEach((marker, idx) => {
  //     marker.addListener("click", (_e) => {
  //       setTimeout(() => {
  //         if (!clickBuffer) {
  //           console.log("click", idx);
  //           setCurrentItemId((prevItemId) => {
  //             console.log("setCurerentItemId");
  //             handleCurrentEquipmentMarkerChange(idx, prevItemId);
  //             return idx;
  //           });
  //         }
  //         clickBuffer = false;
  //       }, bufferTimer);
  //     });

  //     marker.addListener("dblclick", (e) => {
  //       console.log("dbclick e", e);
  //       clickBuffer = true;
  //       setEquipmentInfoModalOpen(true);
  //       // const zoom = map.getZoom();
  //       // map.setZoom(zoom === 14 ? 16 : 14);
  //       // map.setCenter(marker.getPosition());
  //       setTimeout(() => {
  //         clickBuffer = false;
  //       }, bufferTimer * 2);
  //     });
  //   });
  // }, [equipmentMarkers]);

  // useEffect(() => {
  //   if (!equipments?.length) return;
  //   handleCurrentItemChange(currentItemId);
  //   handleCurrentMarkerChange(currentItemId);
  // }, [currentItemId, equipments]);

  // useEffect(() => {
  //   document.addEventListener("keydown", () => {
  //     searchNotFoundDialogOpen
  //       ? searchNotFoundDialogInputRef.current.focus()
  //       : searchInputRef.current.focus();
  //   });
  // }, [searchNotFoundDialogOpen]);

  const handleMapLoaded = (map: any) => {
    const fullscreenControl = document.createElement("button");

    fullscreenControl.innerHTML =
      '<img src="data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%20viewBox%3D%220%200%2018%2018%22%3E%3Cpath%20fill%3D%22%23666%22%20d%3D%22M4%204H0v2h6V0H4v4zm10%200V0h-2v6h6V4h-4zm-2%2014h2v-4h4v-2h-6v6zM0%2014h4v4h2v-6H0v2z%22/%3E%3C/svg%3E" alt="" style="height: 18px; width: 18px;" />';

    fullscreenControl.setAttribute(
      "style",
      "background: none rgb(255, 255, 255); border: 0px; margin: 10px; padding: 0px; text-transform: none; appearance: none; position: absolute; cursor: pointer; user-select: none; border-radius: 2px; height: 40px; width: 40px; box-shadow: rgba(0, 0, 0, 0.3) 0px 1px 4px -1px; overflow: hidden; top: 0px; right: 0px;"
    );

    fullscreenControl.onclick = (e) => {
      e.preventDefault();
      history.push("/");
    };

    setTimeout(() => {
      const fullscreenControlOrigin = document.querySelector(
        ".gm-fullscreen-control"
      );
      fullscreenControlOrigin?.remove();
      map.controls[google.maps.ControlPosition.RIGHT_TOP].push(
        fullscreenControl
      );
    }, 1000);
  };

  return (
    <div className="slate-map-view" style={{ height: "100%", width: "100%" }}>
      <GoogleMapReact
        defaultZoom={mapZoom || defaultProps.zoom}
        center={location || defaultProps.center}
        onZoomAnimationStart={setMapZoom}
        options={{ 
          fullscreenControl: typeof fullscreenControl === 'undefined' ? true : false,
          mapTypeControl: true 
        }}
        yesIWantToUseGoogleMapApiInternals={true}
        onGoogleApiLoaded={({ map }) => handleMapLoaded(map)}
      >
        {markers.map(({ position, icon, info }, idx) => (
          <Marker
            lat={position.lat}
            lng={position.lng}
            key={idx}
            Icon={() => (
              <MarkerIcon
                markerType={info.type}
                src={icon}
                style={{
                  opacity: selectedIndex === idx ? "100%" : "66%",
                  cursor: onMarkerClick ? "pointer" : "hand",
                }}
              />
            )}
            onClick={() => onMarkerClick && onMarkerClick(idx)}
          />
        ))}
      </GoogleMapReact>
    </div>
  );
}
