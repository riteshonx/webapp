import React, { ReactElement, useState } from "react";
import Financials from "./Financials/Financials";
import Incidents from "./Incidents/Incidents";
import RfisLP from "./RfisLP/RfisLP";
import WhosOnsite from "./WhoOnsite/WhosOnsite";
import "./ProjectMetrics.scss";

const ProjectMetrics = (): ReactElement => {
  const [filterType, setFilterType] = useState("monthly");

  const handleFilterChange = (val: string) => {
    setFilterType(val);
  };

  return (
    <div className="projectMetrics-main">
      <div className="projectMetrics-main__headerContainer">
        <span className="projectMetrics-main__headerContainer__name">
          Project Metrics
        </span>
        <span className="projectMetrics-main__headerContainer__filterContainer">
          <span
            className={
              filterType === "monthly"
                ? "projectMetrics-main__headerContainer__filterContainer__filter activeFilter"
                : "projectMetrics-main__headerContainer__filterContainer__filter"
            }
            onClick={() => handleFilterChange("monthly")}
          >
            Month
          </span>
          <span
            className={
              filterType === "quarterly"
                ? "projectMetrics-main__headerContainer__filterContainer__filter activeFilter"
                : "projectMetrics-main__headerContainer__filterContainer__filter"
            }
            onClick={() => handleFilterChange("quarterly")}
          >
            Quarter
          </span>
          <span
            className={
              filterType === "yearly"
                ? "projectMetrics-main__headerContainer__filterContainer__filter activeFilter"
                : "projectMetrics-main__headerContainer__filterContainer__filter"
            }
            onClick={() => handleFilterChange("yearly")}
          >
            Year
          </span>
        </span>
      </div>
      <div className="projectMetrics-main__container">
        <div className="projectMetrics-main__container__innerContainer marginBottom">
          <div className="projectMetrics-main__container__innerContainer__chartContainer marginRight">
            <WhosOnsite filterType={filterType} />
          </div>
          <div className="projectMetrics-main__container__innerContainer__chartContainer">
            <Incidents filterType={filterType} />
          </div>
        </div>
        <div className="projectMetrics-main__container__innerContainer">
          <div className="projectMetrics-main__container__innerContainer__chartContainer marginRight">
            <Financials filterType={filterType} />
          </div>
          <div className="projectMetrics-main__container__innerContainer__chartContainer">
            <RfisLP filterType={filterType} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectMetrics;
