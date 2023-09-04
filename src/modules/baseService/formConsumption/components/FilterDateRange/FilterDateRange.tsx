import React, { ReactElement, useContext, useEffect, useState } from "react";
import { projectContext } from "../../Context/projectContext";
import "./FilterDateRange.scss";
import { setFilterData, setFilterOptions } from "../../Context/projectActions";
import "moment-timezone";
import FilterDateRangeModal from "./FilterDateRangeModal";

interface Props {
  field: any;
  index: number;
}

function FilterDateRange({ field, index }: Props): ReactElement {
  const [startDate, setStartDate] = useState<any>(null);
  const [endDate, setEndDate] = useState<any>(null);
  const { projectState, projectDispatch }: any = useContext(projectContext);
  const [isEdit, setIsEdit] = useState(false);
  const [hasStartDate, setHasStartDate] = useState(false);

  useEffect(() => {
    const filterData = [...projectState.filterData];
    const currentField = filterData.filter(
      (item) => item.elementId === field.elementId
    );
    if (currentField.length > 0) {
      const currentIndex = filterData.indexOf(currentField[0]);
      setStartDate(filterData[currentIndex].startDate || null);
      setEndDate(filterData[currentIndex].endDate || null);
      setIsEdit(filterData[currentIndex].isEdited || false);
    } else {
      const value = {
        elementId: field.elementId,
        startDate: null,
        endDate: null,
        fieldTypeId: field.fieldTypeId,
        caption: field.caption,
        isEdited: false,
      };
      filterData.push(value);
      setIsEdit(false);
      projectDispatch(setFilterData(filterData));
    }
  }, [projectState.filterData]);

  const onStartDateChangeHandler = (date: any) => {
    const filterData = [...projectState.filterData];
    const currentItem = filterData.filter(
      (item) => item.elementId === field.elementId
    );
    setHasStartDate(true);
    if (endDate) {
      if (new Date(date).getDate() > new Date(endDate).getDate()) {
        date = startDate;
      } else if (new Date(date) > new Date(endDate)) {
        setStartDate(date);
        return;
      }
      if (currentItem.length > 0) {
        const value = { ...currentItem[0], startDate: date, isEdited: false };
        if (endDate) {
          value.isEdited = true;
          value.endDate = endDate;
        }
        const currentValueIndex = filterData.indexOf(currentItem[0]);
        filterData[currentValueIndex] = value;
        projectDispatch(setFilterData(filterData));
      } else {
        const value = {
          elementId: field.elementId,
          startDate: date,
          endDate: null,
          fieldTypeId: field.fieldTypeId,
          isEdited: false,
        };
        if (endDate) {
          value.isEdited = true;
        }
        filterData.push(value);
        projectDispatch(setFilterData(filterData));
      }
      setIsEdit(true);
    }
    setStartDate(date);
  };

  const endDateChangeHandler = (date: any) => {
    const filterData = [...projectState.filterData];
    const currentItem = filterData.filter(
      (item) => item.elementId === field.elementId
    );
    if (startDate) {
      if (new Date(date) < new Date(startDate)) {
        date = endDate;
      }
      if (currentItem.length > 0) {
        const value = { ...currentItem[0], endDate: date, isEdited: false };
        if (startDate) {
          value.isEdited = true;
          value.startDate = startDate;
        }
        const currentValueIndex = filterData.indexOf(currentItem[0]);
        filterData[currentValueIndex] = value;
        projectDispatch(setFilterData(filterData));
      } else {
        const value = {
          elementId: field.elementId,
          startDate: null,
          endDate: date,
          fieldTypeId: field.fieldTypeId,
          isEdited: true,
        };
        if (startDate) {
          value.isEdited = true;
        }
        filterData.push(value);
        projectDispatch(setFilterData(filterData));
      }
      setIsEdit(true);
    }
    setEndDate(date);
  };

  const openView = () => {
    const options = [...projectState.filterOptions];
    options[index].isOpen = true;
    projectDispatch(setFilterOptions(options));
  };

  const hideView = () => {
    const options = [...projectState.filterOptions];
    options[index].isOpen = false;
    projectDispatch(setFilterOptions(options));
  };

  const clearValues = () => {
    const filterData = [...projectState.filterData];
    const currentField = filterData.filter(
      (item) => item.elementId === field.elementId
    );
    if (currentField.length > 0) {
      const currentIndex = filterData.indexOf(currentField[0]);
      setStartDate(null);
      setEndDate(null);
      setIsEdit(false);
      filterData[currentIndex].startDate = null;
      filterData[currentIndex].endDate = null;
      filterData[currentIndex].isEdited = false;
      projectDispatch(setFilterData(filterData));
    }
    const options = [...projectState.filterOptions];
    options[index].isOpen = false;
    projectDispatch(setFilterOptions(options));
  };

  return (
    <>
      {(() => {
        switch (field.caption) {
          case "Created On":
          case "Completed on":
          case "Updated on":
            return (
              <FilterDateRangeModal
                isEdit={isEdit}
                field={field}
                index={index}
                openView={openView}
                hideView={hideView}
                onStartDateChangeHandler={onStartDateChangeHandler}
                endDateChangeHandler={endDateChangeHandler}
                clearValues={clearValues}
                startDate={startDate}
                endDate={endDate}
                startMaxDate={new Date()}
                endMaxDate={new Date()}
                hasStartDate={hasStartDate}
              />
            );
          default:
            return (
              <FilterDateRangeModal
                isEdit={isEdit}
                field={field}
                index={index}
                openView={openView}
                hideView={hideView}
                onStartDateChangeHandler={onStartDateChangeHandler}
                endDateChangeHandler={endDateChangeHandler}
                clearValues={clearValues}
                startDate={startDate}
                endDate={endDate}
                hasStartDate={hasStartDate}
              />
            );
        }
      })()}
    </>
  );
}

export default FilterDateRange;
