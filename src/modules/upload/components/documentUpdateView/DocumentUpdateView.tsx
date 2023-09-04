import {
  Checkbox,
  Dialog,
  FormControl,
  FormControlLabel,
  IconButton,
  ListItemText,
  makeStyles,
  MenuItem,
  Select,
  TextField,
  Tooltip,
} from "@material-ui/core";
import { ReactElement, useEffect, useState } from "react";
import DescriptionIcon from "@material-ui/icons/Description";
import AudioIcon from "@material-ui/icons/Audiotrack";
import moment from "moment";
import CloseIcon from "@material-ui/icons/Close";
import "./DocumentUpdateView.scss";
import EditIcon from "@material-ui/icons/Edit";
import DownloadIcon from "@material-ui/icons/GetApp";
import SaveIcon from "@material-ui/icons/Save";
import UndoIcon from "@material-ui/icons/Undo";
import ViewIcon from "@material-ui/icons/Visibility";
import CloseViewIcon from "@material-ui/icons/VisibilityOff";
import {
  canCreateUploads,
  canUpdateUploads,
} from "src/modules/root/components/Sidebar/permission";

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

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps: any = {
  anchorOrigin: {
    vertical: "bottom",
    horizontal: "left",
  },
  transformOrigin: {
    vertical: "top",
    horizontal: "left",
  },
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
    },
  },
  getContentAnchorEl: null,
};

function DocumentUpdateView(props: any): ReactElement {
  const classes = useStyles();

  const [displayEdit, setDisplayEdit] = useState(false);
  const [fileData, setFileData]: any = useState(null);
  const [currentChanges, setCurrentChanges]: any = useState(null);
  const [tagNames, setTagNames]: any = useState([]);

  useEffect(() => {
    setFileData(props.selectedFile);
    if (props.selectedFile)
      setTagNames(
        props.selectedFile?.documentTagAssociations?.map(
          (item: any) => item.tag.name
        )
      );
  }, [props.selectedFile]);

  const handleTagChange = (event: any) => {
    const tagAssociations: any = [];
    props.tags?.forEach((item: any) => {
      if (event.target.value.includes(item.name))
        tagAssociations.push({ tag: { id: item.id, name: item.name } });
    });
    const data = {
      ...fileData,
      documentTagAssociations: tagAssociations,
    };
    setFileData(data);
    setCurrentChanges(data);
    setTagNames(event.target.value);
  };

  const handleChanges = (e: any) => {
    const data: any = {
      ...fileData,
      [e.target.name]: e.target.value,
    };
    setCurrentChanges(data);
    setFileData(data);
  };

  const handleViewOnDashboardChange = (e: any, checked: any) => {
    const data: any = {
      ...fileData,
      [e.target.name]: checked,
    };
    setCurrentChanges(data);
    setFileData(data);
  };

  return (
    <Dialog
      classes={{ paper: classes.dialogPaper }}
      onClose={() => {
        props.close();
        setDisplayEdit(false);
        setCurrentChanges(null);
        setFileData(null);
        setTagNames([]);
      }}
      open={props.open}
      className="documentUpdateView"
    >
      <IconButton
        className="documentUpdateView__iconButton"
        onClick={() => {
          props.close();
          setDisplayEdit(false);
          setCurrentChanges(null);
          setFileData(null);
          setTagNames([]);
        }}
      >
        <CloseIcon />
      </IconButton>
      <div className="documentUpdateView__mainContainer">
        <div className="documentUpdateView__mainContainer__imageContainer">
          {fileData?.documentType.name === "image" && (
            <div
              className="documentUpdateView__mainContainer__imageContainer__image"
              style={{
                backgroundImage: `url(${fileData?.url})`,
              }}
            ></div>
          )}
          {fileData?.documentType.name === "video" && (
            <video
              width="100%"
              height="100%"
              controls={false}
              autoPlay={true}
              muted
              loop
            >
              <source src={fileData?.url} type="video/mp4" />
            </video>
          )}
          {fileData?.documentType.name === "docs" && (
            <DescriptionIcon className="documentUpdateView__mainContainer__imageContainer__doc"></DescriptionIcon>
          )}
          {fileData?.documentType.name === "audio" && (
            <AudioIcon className="documentUpdateView__mainContainer__imageContainer__doc"></AudioIcon>
          )}
        </div>
        <div className="documentUpdateView__mainContainer__buttonContainer">
          {displayEdit && (canUpdateUploads() || canCreateUploads()) && (
            <Tooltip title="Save" placement="top">
              <IconButton
                className="documentUpdateView__mainContainer__buttonContainer__button"
                onClick={() => {
                  props.handleSaveChanges(currentChanges);
                }}
              >
                <SaveIcon className="documentUpdateView__mainContainer__buttonContainer__button__icon" />
              </IconButton>
            </Tooltip>
          )}
          {!canCreateUploads() &&
            !canUpdateUploads() &&
            (!displayEdit ? (
              <Tooltip title="View Details" placement="top">
                <IconButton
                  className="documentUpdateView__mainContainer__buttonContainer__button"
                  onClick={() => setDisplayEdit(true)}
                >
                  <ViewIcon className="documentUpdateView__mainContainer__buttonContainer__button__icon" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Close View" placement="top">
                <IconButton
                  className="documentUpdateView__mainContainer__buttonContainer__button"
                  onClick={() => setDisplayEdit(false)}
                >
                  <CloseViewIcon className="documentUpdateView__mainContainer__buttonContainer__button__icon" />
                </IconButton>
              </Tooltip>
            ))}
          {(canUpdateUploads() || canCreateUploads()) &&
            (!displayEdit ? (
              <Tooltip title="Edit" placement="top">
                <IconButton
                  className="documentUpdateView__mainContainer__buttonContainer__button"
                  onClick={() => setDisplayEdit(true)}
                >
                  <EditIcon className="documentUpdateView__mainContainer__buttonContainer__button__icon" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Undo Changes and Close Editor" placement="top">
                <IconButton
                  className="documentUpdateView__mainContainer__buttonContainer__button"
                  onClick={() => {
                    setFileData(props.selectedFile);
                    setTagNames(
                      props.selectedFile?.documentTagAssociations?.map(
                        (item: any) => item.tag.name
                      )
                    );
                    setCurrentChanges(null);
                    setDisplayEdit(false);
                  }}
                >
                  <UndoIcon className="documentUpdateView__mainContainer__buttonContainer__button__icon" />
                </IconButton>
              </Tooltip>
            ))}
          <Tooltip title="Download" placement="top">
            <IconButton
              className="documentUpdateView__mainContainer__buttonContainer__button"
              onClick={() => {
                window.open(fileData?.url, "_blank");
              }}
            >
              <DownloadIcon className="documentUpdateView__mainContainer__buttonContainer__button__icon" />
            </IconButton>
          </Tooltip>
        </div>
        <div
          className={
            displayEdit && (canCreateUploads() || canUpdateUploads())
              ? "documentUpdateView__mainContainer__detailsContainer documentUpdateView__mainContainer__detailsContainer__show"
              : displayEdit && !canCreateUploads() && !canUpdateUploads()
              ? "documentUpdateView__mainContainer__detailsContainer" +
                " documentUpdateView__mainContainer__detailsContainer__show" +
                " documentUpdateView__mainContainer__detailsContainer__show__nonEditable"
              : "documentUpdateView__mainContainer__detailsContainer"
          }
        >
          <div className="documentUpdateView__mainContainer__detailsContainer__show__text">
            <label className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
              Name
            </label>
            <TextField
              className={
                "documentUpdateView__mainContainer__detailsContainer__show__text__fixed"
              }
              type="text"
              value={fileData?.name ? fileData?.name : ""}
              fullWidth
              variant="outlined"
              placeholder="Name"
              name="name"
              onChange={handleChanges}
            />
          </div>
          <div className="documentUpdateView__mainContainer__detailsContainer__show__text">
            <label className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
              Description
            </label>
            <TextField
              className={
                "documentUpdateView__mainContainer__detailsContainer__show__text__fixed"
              }
              rows={4}
              rowsMax={4}
              type="text"
              value={fileData?.description ? fileData?.description : ""}
              fullWidth
              variant="outlined"
              placeholder="Description"
              name="description"
              multiline
              onChange={handleChanges}
            />
          </div>
          <div className="documentUpdateView__mainContainer__detailsContainer__show__text">
            <label className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
              Tags
            </label>
            <FormControl
              variant="outlined"
              className="documentUpdateView__mainContainer__detailsContainer__show__text__customListSelect"
            >
              <Select
                name="documentTagAssociations"
                className={`documentUpdateView__mainContainer__detailsContainer__show__text__customListSelect__fixed`}
                value={tagNames}
                labelId="demo-mutiple-name-label"
                id="demo-mutiple-name"
                multiple
                onChange={handleTagChange}
                renderValue={(selected: any) => selected.join(", ")}
                MenuProps={MenuProps}
              >
                {props.tags?.map((item: any) => (
                  <MenuItem key={item.id} value={item.name}>
                    <Checkbox
                      checked={tagNames?.indexOf(item.name) > -1}
                      color="primary"
                    />
                    <ListItemText primary={item.name} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          {fileData?.documentType.name === "image" && (
            <FormControlLabel
              className="documentUpdateView__mainContainer__detailsContainer__dashboardCheck"
              control={
                <Checkbox
                  checked={fileData?.viewOnDashboard}
                  onChange={(e: any, checked: boolean) =>
                    handleViewOnDashboardChange(e, checked)
                  }
                  name="viewOnDashboard"
                  color="primary"
                />
              }
              label="Add to Dashboard"
            />
          )}
          <div className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails">
            <div className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__upload">
              <span className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
                Uploaded Date
              </span>
              <span className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__text">
                {moment(fileData?.createdAt).format("DD MMM YYYY")}
              </span>
            </div>
            <div className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__upload">
              <span className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
                Uploaded By
              </span>
              <span className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__text">
                {fileData?.createdByUser.firstName +
                  " " +
                  fileData?.createdByUser.lastName}
              </span>
            </div>
          </div>
          <div className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails">
            <div className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__upload">
              <span className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
                Updated Date
              </span>
              <span className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__text">
                {moment(fileData?.updatedAt).format("DD MMM YYYY")}
              </span>
            </div>
            <div className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__upload">
              <span className="documentUpdateView__mainContainer__detailsContainer__show__text__label">
                Updated By
              </span>
              <span className="documentUpdateView__mainContainer__detailsContainer__show__uploadDetails__text">
                {fileData?.updatedByUser.firstName +
                  " " +
                  fileData?.updatedByUser.lastName}
              </span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  );
}

export default DocumentUpdateView;
