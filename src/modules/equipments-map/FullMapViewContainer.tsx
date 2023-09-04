import "./index.css";
import { Checkbox, FormControlLabel } from "@mui/material";
import { EquipmentsMapContext } from ".";
import { genProfilioDetails } from "src/services/portfolioServices";
import { MapMarker } from "./components/SlateMapView";
import { slateLogo } from "./settings";
import { stateContext } from "../root/context/authentication/authContext";
import { useContext, useEffect, useRef, useState } from "react";
import EquipmentInfoModal from "./EquipmentInfoModel";
import EquipmentsMapInfoView from "./EquipmentsMapInfoView";
import MarkerIcon from "../../assets/images/marker.png";
import SimpleButtonListView from "../shared/components/GoogleMap/SimpleButtonListView";
import SlateMapView from "./components/SlateMapView";

// const useStyles = makeStyles(() => ({
//   noBorder: {
//     border: "none",
//   },
// }));

// function usePrevious(value) {
//   const ref = useRef();
//   useEffect(() => {
//     ref.current = value;
//   }, [value]);
//   return ref.current;
// }

// @todo should move the query to parent container
// @todo should create EquipmentTracking type on graphql engine
type EquipmentTracking = {
  metadata: {
    Altitude: string;
    Latitude: string;
    "@datetime": string;
    Longitude: string;
    AltitudeUnits: string;
  };
  trackingParameter: "Location";
  trackingTimestamp: string;
};

export type Equipment = {
  model: string;
  oemName: string;
  equipmentId: string;
  equipmentTrackings: [EquipmentTracking];
};

const DisplayLabelControl = ({
  ifDisplayLabel,
  setIfDisplayLabel,
}: {
  ifDisplayLabel: boolean;
  setIfDisplayLabel: (v: boolean) => void;
}) => (
  <span
    style={{
      display: "inline-block",
      position: "relative",
      bottom: 338,
      left: 220,
      background: "white",
      padding: "0 8px",
      borderRadius: 2,
      border: "1px solid #eee",
      boxShadow: "rgb(0 0 0 / 30%) 0px 1px 4px -1px",
    }}
  >
    <FormControlLabel
      label="Display Label"
      style={{}}
      onClick={() => setIfDisplayLabel(!ifDisplayLabel)}
      control={<Checkbox checked={ifDisplayLabel} />}
    />
    {/* <ConnectControlButton /> */}
  </span>
);

const defaultValues = {
  mapZoom: 18,
};

export enum MarkerType {
  PROJECT,
  EQUIPMENT,
}

const projectInfoToMarker = ({
  projectId,
  projectName = "Unkown",
  latitude,
  longitude,
}: any) => ({
  title: projectName,
  label: projectName,
  position: {
    lat: latitude,
    lng: longitude,
  },
  icon: MarkerIcon,
  info: {
    title: projectName,
    projectId,
    type: MarkerType.PROJECT,
  },
});

type Marker = {
  label: string;
  title: string;
  position: {
    lat: number;
    lng: number;
  };
  info: any;
};

// @todo should use just markers
export default function FullMapViewContainer({
  equipments,
  logo = slateLogo,
}: {
  equipments: Equipment[];
  logo?: string;
}) {
  const { setSelectedIndex, selectedIndex } = useContext(EquipmentsMapContext);
  const { state } = useContext(stateContext);
  const [map, setMap] = useState(null);
  const [mapZoom, setMapZoom] = useState(defaultValues.mapZoom);
  const [searchKeywords, setSearchKeywords] = useState("");
  const [searchNotFoundDialogOpen, setSearchNotFoundDialogOpen] =
    useState(false);
  const [currentLocation, setCurrentLocation] = useState();
  const [equipmentInfoModalOpen, setEquipmentInfoModalOpen] = useState(false);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [portfolioDetail, setPortfolioDetail] = useState<any>({});
  const [location, setLocation] = useState<google.maps.LatLngLiteral>();

  // const {project} = state;
  // const prevItemId = usePrevious(currentItemId);
  // const classes = useStyles();
  // makeStyles(() => ({
  //   noBorder: {
  //     border: "none",
  //   },
  // }));

  const { currentLevel } = state;

  // @todo need support equipmentTrackings that doesn't have length
  const getEquipmentMarkers = () =>
    equipments
      .filter((item: Equipment) => item.equipmentTrackings.length)
      .map(
        ({
          model,
          oemName,
          equipmentId,
          equipmentTrackings,
        }: Equipment): Marker => ({
          label: equipmentId,
          title: `${oemName} ${model} (${equipmentId})`,
          position: {
            lat: parseFloat(equipmentTrackings[0].metadata.Latitude),
            lng: parseFloat(equipmentTrackings[0].metadata.Longitude),
          },
          info: {
            title: `Equipment ${equipmentId}`,
            model,
            oemName,
            equipmentId,
            equipmentTrackings,
            type: MarkerType.EQUIPMENT,
          },
        })
      );

  useEffect(() => {
    async function genSetProfolioDetail() {
      const portfolioDetail = await genProfilioDetails(state);
      setPortfolioDetail(portfolioDetail);
    }
    genSetProfolioDetail();
  }, []);

  const setProjectMarker = (projectInfo: any) => {
    const { projectId, projectName, latitude, longitude } = projectInfo;
    const marker = markers.find(item => item?.info?.projectId === projectId);
    marker ? marker.info =  {
      title: projectName,
      projectId,
      type: MarkerType.PROJECT,
    } : markers.unshift(
      projectInfoToMarker({ projectId, projectName, latitude, longitude })
    );
    setMarkers(markers);
  }

  useEffect(() => {
    switch (currentLevel) {
      case "project":
        const { projectInfo } = state;
        if (!projectInfo) break;
        setProjectMarker(projectInfo);
        break;
      case "portfolio":
        if (!portfolioDetail || !portfolioDetail?.projectInfos) return;
        const { projectInfos } = portfolioDetail;
        projectInfos.map(setProjectMarker);
        break;
      default:
      // do nothing
    }

    setLocation(markers[0].position);
  }, [currentLevel, portfolioDetail]);

  useEffect(() => {
    if (!equipments || !equipments.length) return;
    setMarkers(getEquipmentMarkers());
  }, [equipments]);

  // useEffect(() => {
  //   equipmentMarkers.forEach((item, idx) => {
  //     // console.log("markerItem", item);
  //     // console.log("setLabel", equipments[idx].EquipmentHeader.EquipmentId);
  //     ifDisplayLabel
  //       ? item.setLabel(String(equipments[idx].EquipmentHeader.EquipmentId))
  //       : item.setLabel("");
  //   });
  // }, [ifDisplayLabel]);

  useEffect(() => {
    if (!map) return;
    // handleCurrentItemChange(currentItemId);
    // handleEquipmentsLoad(map);

    // map &&
    //   new map.Marker({
    //     position: { lat: 52.482952, lng: -1.878565 },
    //     map,
    //     title: "Hello World!",
    //   });
  }, [map]);

  const handleEquimentListItemClick = (idx: number) => {
    try {
      // console.log("handleEquimentListItemClick");
      // const { equipmentTrackings } = equipments[idx];
      // console.log('idx', idx);
      // console.log('equipmentTrackings[0].metadata.Altitude', equipmentTrackings[0].metadata.Altitude)
      setLocation({
        lat: markers[idx].position.lat,
        lng: markers[idx].position.lng,
      });
      setSelectedIndex(idx);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div
      className="equipments-map-view"
      style={{ height: "100%", overflowY: "hidden" }}
    >
      <SlateMapView
        markers={markers || []}
        mapLogo={logo}
        location={location}
        fullscreenControl={false}
        setMapZoom={setMapZoom}
        mapZoom={mapZoom}
        onMarkerClick={handleEquimentListItemClick}
      />

      {/* <Autocomplete
        freeSolo
        style={{
          position: "fixed",
          top: 8,
          right: 360,
          backgroundColor: "white",
          padding: "2px",
          borderRadius: 2,
          // border: "1px solid fff",
          boxShadow: "rgb(0 0 0 / 30%) 0px 1px 4px -1px",
        }}
        disablePortal
        id="combo-box-demo"
        options={top100Films}
        sx={{ width: 300 }}
        endAdornment={() => (
          <InputAdornment position="end">
            <Icon>
              <Search />
            </Icon>
          </InputAdornment>
        )}
        renderInput={(params) => (
          <TextField size="small" {...params} label="Search" />
        )}
      /> */}
      {/* <Autocomplete
        style={{
          position: "fixed",
          top: 20,
          left: "50%",
          backgroundColor: "white",
        }}
        freeSolo
        options={[{ label: "option 1" }]}
        renderInput={() => <TextField size="small" label="search" />}
      /> */}
      {/* <SearchForm /> */}

      <div
        style={{
          position: "fixed",
          bottom: 0,
          right: 387,
          fontSize: 10,
          backgroundColor: "rgba(255, 255, 255, 0.6)",
          padding: "1px 4px",
        }}
      >
        Zoom: {mapZoom.toFixed(0)}
      </div>
      <SimpleButtonListView
        style={{
          height: 242,
          overflowY: "scroll",
          position: "relative",
          maxWidth: 420,
          bottom: 340,
          left: 20,
          background: "white",
          borderRadius: 2,
          border: "1px solid #eee",
          boxShadow: "rgb(0 0 0 / 30%) 0px 1px 4px -1px",
        }}
        selectedIndex={selectedIndex || 0}
        onItemClick={handleEquimentListItemClick}
        items={
          markers && markers.length
            ? markers.map(({ title, info }) => ({
                type: info?.type,
                primary: title || "Unkown",
              }))
            : []
        }
      />
      <EquipmentsMapInfoView
        style={{
          overflowY: "scroll",
          position: "fixed",
          top: 120,
          right: 10,
          maxWidth: 420,
          background: "white",
          borderRadius: 2,
          border: "1px solid #eee",
          boxShadow: "rgb(0 0 0 / 30%) 0px 1px 4px -1px",
        }}
        infoObj={markers[selectedIndex] && markers[selectedIndex].info}
      />
      {/* <SearchResultNotFoundDialog
        inputRef={searchNotFoundDialogInputRef}
        searchKeywords={searchKeywords}
        handleKeywordsChange={handleKeywordsChange}
        open={searchNotFoundDialogOpen}
        onClose={() => {
          setSearchNotFoundDialogOpen(false);
        }}
      /> */}
      <EquipmentInfoModal
        open={equipmentInfoModalOpen}
        onClose={() => setEquipmentInfoModalOpen(false)}
      />
    </div>
  );
}
