import React, { ReactElement, useContext, useEffect, useState } from "react";
import { DatePicker, MuiPickersUtilsProvider } from "@material-ui/pickers";
import { Button, IconButton, InputLabel } from "@material-ui/core";
import "./FilterDateRange.scss";
import AddIcon from "@material-ui/icons/Add";
import RemoveIcon from "@material-ui/icons/Remove";
import MomentUtils from "@date-io/moment";
import moment from "moment";
import "moment-timezone";
import GlobalDatePicker from "../../../../shared/components/GlobalDatePicker/GlobalDatePicker";

function FilterDateRangeModal(props: any): ReactElement {
  const {
    field,
    index,
    isEdit,
    openView,
    hideView,
    onStartDateChangeHandler,
    endDateChangeHandler,
    clearValues,
    startDate,
    endDate,
    startMaxDate,
    endMaxDate,
    hasStartDate
  } = props;

  return (
    <div className="FilterDateRange">
      <div className="FilterDateRange__header">
        <div
          className={`${
            isEdit
              ? "FilterDateRange__header__name"
              : "FilterDateRange__header__active"
          }`}
        >
          {field.caption}{" "}
        </div>
        <div className="FilterDateRange__header__action">
          {isEdit ? (
            <Button
              size="small"
              className="FilterDateRange__header__action__clear"
              onClick={clearValues}
            >
              Clear
            </Button>
          ) : (
            ""
          )}
          {!field.isOpen ? (
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
      {field.isOpen && (
        <div className="FilterDateRange__body">
          <div className="FilterDateRange__body__input">
            <InputLabel required={true}> From </InputLabel>
            <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
              <GlobalDatePicker
                data-testid="startDate"
                inputVariant="outlined"
                value={startDate}
                onChange={(d: any) => {
                  onStartDateChangeHandler(d);
                }}
                format="DD-MMM-yyyy"
                name="startDate"
                placeholder="Pick a date"
                maxDate={startMaxDate?startMaxDate:undefined}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="FilterDateRange__body__input">
            <InputLabel required={true}> To </InputLabel>
            <MuiPickersUtilsProvider libInstance={moment} utils={MomentUtils}>
              <GlobalDatePicker
                data-testid="endDate"
                inputVariant="outlined"
                disabled={!hasStartDate}
                value={endDate}
                onChange={(d: any) => {
                  endDateChangeHandler(d);
                }}
                format="DD-MMM-yyyy"
                name="endDate"
                placeholder="Pick a date"
                minDate={startDate ? startDate : new Date()}
                minDateMessage="To date must be greater than From date"
                maxDate={endMaxDate?endMaxDate:undefined}
              />
            </MuiPickersUtilsProvider>
          </div>
        </div>
      )}
    </div>
  );
}

export default FilterDateRangeModal;
