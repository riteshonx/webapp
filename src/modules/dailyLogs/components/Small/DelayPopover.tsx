import React, { useContext, useEffect, useReducer, useState } from "react";
import Popover from "@material-ui/core/Popover";
import Box from "@material-ui/core/Box";
import InputWithLabel from "./InputWithLabel";
import Button from "@material-ui/core/Button";
import DateFnsUtils from "@date-io/date-fns";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { MaterialUiPickersDate } from "@material-ui/pickers/typings/date";
import { gantt } from "dhtmlx-gantt";
import { FormControl, makeStyles, MenuItem, Select } from "@material-ui/core";
import { StatusValue } from "./StatusSelector";
import { DailyLogContext } from "../../DailyLogRouting";
import { CustomPopOver } from "src/modules/shared/utils/CustomPopOver";
import TextContent from "../Micro/TextContent";
import moment from "moment";
import GlobalKeyboardDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker";
import fetchDataReducer, { fetchInitState } from "src/modules/shared/reducer/fetchDataReducer";
import { getAssignedActivities } from "../../pages/AddDailyLog/requests";

interface DelayPopoverProps {
  previousStatus: StatusValue;
  show: boolean;
  anchorEl: Element | ((element: Element) => Element) | null | undefined;
  toStatus: StatusValue;
  onClickCancel: () => void;
  onClickUpdate: (val: any) => any;
  minDate?: string;
  plannedDuration: number;
  actualStartDate:any
}

export interface DelayPopOverInputState {
  varianceDelayReason: string;
  varianceDelayDescription: string;
  varianceComments: string;
  actualStartDate: string;
  actualEndDate: string;
  estimatedEndDate: string;
}

const useStyles = makeStyles((theme) => ({
  datepicker: {
    "& .MuiOutlinedInput-input": {
      padding: "8.5px 14px",
    },
    width: "22rem",
  },
  select: {
    "& .MuiOutlinedInput-input": {
      padding: "7px 14px",
    },
    width: "22rem",
  },
}));

const DelayPopover: React.VFC<DelayPopoverProps> = ({
  previousStatus,
  show,
  anchorEl,
  onClickCancel,
  onClickUpdate,
  toStatus,
  minDate,
  plannedDuration,
  actualStartDate
}) => {
  //setting defualt value for start date as today's date
  const todaysDate = moment(new Date()).format("MMM DD, YYYY");
  const currentDate = new Date();

  const  addWeekdays=(date:any, days:any)=> {
  date = moment(date); // clone
  //considering start date as part of duration
  days = days -1
  while (days > 0) {
    date = date.add(1, 'days');
    // decrease "days" only if it's a weekday.
    if (date.isoWeekday() !== 6 && date.isoWeekday() !== 7) {
      days -= 1;
    }
  }
  return date;
}

  const startDateMoment = actualStartDate? actualStartDate : todaysDate;
  const calculatedEstimatedEndDate = addWeekdays(startDateMoment, plannedDuration);
  const formattedEstimatedEndDate = calculatedEstimatedEndDate.format('MMM DD, YYYY');
  const [values, setValues] = useState({
    varianceDelayReason: "",
    varianceDelayDescription: "",
    varianceComments: "",
    actualStartDate:previousStatus !== "inProgressOnTrack" ? todaysDate : actualStartDate,
    actualEndDate: null,
    estimatedEndDate: toStatus == 'inProgressDelayed' ? formattedEstimatedEndDate : null,
  });
  const [isValid, setIsValid] = useState(false);
  const dateClasses = useStyles();
  const { state: dailylogState, dispatch: dailylogDispatch } =
    useContext(DailyLogContext);


  useEffect(() => {
    setIsValid(false);
    (() => {
      switch (toStatus) {
        case "inProgressDelayed": {
          if (
            values.varianceDelayReason.trim() &&
            values.varianceDelayDescription &&
            (values.actualStartDate ||
              previousStatus === "inProgressOnTrack") &&
            values.estimatedEndDate
          )
            setIsValid(true);
          break;
        }
        case "inProgressOnTrack": {
          if (values.actualStartDate) setIsValid(true);
          break;
        }
        default: {
          if (values.actualEndDate) setIsValid(true);
          break;
        }
      }
    })();
  }, [values]);

  const popOverclasses = CustomPopOver();

  const handleChange = (prop: keyof DelayPopOverInputState) => (event: any) => {
    setValues({ ...values, [prop]: event.target.value });
  };

  const handleUpdateValue = () => {
    onClickUpdate(values);
  };

  const shouldDisableNonWorkingDate = (day: MaterialUiPickersDate) => {
    return !gantt.isWorkTime(day);
  };


  interface DatePickerProps {
    label: string;
    property: keyof DelayPopOverInputState;
    minDate?: string | null;
    maxDate?: Date;
  }

  const DatePicker: React.FC<DatePickerProps> = ({
    label,
    property,
    minDate,
    maxDate = new Date(),
  }) => {
    const MINIMAL_DATE_ERROR_MSG = "Date should not be before minimal date";
    return (
      <MuiPickersUtilsProvider utils={DateFnsUtils}>
        <GlobalKeyboardDatePicker
          data-testid="status-delayed-date"
          className={dateClasses.datepicker}
          inputVariant="outlined"
          emptyLabel={label}
          value={values[property]}
          onChange={(e: any) => {
            setValues({
              ...values,
              [property]: moment(e).format("YYYY-MM-DD"),
            });
          }}
          format="dd MMM yyyy"
          name="date"
          KeyboardButtonProps={{
            "aria-label": "change date",
          }}
          onError={(e: any) => {
            if (e) {
              e === MINIMAL_DATE_ERROR_MSG
                ? setIsValid(false)
                : setIsValid(true);
            }
          }}
          minDate={minDate || "2000-01-01"}
          maxDate={maxDate}
          shouldDisableDate={shouldDisableNonWorkingDate}
        />
      </MuiPickersUtilsProvider>
    );
  };

  type DateTimePickerProps = {
    property: keyof DelayPopOverInputState;
    minDate?: string | null;
    maxDate?: Date;
  };

  const DateTimePickerWrapper: React.FC<DateTimePickerProps> = ({
    property,
    minDate,
    maxDate,
  }) => {
    return (
      <Box>
        <DatePicker
          label="Select date"
          property={property}
          minDate={minDate}
          maxDate={maxDate}
        />
      </Box>
    );
  };

  return (
    <Popover
      open={show}
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
    >
      <Box padding="1rem">
        {(() => {
          switch (toStatus) {
            case "inProgressDelayed":
              return (
                <>
                  <Box display="flex" justifyContent="space-between">
                    <FormControl variant="outlined">
                      <TextContent content={"Variance category"} />
                      <Select
                        value={values.varianceDelayDescription}
                        onChange={handleChange("varianceDelayDescription")}
                        fullWidth
                        displayEmpty
                        className={dateClasses.select}
                        MenuProps={{
                          classes: { paper: popOverclasses.root },
                          anchorOrigin: {
                            vertical: "bottom",
                            horizontal: "left",
                          },
                          transformOrigin: {
                            vertical: "top",
                            horizontal: "left",
                          },
                          getContentAnchorEl: null,
                        }}
                      >
                        <MenuItem className="mat-menu-item-sm" value="">
                          Select a category
                        </MenuItem>
                        {dailylogState?.customList?.map((type: any) => (
                          <MenuItem
                            className="mat-menu-item-sm"
                            key={type.id}
                            value={type.nodeName}
                          >
                            {type.nodeName}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Box>
                  <Box marginTop="0.5rem">
                    <InputWithLabel
                      label="Title"
                      value={values.varianceDelayReason}
                      onChange={handleChange("varianceDelayReason")}
                    />
                  </Box>
                  {previousStatus !== "inProgressOnTrack" && (
                    <Box marginTop="1rem">
                      <TextContent content={"Start Date"} />
                      <DateTimePickerWrapper property="actualStartDate" />
                    </Box>
                  )}
                  <Box marginTop="1rem">
                    <TextContent content={"Estimated End Date"} />
                    <DateTimePickerWrapper
                      property="estimatedEndDate"
                      minDate={minDate || values.actualStartDate}
                      maxDate={new Date("2050")} //eow maybe? :D
                    />
                  </Box>
                </>
              );

            case "inProgressOnTrack":
              return (
                <Box marginTop="1rem">
                  <TextContent content={"Start Date"} />
                  <DateTimePickerWrapper property="actualStartDate" />
                </Box>
              );

            case "completed":
              return (
                <Box marginTop="1rem">
                  <TextContent content={"End Date"} />
                  <DatePicker
                    label="Select date"
                    property="actualEndDate"
                    minDate={minDate}
                  />
                </Box>
              );
          }
        })()}
        <Box display="flex" justifyContent="space-between" marginTop="2rem">
          <Button variant="outlined" onClick={onClickCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleUpdateValue}
            variant="contained"
            className="btn-primary"
            disabled={!isValid}
          >
            Update
          </Button>
        </Box>
      </Box>
    </Popover>
  );
};

export default DelayPopover;
