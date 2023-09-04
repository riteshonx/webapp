import { Dialog, IconButton, makeStyles } from "@material-ui/core";
import { ReactElement, useEffect, useState } from "react";
import moment from "moment";
import CloseIcon from "@material-ui/icons/Close";
import "./ImageDetailsPopup.scss";

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

interface ImageDetailsPopup {
  selectedFile: any;
  close: any;
  open: boolean;
}

function ImageDetailsPopup(props: ImageDetailsPopup): ReactElement {
  const classes = useStyles();

  const [fileData, setFileData]: any = useState(null);

  useEffect(() => {
    setFileData(props.selectedFile);
  }, [props.selectedFile]);

  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      onClose={() => {
        props.close();
        setFileData(null);
      }}
      open={props.open}
      className="imageDetailsPopup"
    >
      <IconButton
        className="imageDetailsPopup__iconButton"
        onClick={() => {
          props.close();
          setFileData(null);
        }}
      >
        <CloseIcon />
      </IconButton>
      <div className="imageDetailsPopup__mainContainer">
        <div className="imageDetailsPopup__mainContainer__imageContainer">
          <div
            className="imageDetailsPopup__mainContainer__imageContainer__image"
            style={{
              backgroundImage: `url(${fileData?.url})`,
            }}
          ></div>
        </div>
        <div
          className={
            "imageDetailsPopup__mainContainer__detailsContainer imageDetailsPopup__mainContainer__detailsContainer__show"
          }
        >
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <label className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Name
            </label>
            <div>{fileData?.name ? fileData?.name : "NA"}</div>
          </div>
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <label className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Description
            </label>
            <div>{fileData?.description ? fileData?.description : "NA"}</div>
          </div>
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <label className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Tags
            </label>
            <div>
              {fileData?.documentTagAssociations?.map(
                (item: any, i: number) => (
                  <span key={i}>
                    {item?.tag?.name ? item?.tag?.name + ", " : "NA"}
                  </span>
                )
              )}
            </div>
          </div>
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Uploaded Date
            </span>
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text">
              {moment(fileData?.createdAt).format("DD MMM YYYY")}
            </span>
          </div>
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Uploaded By
            </span>
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text">
              {fileData?.createdByUser.firstName +
                " " +
                fileData?.createdByUser.lastName}
            </span>
          </div>
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Updated Date
            </span>
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text">
              {moment(fileData?.updatedAt).format("DD MMM YYYY")}
            </span>
          </div>
          <div className="imageDetailsPopup__mainContainer__detailsContainer__show__upload">
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text__label">
              Updated By
            </span>
            <span className="imageDetailsPopup__mainContainer__detailsContainer__show__text">
              {fileData?.updatedByUser.firstName +
                " " +
                fileData?.updatedByUser.lastName}
            </span>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default ImageDetailsPopup;
