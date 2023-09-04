import React, {
  useEffect,
  useRef,
  useState,
  useContext,
  useCallback,
} from "react";
import moment from "moment";
import { createStyles, makeStyles } from "@material-ui/core/styles";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { FormControl, InputLabel } from "@material-ui/core";
import DelayPopover, { DelayPopOverInputState } from "./DelayPopover";
import {
  updateActivityStatus,
  updateActivityStatusCompleted,
} from "../../common/requests";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { setIsLoading } from "src/modules/root/context/authentication/action";
import { setRefreshAssignedActivities } from "../../actions";
import Notification, {
  AlertTypes,
} from "src/modules/shared/components/Toaster/Toaster";
import { AddDailyLogContext } from "../../pages/AddDailyLog/AddDailyLog";
import Box from "@material-ui/core/Box";

export type StatusValue =
  | "readyToStart"
  | "notStarted"
  | "inProgressDelayed"
  | "inProgressOnTrack"
  | "completed"
  | "showError";

type menuItemsType = {
  [key in StatusValue]: {
    id: number;
    value: StatusValue;
    displayValue: string;
    background: string;
  };
};

type ListMenuItemsType = {
  [key in StatusValue]: string;
};

const menuItems: menuItemsType = {
  readyToStart: {
    id: 1,
    value: "readyToStart",
    displayValue: "Ready To Start",
    background: "#c4c4c4",
  },
  notStarted: {
    id: 2,
    value: "notStarted",
    displayValue: "Not Started",
    background: "#000",
  },
  inProgressDelayed: {
    id: 3,
    value: "inProgressDelayed",
    displayValue: "In Progress Delayed",
    background: "#ef7753",
  },
  inProgressOnTrack: {
    id: 4,
    value: "inProgressOnTrack",
    displayValue: "In Progress On Track",
    background: "#efc768",
  },
  completed: {
    id: 5,
    value: "completed",
    displayValue: "Completed",
    background: "#6ba366",
  },
  showError: {
    id: 6,
    value: "showError",
    displayValue: "ERROR",
    background: "#cc4444",
  },
};

const selectedStatusValue: ListMenuItemsType = {
  notStarted: "NOT_STARTED",
  readyToStart: "READY_TO_START",
  inProgressDelayed: "IN_PROGRESS_DELAYED",
  inProgressOnTrack: "IN_PROGRESS_ON_TRACK",
  completed: "COMPLETED",
  showError: "ERROR",
};

const useStyles = makeStyles(() =>
  createStyles({
    root: {
      fontWeight: "bold",
      "&:hover": {
        borderBottom: "none !important",
      },
      "&.MuiOutlinedInput-input": {
        padding: "8px 20px",
      },
    },
    list: {
      padding: 0,
    },

    label: {
      fontSize: "1.3rem",
      background: "white",
      padding: "0 8px",
      fontWeight: 500,
      color: "#606060",
    },

    formControl: {
      width: "215px",
      "& .MuiInput-root": {
        borderRadius: "6px",
      },
      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
        borderBottom: "none",
      },
      "& .MuiInput-underline:before": {
        borderBottom: "none",
      },
      "& .MuiInput-underline:after": {
        borderBottom: "none",
      },
      "& svg": {
        width: "4rem",
      },
    },
  })
);

export interface StatusSelectorProps {
  disabled?: boolean;
  initValue: StatusValue;
  taskId: string;
  actualStartDate?: string;
  updateNeeded?: boolean;
  updatedAt?: string;
  createdAt?: string;
  plannedDuration: number;
}

const StatusSelector: React.VFC<StatusSelectorProps> = ({
  disabled = false,
  initValue,
  taskId,
  actualStartDate,
  updatedAt,
  updateNeeded = false,
  createdAt,
  plannedDuration
}) => {
  const [status, setStatus] = useState<StatusValue>(initValue);
  const [anchorEl, setAnchorEl] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const classes = useStyles();
  const selectRef = useRef(null);
  const { dispatchAddDailyLog } = useContext(AddDailyLogContext);
  const { dispatch }: any = useContext(stateContext);
  const [showUpdateRequired, setShowUpdateRequired] = useState(true);
  const updatedDate = updatedAt ? moment(updatedAt).format("MMM DD, YYYY") : undefined;
  const today = moment(new Date()).format("MMM DD, YYYY");
  useEffect(() => {

    if (initValue == "notStarted" && updatedAt == undefined) {
      setShowUpdateRequired(true)
    }
    else {
      if (updatedDate && updatedDate !== today) {
        setShowUpdateRequired(false)
      }
    }
  }, [updatedAt, initValue, today])

  useEffect(() => {
    setAnchorEl(selectRef.current);
  }, []);

  const handlePopoverClickCancel = () => {
    setShowPopup(false);
    setStatus(initValue);
  };

  const updateStatusForDailyLogs = useCallback(
    async (value: StatusValue, values?: DelayPopOverInputState) => {
      dispatch(setIsLoading(true));
      try {
        if (value == "completed") {
          await updateActivityStatusCompleted(
            taskId,
            selectedStatusValue[value],
            values?.varianceDelayDescription,
            values?.varianceDelayReason.trim(),
            values?.actualEndDate,
            actualStartDate,
            moment(createdAt).format("YYYY-MMM-DD")
          );
        } else {
          await updateActivityStatus(
            taskId,
            selectedStatusValue[value],
            values?.varianceDelayDescription,
            values?.varianceDelayReason.trim(),
            values?.actualStartDate,
            values?.estimatedEndDate,
            moment(createdAt).format("YYYY-MMM-DD")
          );
        }
        Notification.sendNotification(
          "Dailylog status updated successfully",
          AlertTypes.success
        );
        dispatchAddDailyLog(setRefreshAssignedActivities(true));
        dispatch(setIsLoading(false));
      } catch (error) {
        console.log(error);
        dispatch(setIsLoading(false));
      }
    },
    [taskId, actualStartDate]
  );

  const handlePopoverClickUpdate = (values: DelayPopOverInputState) => {
    updateStatusForDailyLogs(status, values);
    setShowPopup(false);
  };

  const handleChange = (event: any) => {
    const value = event.target.value as StatusValue;
    setStatus(value);
    if (
      value === "inProgressDelayed" ||
      (value === "inProgressOnTrack" && initValue !== "inProgressDelayed") ||
      value === "completed"
    ) {
      setShowPopup(true);
    } else {
      setShowPopup(false);
      updateStatusForDailyLogs(value);
    }
  };

  const handleSelectClick = (event: any) => {
    if (disabled) return;
    const displayValue = event.target.innerText;
    if (displayValue) {
      const { value }: any = Object.values(menuItems).find(
        (val) => val.displayValue === displayValue
      );
      if (value === status) {
        handleChange({ target: { value } });
      }
    }
  };

  let shouldShowIcon = {};

  if (disabled) {
    shouldShowIcon = {
      IconComponent: () => null,
    };
  }


  return (
    <FormControl
      variant="outlined"
      classes={{ root: classes.formControl }}
      disabled={disabled}
    >
      {!disabled && (
        <InputLabel classes={{ root: classes.label }}>
          {showUpdateRequired ? "Update today's status " : "Update status"}
        </InputLabel>
      )}
      <Select
        ref={selectRef}
        classes={{ root: classes.root }}
        value={status}
        onClick={handleSelectClick}
        onChange={handleChange}
        {...shouldShowIcon}
        MenuProps={{
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          classes: {
            list: classes.list,
          },
          getContentAnchorEl: null,
        }}
      >
        {Object.keys(menuItems).map((key: string) => {
          if (key === "showError" || key === "readyToStart") return;
          if (initValue === "notStarted" && key === "completed") {
            return;
          }
          return (
            <MenuItem
              key={key}
              id={menuItems[key as StatusValue].value}
              // style={{
              //   background: menuItems[key as StatusValue].background,
              //   color: "#fff",
              // }}
              value={menuItems[key as StatusValue].value}
            >
              <Box display="flex" alignItems="center">
                <Box
                  width="10px"
                  height="10px"
                  bgcolor={menuItems[key as StatusValue].background}
                />
                <Box marginLeft="1rem">
                  {menuItems[key as StatusValue].displayValue}
                </Box>
              </Box>
            </MenuItem>
          );
        })}
      </Select>
      {showPopup && (
        <DelayPopover
          previousStatus={initValue}
          show={showPopup}
          anchorEl={anchorEl}
          onClickCancel={handlePopoverClickCancel}
          onClickUpdate={(values: DelayPopOverInputState) =>
            handlePopoverClickUpdate(values)
          }
          toStatus={status}
          minDate={actualStartDate}
          plannedDuration={plannedDuration}
          actualStartDate= {actualStartDate}
        />
      )}
    </FormControl>
  );
};

export default StatusSelector;
