import React, { ReactElement, useContext, useEffect, useState } from "react";
// import { projectContext } from '../../Context/projectContext';
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import { KeyboardDatePicker } from "@material-ui/pickers";
import DateFnsUtils from "@date-io/date-fns";
import { IconButton, InputLabel } from "@material-ui/core";
import "./SpecificationFilterDateRange.scss";
// import { setFilterData, setFilterOptions } from '../../Context/projectActions';
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import { SpecificationLibDetailsContext } from "../../context/SpecificationLibDetailsContext";
import { setSelectedSpecFilterData } from "../../context/SpecificationLibDetailsAction";
import moment from "moment";
import GlobalKeyboardDatePicker from "src/modules/shared/components/GlobalDatePicker/GlobalKeyboardDatePicker";

export default function SpecificationFilterDateRange(props: any): ReactElement {
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setendDate] = useState<any>(null);
  const [isEdit, setIsEdit] = useState(false);
  const [startMinDate, setstartMinDate] = useState(
    new Date(new Date().getFullYear() - 2, 11, 31)
  );
  const [startMaxDate, setstartMaxDate] = useState(new Date());
  const [endMinDate, setendMinDate] = useState(new Date());
  const [endMaxDate, setendMaxDate] = useState(
    new Date(new Date().getFullYear() + 2, 11, 31)
  );
  const { SpecificationLibDetailsState, SpecificationLibDetailsDispatch }: any =
    useContext(SpecificationLibDetailsContext);

  useEffect(() => {
    if (endDate) {
      setstartMaxDate(endDate);
    } else {
      setstartMaxDate(new Date());
    }
    if (startDate) {
      setendMinDate(new Date(startDate));
    } else {
      setendMinDate(new Date());
    }
  }, [startDate, endDate]);

  useEffect(() => {
    if (props?.clearData > 0) {
      setStartDate(null);
      setendDate(null);
    }
  }, [props?.clearData]);

  const onStartDateChangeHandler = (date: any) => {
    setStartDate(date);
    if (!date) {
      endDateChangeHandler(null, true);
    } else {
      validateDateRange(date, endDate);
    }
  };

  const endDateChangeHandler = (date: any, isClear: boolean) => {
    setendDate(date);
    if (isClear) {
      validateDateRange(null, date);
    } else {
      validateDateRange(startDate, date);
    }
  };

  const openView = () => {
    setIsEdit(true);
  };

  const hideView = () => {
    setIsEdit(false);
  };

  const clearValues = () => {
    onStartDateChangeHandler(null);
  };

  const validateDateRange = async (sDate: any, eDate: any) => {
    const startZDate = dateConversion(sDate, "start");
    const endZDate = dateConversion(eDate, "end");

    if (sDate && eDate && sDate > eDate) {
      endDateChangeHandler(null, false);
    } else {
      SpecificationLibDetailsDispatch(
        setSelectedSpecFilterData({
          ...SpecificationLibDetailsState.selectedSpecilterData,
          versionStartDate: startZDate,
          versionEndDate: endZDate,
        })
      );
    }
  };

  const dateConversion = (date: any, dateType: string) => {
    let momentUtc: any;
    const momentDate = date ? moment(date).format("DD-MMM-YYYY") : null;

    if (dateType === "end") {
      momentUtc = momentDate
        ? moment(momentDate)
            .add(86399, "seconds")
            .format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        : null;
    } else {
      momentUtc = momentDate
        ? moment(momentDate).format("YYYY-MM-DDTHH:mm:ss.SSS[Z]")
        : null;
    }

    const converedDate =
      momentUtc && momentUtc !== "Invalid date" ? momentUtc : null;
    return converedDate;
  };

  return (
    <div className="SpecificationFilterDateRange">
      <div className="SpecificationFilterDateRange__header">
        <div
          className={`${
            isEdit
              ? "SpecificationFilterDateRange__header__name"
              : "SpecificationFilterDateRange__header__active"
          }`}
        >
          {"Version Date"}{" "}
        </div>
        <div className="SpecificationFilterDateRange__header__action ">
          {isEdit ? (
            <div
              className="SpecificationFilterDateRange__header__action__clear"
              onClick={clearValues}
            >
              Clear
            </div>
          ) : (
            ""
          )}
          {!isEdit ? (
            <IconButton onClick={openView}>
              <AddIcon />
            </IconButton>
          ) : (
            <IconButton onClick={hideView}>
              <RemoveIcon />
            </IconButton>
          )}
        </div>
      </div>
      {isEdit && (
        <div className="SpecificationFilterDateRange__body">
          <div className="SpecificationFilterDateRange__body__input">
            <InputLabel required={true}> From </InputLabel>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <GlobalKeyboardDatePicker
                data-testid="startDate"
                inputVariant="outlined"
                clearable={true}
                value={startDate}
                onChange={(d: any) => {
                  onStartDateChangeHandler(d);
                }}
                format="dd-MMM-yyyy"
                name="startDate"
                placeholder="DD-MMM-YYYY"
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                disabled={true}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="SpecificationFilterDateRange__body__input">
            <InputLabel required={true}> To </InputLabel>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <GlobalKeyboardDatePicker
                data-testid="endDate"
                inputVariant="outlined"
                clearable={true}
                value={endDate}
                onChange={(d: any) => {
                  endDateChangeHandler(d, false);
                }}
                format="dd-MMM-yyyy"
                name="endDate"
                placeholder="DD/MMM/YYYY"
                KeyboardButtonProps={{
                  "aria-label": "change date",
                }}
                minDate={endMinDate}
                // maxDate={endMaxDate}
                // disabled={!startDate}
                disabled={true}
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>
      )}
    </div>
  );
}
