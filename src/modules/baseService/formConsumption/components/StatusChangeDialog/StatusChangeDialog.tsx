import { ChangeEvent, useState, FC, useContext, useEffect } from "react";
import { ControlBarPropsType } from "../UpdateFormWoWf/ControlBar";
import {
  Box,
  Button,
  Typography,
  IconButton,
  TextareaAutosize,
} from "@material-ui/core";
import { Dialog, DialogContent, DialogActions } from "@material-ui/core";
import { match, useRouteMatch } from "react-router-dom";
import CloseIcon from "@material-ui/icons/HighlightOff";
import PlayIcon from "@material-ui/icons/PlayArrow";
import "./StatusChangeDialog.scss";
import StatusChange from "../StatusChange/StatusChange";
import { EditViewFormParams } from "../../models/form";
import DateFnsUtils from "@date-io/date-fns";
import AssigneeSelect from "src/modules/shared/components/UserSelect/UserSelect";
import moment from "moment";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import GlobalKeyboardDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker";
import { makeStyles } from "@material-ui/core/styles";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import InfoIcon from "@material-ui/icons/InfoOutlined";
import ProjectUserDetails from "src/modules/shared/components/ProjectUserDetails/ProjectUserDetails";

const today = moment().format("YYYY-MM-DD");
const DARK_GREEN = "#171d25";

const useStyles = makeStyles(() => ({
  dueDate: {
    width: "135px",
    marginLeft: "1rem",
    "& .MuiOutlinedInput-input": {
      padding: "0.7rem",
      "&:hover": {
        cursor: "pointer",
      },
    },
    "& .MuiIconButton-root": {
      padding: "0",
      "& .MuiSvgIcon-root": {
        fontSize: "1.6rem",
        fill: `${DARK_GREEN}`,
      },
      "&.Mui-disabled": {
        "& .MuiSvgIcon-root": {
          fontSize: "1.6rem",
          fill: "#00000042",
        },
      },
    },

    "& .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${DARK_GREEN}`,
    },
    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
      border: `1px solid ${DARK_GREEN}`,
    },
  },
  disclaimer: {
    fontSize: "1rem",
    fontStyle: "italic",
    marginLeft: "0.5rem",
    "& span": {
      background: "#e1e1e1",
      padding: "0 0.4rem",
      borderRadius: "3px",
      fontWeight: "bold",
      fontStyle: "normal",
    },
  },
}));

interface StatusChangeDialogProps extends ControlBarPropsType {
  open: boolean;
  newStatus: string;
  comment: string;
  onCommentChange: (e: ChangeEvent<any>) => void;
  onClickClose: () => void;
  onClickOk: (p: any) => void;
}

const StatusChangeDialog: FC<StatusChangeDialogProps> = ({
  open,
  status,
  comment,
  newStatus,
  statusListOptions,
  assignees,
  dueDate,
  onCommentChange,
  onClickClose,
  onClickOk,
}) => {
  const optsWithoutSelectedStatus = statusListOptions.filter(
    (o) => o.status !== status
  );
  const classes = useStyles();
  const [selectedNewStatus, setSelectedNewStatus] = useState(newStatus);
  const [selectedNewAssignees, setSelectedNewAssignees] = useState(assignees);
  const [selectedNewDueDate, setSelectedNewDueDate] = useState({
    open: false,
    dueDate,
  });
  const [isSelectedStatusClosedType, setSelectedStatusClosedType] =
    useState(false);
  const { state, dispatch }: any = useContext(stateContext);

  const pathMatch: match<EditViewFormParams> = useRouteMatch();

  useEffect(() => {
    const selectedStatus = statusListOptions.find(
      (o) => o.status === selectedNewStatus
    );
    if (!selectedStatus?.openStatus) setSelectedStatusClosedType(true);
    else setSelectedStatusClosedType(false);
  }, [selectedNewStatus]);

  const handleNewAssigneeSave = (e: any) => {
    setSelectedNewAssignees(e);
  };

  const handleNewStatusChange = (e: ChangeEvent<any>) => {
    setSelectedNewStatus(e.target.value);
  };

  const hanldeDialogOnClickOk = () => {
    const updatedFields = {
      dueDate: selectedNewDueDate.dueDate,
      assignees: selectedNewAssignees,
      status: selectedNewStatus,
      comment,
    };
    onClickOk(updatedFields);
  };

  const handleNewDueDateChange = (newDueDate: string) => {
    setSelectedNewDueDate((p) => {
      return { ...p, dueDate: newDueDate };
    });
  };

  return (
    <Dialog open={open} fullWidth className="statusChangeDialog">
      <Box
        display="flex"
        bgcolor="var(--onx-text-black)"
        justifyContent="space-between"
        alignItems="center"
      >
        <Box color="#fff" paddingLeft="2.2rem">
          Status Change
        </Box>
        <IconButton style={{ marginRight: "1rem" }} onClick={onClickClose}>
          <CloseIcon style={{ color: "#fff" }} />
        </IconButton>
      </Box>
      <DialogContent style={{ paddingBottom: "2rem" }}>
        <Box className="statusChangeDialog_controlBar">
          <Typography
            variant="h3"
            className="statusChangeDialog_controlBar_oldStatus"
          >
            {status}
          </Typography>
          <PlayIcon />
          <Box marginLeft="1rem">
            <StatusChange
              status={selectedNewStatus}
              statusOptions={optsWithoutSelectedStatus}
              handleStatusChange={handleNewStatusChange}
            />
          </Box>
          <Typography
            variant="h5"
            className="statusChangeDialog_controlBar_label"
          >
            Assignee:
          </Typography>
          <Box>
            {isSelectedStatusClosedType ? (
              <ProjectUserDetails users={selectedNewAssignees} />
            ) : (
              <AssigneeSelect
                save={handleNewAssigneeSave}
                featureId={Number(pathMatch.params.featureId)}
                users={selectedNewAssignees}
              />
            )}
          </Box>
          {/* <Typography
            variant="h5"
            className="statusChangeDialog_controlBar_label"
          >
            Due Date:
          </Typography> 
          <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <GlobalKeyboardDatePicker
              className={classes.dueDate}
              data-testid="status-delayed-date"
              inputVariant="outlined"
              value={selectedNewDueDate.dueDate}
              InputProps={{
                onClick: () =>
                  setSelectedNewDueDate((p) => {
                    return { ...p, open: true };
                  }),
                placeholder: "Select date",
                readOnly: true,
              }}
              onChange={(e: any) => {
                handleNewDueDateChange?.(moment(e).format("YYYY-MM-DD"));
              }}
              format="dd MMM, yyyy"
              name="date"
              minDate={today}
              maxDate={"2099-01-01"}
              open={selectedNewDueDate.open}
              onClose={() =>
                setSelectedNewDueDate((p) => {
                  return { ...p, open: false };
                })
              }
              error={false}
              helperText={null}
            />
          </MuiPickersUtilsProvider> */}
        </Box>

        <Box margin="12px 0">
          <TextareaAutosize
            value={comment}
            onChange={onCommentChange}
            rowsMax={4}
            placeholder="Please enter your comments"
            className="statusChangeDialog_comment"
          />
        </Box>
        <Box display="flex" alignItems="center">
          <InfoIcon style={{ color: "grey", fontSize: "2rem" }} />
          <Typography variant="h5" classes={{ h5: classes.disclaimer }}>
            Click on the &nbsp;<span>Update</span>&nbsp;button in the following
            screen for these changes to reflect.
          </Typography>
        </Box>
        <DialogActions>
          <Button
            className="statusChangeDialog_actions_btn"
            variant="outlined"
            onClick={onClickClose}
          >
            Cancel
          </Button>
          <Button
            className="statusChangeDialog_actions_btn statusChangeDialog_actions_btn_update"
            onClick={hanldeDialogOnClickOk}
          >
            Ok
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export default StatusChangeDialog;
