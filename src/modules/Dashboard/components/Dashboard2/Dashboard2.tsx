import React, { ReactElement, useContext, useState } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import ProjectView from "./Components/ProjectView/ProjectView";
import TenantView from "./Components/TenantView/TenantView";
import PortfolioView from "./Components/PortfolioView/PortfolioView";
import "./Dashboard2.scss";
import InsightsPopOver from "src/modules/Dashboard/shared/InsightsPopOver/InsightsPopOver";

const currentYear = new Date().getFullYear();

const filterData: any = {
  yearly: [
    { id: `y${currentYear}`, value: currentYear },
    { id: `y${currentYear - 1}`, value: currentYear - 1 },
    { id: `y${currentYear - 2}`, value: currentYear - 2 },
    { id: `y${currentYear - 3}`, value: currentYear - 3 },
  ],
  quarterly: [
    { id: "q1", value: "Quarter1" },
    { id: "q2", value: "Quarter2" },
    { id: "q3", value: "Quarter3" },
    { id: "q4", value: "Quarter4" },
  ],
  monthly: [
    { id: "m1", value: "January" },
    { id: "m2", value: "February" },
    { id: "m3", value: "March" },
    { id: "m4", value: "April" },
    { id: "m5", value: "May" },
    { id: "m6", value: "June" },
    { id: "m7", value: "July" },
    { id: "m8", value: "August" },
    { id: "m9", value: "September" },
    { id: "m10", value: "October" },
    { id: "m11", value: "November" },
    { id: "m12", value: "December" },
  ],
  weekly: [
    { id: "w1", value: "Week 1" },
    { id: "w2", value: "Week 2" },
    { id: "w3", value: "Week 3" },
    { id: "w4", value: "Week 4" },
    { id: "w5", value: "Week 5" },
    { id: "w6", value: "Week 6" },
    { id: "w7", value: "Week 7" },
    { id: "w8", value: "Week 8" },
    { id: "w9", value: "Week 9" },
    { id: "w10", value: "Week 10" },
    { id: "w11", value: "Week 11" },
    { id: "w12", value: "Week 12" },
    { id: "w13", value: "Week 13" },
    { id: "w14", value: "Week 14" },
    { id: "w15", value: "Week 15" },
    { id: "w16", value: "Week 16" },
    { id: "w17", value: "Week 17" },
    { id: "w18", value: "Week 18" },
    { id: "w19", value: "Week 19" },
    { id: "w20", value: "Week 20" },
    { id: "w21", value: "Week 21" },
    { id: "w22", value: "Week 22" },
    { id: "w23", value: "Week 23" },
    { id: "w24", value: "Week 24" },
    { id: "w25", value: "Week 25" },
    { id: "w26", value: "Week 26" },
    { id: "w27", value: "Week 27" },
    { id: "w28", value: "Week 28" },
    { id: "w29", value: "Week 29" },
    { id: "w30", value: "Week 30" },
    { id: "w31", value: "Week 31" },
    { id: "w32", value: "Week 32" },
    { id: "w33", value: "Week 33" },
    { id: "w34", value: "Week 34" },
    { id: "w35", value: "Week 35" },
    { id: "w36", value: "Week 36" },
    { id: "w37", value: "Week 37" },
    { id: "w38", value: "Week 38" },
    { id: "w39", value: "Week 39" },
    { id: "w40", value: "Week 40" },
    { id: "w41", value: "Week 41" },
    { id: "w42", value: "Week 42" },
    { id: "w43", value: "Week 43" },
    { id: "w44", value: "Week 44" },
    { id: "w45", value: "Week 45" },
    { id: "w46", value: "Week 46" },
    { id: "w47", value: "Week 47" },
    { id: "w48", value: "Week 48" },
    { id: "w49", value: "Week 49" },
    { id: "w50", value: "Week 50" },
    { id: "w50", value: "Week 51" },
    { id: "w50", value: "Week 52" },
  ],
};

function Dashboard2(): ReactElement {
  const { state }: any = useContext(stateContext);

  const savedDateFilter: any = sessionStorage.getItem("savedDateFilter");

  const [savedValue, setSavedValue] = useState(
    JSON.parse(savedDateFilter) || {
      id: `y${currentYear}`,
      type: "select",
      value: null,
      year: currentYear,
      index: null,
      yearIndex: 0,
    }
  );

  const [menuEl, setMenuEl]: any = React.useState(null);
  const [currentMenu, setCurrentMenu]: any = useState(
    filterData[savedValue.type]
  );
  const [currentMenuType, setCurrentMenuType]: any = useState(savedValue);
  const [selectedIndex, setSelectedIndex]: any = React.useState(
    savedValue.index
  );
  const [selectedYearIndex, setSelectedYearIndex]: any = React.useState(
    savedValue.yearIndex
  );

  const handleClick = (event: any) => {
    setMenuEl(event.currentTarget);
  };

  const handleClose = () => {
    setMenuEl(null);
    setCurrentMenuType(savedValue);
    setCurrentMenu(filterData[savedValue.type]);
    setSelectedIndex(savedValue.index);
    setSelectedYearIndex(savedValue.yearIndex);
  };

  const handleListItemClick = (selectedItem: any, index: any) => {
    setCurrentMenuType({
      ...currentMenuType,
      id:
        currentMenuType.type !== "select"
          ? `y${currentMenuType?.year}_${selectedItem.id}`
          : selectedItem.id,
      index: index,
      value: selectedItem.value,
    });
    setSelectedIndex(index);
  };

  const handleFilterChange = (event: any) => {
    setCurrentMenu(filterData[event.target.value]);
    if (event.target.value !== savedValue.type) {
      setSelectedIndex(null);
      setCurrentMenuType({
        ...currentMenuType,
        id: currentMenuType.id.split("_")[0],
        type: event.target.value,
        value: null,
        index: null,
      });
    } else {
      setSelectedIndex(savedValue.index);
      setCurrentMenuType({
        ...currentMenuType,
        type: event.target.value,
      });
    }
  };

  const handleYearFilterClick = (selectedItem: any, index: number) => {
    setCurrentMenuType({
      ...currentMenuType,
      id:
        currentMenuType.type !== "select" &&
        currentMenuType.id.split("_")?.length > 1
          ? `${selectedItem.id}_${currentMenuType.id.split("_")[1]}`
          : selectedItem.id,
      yearIndex: index,
      year: selectedItem.value,
    });
    setSelectedYearIndex(index);
  };

  const handleFilterApply = () => {
    sessionStorage.setItem("savedDateFilter", JSON.stringify(currentMenuType));
    setSavedValue(currentMenuType);
    setMenuEl(null);
  };
  return state.currentLevel === "portfolio" ? (
    <div className={"dashboard2-main"}>
      <PortfolioView
        menuEl={menuEl}
        handleClick={handleClick}
        handleClose={handleClose}
        currentMenu={currentMenu}
        handleFilterChange={handleFilterChange}
        handleListItemClick={handleListItemClick}
        handleFilterApply={handleFilterApply}
        selectedIndex={selectedIndex}
        savedValue={savedValue}
        currentMenuType={currentMenuType}
        currentLevel={state.currentLevel}
        handleYearFilterClick={handleYearFilterClick}
        selectedYearIndex={selectedYearIndex}
      />
    </div>
  ) : state.currentLevel === "project" ? (
    <div className={"dashboard2-main"}>
      <ProjectView
        menuEl={menuEl}
        handleClick={handleClick}
        handleClose={handleClose}
        currentMenu={currentMenu}
        handleFilterChange={handleFilterChange}
        handleListItemClick={handleListItemClick}
        handleFilterApply={handleFilterApply}
        selectedIndex={selectedIndex}
        savedValue={savedValue}
        currentMenuType={currentMenuType}
        currentLevel={state.currentLevel}
        handleYearFilterClick={handleYearFilterClick}
        selectedYearIndex={selectedYearIndex}
      />
      <InsightsPopOver />
    </div>
  ) : (
    <TenantView />
  );
}

export default Dashboard2;
