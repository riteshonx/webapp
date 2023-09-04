import { Dialog, makeStyles } from "@material-ui/core";
import MapView from "./mapView/MapView";

const useStyles = makeStyles(() => ({
  dialogPaper: {
    maxHeight: "90%",
    minHeight: "90%",
    minWidth: "90%",
    maxWidth: "90%",
    overflow: "hidden",
  },
}));

const MapPopup = (props: any) => {
  const classes = useStyles();

  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      onClose={props.close}
      open={props.open}
      className="image-carousel-container"
    >
      <MapView location={props.location} />
    </Dialog>
  );
};

export default MapPopup;
