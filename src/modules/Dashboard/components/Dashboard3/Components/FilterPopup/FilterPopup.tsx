import { IconButton, makeStyles, Menu, TextField } from "@material-ui/core";
import { Autocomplete } from "@material-ui/lab";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import React, { ReactElement, useEffect, useState } from "react";
import GlobalDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalDatePicker";
import "./FilterPopup.scss";
import InsertInvitationIcon from "@material-ui/icons/InsertInvitation";
import moment from "moment";

const useStyles = makeStyles(() => ({
  paper: {
    borderRadius: "3rem",
    minHeight: "30rem",
    width: "40rem",
    padding: "2rem",
  },
}));

const DASHBOARD_URL: any = `${process.env["REACT_APP_DASHBOARD_URL"]}`;

interface FilterPopup {
  open: any;
  handleClose: any;
  projectUsers: any;
  activityFilters: any;
  handleFilterClick: any;
  isActiveTab: boolean;
}

const FilterPopup = ({
  open,
  handleClose,
  projectUsers,
  activityFilters,
  handleFilterClick,
  isActiveTab,
}: FilterPopup): ReactElement => {
  const classes: any = useStyles();
  const [dateOpen, setDateOpen] = useState(false);
  const [localFilterData, setLocalFilterData]: any = useState({
    assignedTo: "",
    createdBy: "",
    createdDate: null,
  });

  useEffect(() => {
    setLocalFilterData(activityFilters);
  }, [activityFilters]);

  const handleDateChange = (val: any) => {
    setLocalFilterData({
      ...localFilterData,
      createdDate: moment(val)?.format("DD-MMM-YYYY"),
    });
  };

  return (
    <Menu
      id="filter-menu"
      anchorEl={open}
      open={Boolean(open)}
      onClose={handleClose}
      getContentAnchorEl={null}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "center",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "center",
      }}
      className={"filterPopup-main"}
      classes={{
        paper: classes.paper,
      }}
    >
      {projectUsers?.length > 0 ? (
        <span>
          <div className={"filterPopup-main__filterFieldsContainer"}>
            <span className="filterPopup-main__headText">Assigned To:</span>
            <Autocomplete
              id="assigned-to"
              options={projectUsers}
              value={
                projectUsers?.find(
                  (item: any) => item?.id === localFilterData?.assignedTo
                ) || projectUsers[0]
              }
              onChange={(e: any, newValue: any) => {
                setLocalFilterData({
                  ...localFilterData,
                  assignedTo: newValue?.id,
                });
              }}
              getOptionLabel={(option: any) => option.name || ""}
              getOptionSelected={(option: any, value: any) =>
                option?.id === value?.id
              }
              className={"filterPopup-main__autoCompleteWidth"}
              renderInput={(params: any) => (
                <TextField {...params} variant="outlined" />
              )}
              disableClearable
            />
          </div>
          <div className={"filterPopup-main__filterFieldsContainer"}>
            <span className="filterPopup-main__headText">Created By:</span>
            <Autocomplete
              id="created-by"
              options={projectUsers}
              value={
                projectUsers?.find(
                  (item: any) => item?.id === localFilterData?.createdBy
                ) || projectUsers[0]
              }
              onChange={(e: any, newValue: any) => {
                setLocalFilterData({
                  ...localFilterData,
                  createdBy: newValue?.id,
                });
              }}
              getOptionLabel={(option: any) => option.name || ""}
              getOptionSelected={(option: any, value: any) =>
                option?.id === value?.id
              }
              className={"filterPopup-main__autoCompleteWidth"}
              renderInput={(params) => (
                <TextField {...params} variant="outlined" />
              )}
              disableClearable
            />
          </div>
          <div className="filterPopup-main__createdDateContainer">
            <span className="filterPopup-main__headText">Date Created:</span>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <div className="filterPopup-main__date-picker">
                <GlobalDatePicker
                  id="created-at"
                  clearable={true}
                  value={localFilterData?.createdDate || null}
                  inputVariant={"outlined"}
                  fullWidth
                  popperprops={{
                    placement: "bottom-end",
                  }}
                  emptyLabel="DD-MMM-YYYY"
                  format="dd-MMM-yyyy"
                  open={dateOpen}
                  onClose={() => setDateOpen(false)}
                  onChange={(val: any) => {
                    handleDateChange(val);
                  }}
                />
                <IconButton
                  aria-label="delete"
                  className="calendar-icon"
                  onClick={() => setDateOpen(true)}
                >
                  <InsertInvitationIcon />
                </IconButton>
              </div>
            </MuiPickersUtilsProvider>
          </div>
          <div className="filterPopup-main__buttonContainer">
            {(localFilterData?.assignedTo ||
              localFilterData?.createdBy ||
              localFilterData?.createdDate) && (
              <span
                className="filterPopup-main__buttonContainer__clearButton"
                onClick={() => {
                  setLocalFilterData({
                    assignedTo: "",
                    createdBy: "",
                    createdDate: null,
                  });
                  handleFilterClick(
                    isActiveTab
                      ? `${DASHBOARD_URL}dashboard/v1/getAllInProgressActivities`
                      : `${DASHBOARD_URL}dashboard/v1/getAllInProgressForms`,
                    "clearFilter"
                  );
                  handleClose();
                }}
              >
                Clear Filter
              </span>
            )}
            <span
              className="filterPopup-main__buttonContainer__applyButton"
              onClick={() => {
                handleFilterClick(localFilterData);
                handleClose();
              }}
            >
              Apply
            </span>
          </div>
        </span>
      ) : (
        <div>loading...</div>
      )}
    </Menu>
  );
};

export default FilterPopup;
