import { Dialog, IconButton, makeStyles } from "@material-ui/core";
import { ReactElement } from "react";
import Slider from "react-slick";
import CancelIcon from "@material-ui/icons/Close";
import "./ImageCarousel.scss";

const carouselSettings = {
  dots: true,
  infinite: false,
  speed: 500,
  fade: true,
  cssEase: "linear",
  slidesToShow: 1,
  slidesToScroll: 1,
};

const useStyles = makeStyles(() => ({
  root: {
    width: 180,
    height: 250,
    backgroundSize: "100% 100%",
    backgroundRepeat: "no-repeat",
    transition: "transform 0.15s ease-in-out",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    borderRadius: 10,
    marginRight: "1rem",
  },
  cardHovered: {
    transform: "scale3d(1.05, 1.05, 1)",
  },
  actions: {
    color: "#fff",
  },
  dialogPaper: {
    maxHeight: "90%",
    minHeight: "90%",
    minWidth: "90%",
    maxWidth: "90%",
    overflow: "hidden",
  },
}));

interface Props {
  close: any;
  open: boolean;
  pictures: any;
  videos?: any;
}

function ImageCarousel(props: Props): ReactElement {
  const classes = useStyles();
  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      onClose={props.close}
      open={props.open}
      className="image-carousel-container"
    >
      <IconButton
        className="image-carousel-container__iconContainer"
        onClick={props.close}
      >
        <CancelIcon htmlColor="lightgrey" />
      </IconButton>
      <Slider {...carouselSettings}>
        {props.pictures?.map((imgSrc: any, index: any) => (
          <div key={index} className={"projectNameCard-main__image"}>
            <div
              style={{ backgroundImage: `url(${imgSrc})` }}
              className={"image-carousel-container__imageBg"}
            ></div>
          </div>
        ))}
        {props?.videos?.map((vidSrc: any, index: any) => (
          <div key={index} className={"projectNameCard-main__image"}>
            <video
              src={vidSrc}
              autoPlay
              loop
              controls
              className={"image-carousel-container__video"}
            />
          </div>
        ))}
      </Slider>
    </Dialog>
  );
}

export default ImageCarousel;
