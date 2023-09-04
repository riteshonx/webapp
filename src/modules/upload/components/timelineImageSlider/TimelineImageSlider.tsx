import { Dialog, IconButton, makeStyles } from '@material-ui/core';
import PauseIcon from '@material-ui/icons/PauseCircleOutlineRounded';
import PlayIcon from '@material-ui/icons/PlayCircleOutlineRounded';
import moment from 'moment';
import React, { useContext, useEffect, useState } from 'react';
import HorizontalTimeline from 'react-horizontal-timeline';
import { stateContext } from 'src/modules/root/context/authentication/authContext';

const useStyles = makeStyles(() => ({
  dialogPaper: {
    maxHeight: "90%",
    minHeight: "90%",
    minWidth: "90%",
    maxWidth: "90%",
    overflow: "hidden",
    backgroundImage:
      "linear-gradient( to top, rgba(29, 58, 64, 0.739583), rgba(29, 58, 64, 0.739583) 10%, rgba(29, 58, 64, 0.739583) 10%, hsla(12, 8%, 88%, 1) )",
  },
}));
const VALUES = ["2018-03-22", "2018-03-23"];
const EXAMPLE = [
  {
    data: "2018-03-22",
    status: "status",
    statusB: "Ready for Dev",
    statusE: "In Progress",
  },
  {
    data: "2018-03-23",
    status: "status",
    statusB: "In Progress",
    statusE: "Done",
  },
];
const TimelineImageSlider = ({ open, close, uploadedFiles }: any) => {
  const classes = useStyles();
  const { state }: any = useContext(stateContext);

  const [slideData, setSlideData]: any = useState({ value: 0, previous: 0 });
  const [isActive, setIsActive]: any = useState(true);
  const [imageFiles, setImageFiles]: any = useState([]);

  //   const curStatus = EXAMPLE[slideData.value].statusB;
  //   const prevStatus =
  //     slideData.value >= 0 ? EXAMPLE[slideData.previous].statusB : "";
  let interval: any;
  useEffect(() => {
    // console.log("uploadedFiles", uploadedFiles);
    if (uploadedFiles?.length)
      setImageFiles(
        uploadedFiles.filter((file: any) => file.documentType.name === "image")
      );
  }, [uploadedFiles]);

  useEffect(() => {
    if (imageFiles && slideData.value < imageFiles?.length && isActive) {
      interval = setInterval(() => {
        // console.log("slideData", {
        //   value: slideData.value + 1,
        //   previous: slideData.value,
        // });
        setSlideData({
          value: slideData.value + 1,
          previous: slideData.value,
        });
      }, 10000);
    } else {
      if (isActive)
        setSlideData({
          value: 0,
          previous: 0,
        });
      clearInterval(interval);
    }
    return () => {
      clearInterval(interval);
    };
    // The above code sets a new slideData object everytime slideData changes
    // This causes an infinite loop, I'm assuming this code is wanting to look at
    // the current slide datas value as opposed to both it and the previous value
    // (because the previous value is never read anywhere)
  }, [slideData.value, imageFiles, isActive]);

  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      onClose={() => {
        // if (interval) {
        clearInterval(interval);
        // }
        setSlideData({ value: 0, prev: 0 });
        setIsActive(true);
        close();
      }}
      open={open}
      className="timelineImageSlider"
    >
      {imageFiles && slideData.value < imageFiles?.length && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            flex: 1,
            width: "100%",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* <div className="text-center"> */}
          {/* {EXAMPLE[slideData.value].statusB} */}
          {/* <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              padding: "2rem",
              fontWeight: "bold",
              color: "#fff",
              width: "100%",
              background: "rgb(0,0,0,0.3)",
            }}
          > */}
          {/* <div
              style={{
                fontWeight: "bold",
                color: "#fff",
                fontSize: "21px",
                marginBottom: "0.5rem",
                display: "inline-flex",
                alignItems: "center",
              }}
            >
              {state.currentProject && state.currentProject?.projectName} -
              <div
                style={{
                  height: "2rem",
                  width: "2rem",
                  borderRadius: "4px",
                  backgroundColor: "red",
                  margin: "0 1rem",
                }}
              ></div>{" "}
              Behind
            </div> */}
          {/* <div
              style={{
                fontWeight: "bold",
                color: "#fff",
                fontSize: "18px",
              }}
            >
              {imageFiles[slideData.value].name}
            </div> */}
          <IconButton
            style={{
              position: "absolute",
              top: "0",
              right: "0",
              color: "rgb(0,0,0,0.09)",
              padding: "1rem",
            }}
            onClick={() => setIsActive(!isActive)}
          >
            {!isActive ? (
              <PlayIcon style={{ fontSize: "3rem" }} />
            ) : (
              <PauseIcon style={{ fontSize: "3rem" }} />
            )}
          </IconButton>
          {/* </div> */}

          <div
            // className="gridView__docList__fileContainer__img"
            style={{
              width: "100%",
              display: "flex",
              flex: 1,
              height: "100%",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "50%",
              backgroundImage: `url(${imageFiles[slideData.value].url})`,
            }}
          ></div>

          {/* any arbitrary component can go here */}
          {/* {EXAMPLE.map((x) => x.data)} */}
          {/* </div> */}
          {/* Bounding box for the Timeline */}
          <div
            style={{
              width: "95%",
              height: "100px",
              margin: "0 auto",
              position: "absolute",
              bottom: 0,
              color: "#fff",
              background: "rgb(0,0,0,0.09)",
            }}
          >
            <HorizontalTimeline
              index={slideData.value}
              indexClick={(index: any) => {
                setSlideData({ value: index, previous: slideData.value });
              }}
              // values={EXAMPLE.map((x) => x.data)}
              values={imageFiles.map(
                (file: any) =>
                  file.documentType.name === "image" &&
                  moment(file.updatedAt).format("DD MMM YYYY")
              )}
              slidingMotion={{ stiffness: 150, damping: 25 }}
              fillingMotion={{ stiffness: 150, damping: 25 }}
              showOpenEnding={true}
              showOpenBeginning={true}
            />
          </div>
        </div>
      )}
    </Dialog>
  );
};

export default TimelineImageSlider;
