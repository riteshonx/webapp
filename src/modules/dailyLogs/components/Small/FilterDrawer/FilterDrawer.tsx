import React, { useContext, useState } from "react";
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormLabel,
  makeStyles,
} from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ExpansionPanel from "../../Large/ExpansionPanel/ExpansionPanel";
import DatePickerExpansion from "../../Large/DatePickerExpansion/DatePickerExpansion";
import { FilterListType } from "../../../reducer/DailyLogReducer";
import { DailyLogContext } from "../../../DailyLogRouting";
import "./FilterDrawer.scss";
import { setListViewFilters } from "../../../actions";
import moment from "moment";

const useStyles = makeStyles({
  label: {
    display: "block",
    fontSize: "1rem",
  },
});

interface FilterDrawerProps {
  filterList: FilterListType;
  expand: boolean;
  onClickExpand: () => void;
  isVisible: boolean;
}

export interface Filter {
  name: string;
  type: string;
  value: any;
}

const FilterDrawer: React.VFC<FilterDrawerProps> = ({
  filterList,
  expand,
  onClickExpand,
  isVisible,
}: any) => {
  const classes = useStyles();
  const { dispatch } = useContext(DailyLogContext);

  function updateFilter(
    groupName: string,
    filterName: string,
    filterType: string,
    value: any
  ) {
    if (filterType === "date") {
      let date = moment(value).format("YYYY-MM-DD");
      if (value === null) {
        date = "";
      }
      dispatch(
        setListViewFilters(groupName, [
          {
            name: filterName,
            type: filterType,
            value: date,
          },
        ])
      );
    }
    if (filterType === "checkbox") {
      const currentOptions: any = filterList[groupName].options;
      const toUpdate = currentOptions.find(
        (option: any) => option.name === filterName
      );
      toUpdate.value = !value;
      dispatch(setListViewFilters(groupName, [...currentOptions]));
    }
  }

  if (!isVisible) return null;
  return (
    <div
      className={`dailyLog-filter__container ${expand ? "expand" : "close"}`}
    >
      <div className="dailyLog-filter__left">
        <span className="dailyLog-filter__left__title">Filters</span>
        <div className="dailyLog-filter__left__arrow" onClick={onClickExpand}>
          {expand ? (
            <ChevronRightIcon className="dailyLog-filter__left__arrow__icon" />
          ) : (
            <ChevronLeftIcon className="dailyLog-filter__left__arrow__icon" />
          )}
        </div>
      </div>
      <div className="dailyLog-filter__right">
        <div className="dailyLog-filter__right__header">
          <div className="dailyLog-filter__right__header__title">Filters</div>
        </div>
        <div className="dailyLog-filter__right__filters">
          {Object.entries(filterList).map(
            ([key, value]: any, filterGroupIndex: number) => (
              <ExpansionPanel
                key={`filterGroup-${filterGroupIndex}`}
                title={key}
                open={Boolean(value.options.find((item: any) => item.value))}
                slot={value.options.map((filter: Filter, index: number) =>
                  key === "User" ? (
                    <FormControlLabel
                      key={`${filter.name}-${filter.type}-${filter.value}`}
                      control={
                        <Checkbox
                          checked={filter.value as boolean}
                          onChange={() =>
                            updateFilter(
                              key,
                              filter.name,
                              filter.type,
                              filter.value
                            )
                          }
                        />
                      }
                      label={filter.name}
                    />
                  ) : (
                    <Box key={`${filter.name}-${filter.type}-${filter.value}`}>
                      <FormLabel classes={{ root: classes.label }}>
                        {filter.name}
                      </FormLabel>
                      <DatePickerExpansion
                        filterDate={
                          filterList["Date"].options[0]?.value || null
                        }
                        handleFilterDate={(e: any) => {
                          updateFilter("Date", "Created On", "date", e);
                        }}
                      />
                    </Box>
                  )
                )}
              />
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterDrawer;
