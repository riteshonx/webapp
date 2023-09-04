import React, { ReactElement, useState } from "react";
import { CircularProgress } from "@material-ui/core";
import LaborProductivityProgress from "../../Shared/LaborProductivityProgress/LaborProductivityProgress";
import "./LaborProductivity.scss";
import ProductivityPopUp from "../ProductivityPopUp/ProductivityPopUp";

interface LaborProductivity {
  laborProductivityTab: string;
  handleLaborProductivityTabChange: any;
  laborProductivityData: any;
}

const LaborProductivity = ({
  laborProductivityTab,
  handleLaborProductivityTabChange,
  laborProductivityData,
}: LaborProductivity): ReactElement => {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [id, setId] = useState<any>(null);
  const [projectId, setProjectId] = useState("");

  const openProductivityPopup = (data: any) => {
    setType(laborProductivityTab === "costcode" ? "costCode" : "activity");
    setProjectId(data.projectId);
    setId(
      laborProductivityTab === "costcode"
        ? data.classificationCode
        : data.taskId
    );
    setOpen(true);
  };

  return (
    <div className="laborProductivity-main">
      <div className="laborProductivity-main__headerAndTypeFilter">
        <span className="laborProductivity-main__headerAndTypeFilter__header">
          Labour Productivity
        </span>
        <span className="laborProductivity-main__headerAndTypeFilter__typeFilterContainer">
          <span
            className={
              laborProductivityTab === "costcode"
                ? "laborProductivity-main__headerAndTypeFilter__typeFilterContainer__typeFilter laborProductivity-main__headerAndTypeFilter__typeFilterContainer__selected"
                : "laborProductivity-main__headerAndTypeFilter__typeFilterContainer__typeFilter"
            }
            onClick={() => handleLaborProductivityTabChange("costcode")}
          >
            Cost Code
          </span>
          <span
            className={
              laborProductivityTab === "activity"
                ? "laborProductivity-main__headerAndTypeFilter__typeFilterContainer__typeFilter laborProductivity-main__headerAndTypeFilter__typeFilterContainer__selected"
                : "laborProductivity-main__headerAndTypeFilter__typeFilterContainer__typeFilter"
            }
            onClick={() => handleLaborProductivityTabChange("activity")}
          >
            Activity
          </span>
        </span>
      </div>

      <div className="laborProductivity-main__dataContainer">
        {laborProductivityData === null && (
          <div className="laborProductivity-main__circularProgressContainer">
            <CircularProgress className="laborProductivity-main__circularProgressContainer__circularProgress" />
          </div>
        )}
        {laborProductivityData?.length
          ? laborProductivityData?.map((item: any, i: number) => (
              <LaborProductivityProgress
                key={i}
                data={item}
                laborProductivityTab={laborProductivityTab}
                openProductivityPopup={openProductivityPopup}
              />
            ))
          : laborProductivityData?.length === 0 && (
              <div className="laborProductivity-main__noDataContainer">
                No Tasks available!
              </div>
            )}
      </div>
      <ProductivityPopUp
        open={open}
        type={type}
        id={id}
        projectId={projectId}
        onClose={() => setOpen(false)}
      />
    </div>
  );
};

export default LaborProductivity;
