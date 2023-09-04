import React, { ReactElement, useContext } from "react";
import HorizontalProgressBar from "../HorizontalProgressBar/HorizontalProgressBar";
import "./LaborProductivityProgress.scss";
import ArrowDownIcon from "@material-ui/icons/ArrowDropDown";
import ArrowUpIcon from "@material-ui/icons/ArrowDropUp";
import { Tooltip } from "@material-ui/core";
import { nFormatter } from "src/modules/Dashboard/utils/util";
import "./LaborProductivityProgress.scss";
import { stateContext } from "src/modules/root/context/authentication/authContext";

interface LaborProductivityProgress {
  data: any;
  laborProductivityTab: string;
  openProductivityPopup: any;
}

const LaborProductivityProgress = ({
  data,
  laborProductivityTab,
  openProductivityPopup,
}: any): ReactElement => {
  const { state }: any = useContext(stateContext);

  return (
    <div
      className="laborProductivityProgress-main"
      onClick={() => {
        openProductivityPopup(data);
      }}
    >
      {state?.currentLevel === "portfolio" && (
        <div className="laborProductivityProgress-main__projectName">
          {data?.projectName ? data?.projectName : ""}
        </div>
      )}
      <div className="laborProductivityProgress-main__container">
        <span className="laborProductivityProgress-main__container__taskNameContainer">
          {laborProductivityTab === "activity" &&
            (data?.taskName?.length > 17 ? (
              <Tooltip title={data?.taskName} placement="top">
                <span>{`${data?.taskName?.slice(0, 30)}...`}</span>
              </Tooltip>
            ) : (
              data?.taskName
            ))}
          {laborProductivityTab === "costcode" &&
            (data?.classificationCode?.length +
              data?.classificationCodeName?.length >
            27 ? (
              <Tooltip title={data?.classificationCode} placement="top">
                <span>{`${
                  data?.classificationCodeName
                } (${data?.classificationCode?.slice(0, 30)}...)`}</span>
              </Tooltip>
            ) : (
              data?.classificationCodeName +
              " (" +
              data?.classificationCode +
              ")"
            ))}
        </span>
        <span className="laborProductivityProgress-main__container__hoursMetricsContainer">
          <Tooltip
            title={"PlannedLabourHour/ProjectedLabourHours"}
            placement="top"
          >
            <span className="laborProductivityProgress-main__container__hoursMetricsContainer__plannedByProjectedHours">
              {data?.plannedLabourHour ? data?.plannedLabourHour : 0}/
              {data?.projectedLaborHour > 0
                ? data?.projectedLaborHour
                : data?.projectedLaborHour === null
                ? "-"
                : 0}
            </span>
          </Tooltip>
          <Tooltip title={"Percent Difference"} placement="top">
            <span
              className={
                data?.diffPercent <= 0
                  ? !data?.diffPercent
                    ? "laborProductivityProgress-main__container__hoursMetricsContainer__productivityPercentage " +
                      `laborProductivityProgress-main__container__hoursMetricsContainer__productivityPercentage__paddingRight ${
                        data?.diffPercent === 0 ? "green" : ""
                      }`
                    : "laborProductivityProgress-main__container__hoursMetricsContainer__productivityPercentage green"
                  : "laborProductivityProgress-main__container__hoursMetricsContainer__productivityPercentage red"
              }
            >
              {data?.diffPercent === 0 ? 0 : data?.diffPercent === null && "-"}
              {data?.diffPercent && data?.diffPercent >= 0 ? (
                <>
                  {nFormatter(data?.diffPercent, 1)}
                  <ArrowUpIcon
                    className="laborProductivityProgress-main__container__hoursMetricsContainer__icon"
                    htmlColor="#FF3E13"
                  />
                </>
              ) : data?.diffPercent && data?.diffPercent < 0 ? (
                <>
                  {nFormatter(data?.diffPercent, 1)}
                  <ArrowDownIcon
                    className="laborProductivityProgress-main__container__hoursMetricsContainer__icon"
                    htmlColor="#1FE08F"
                  />
                </>
              ) : null}
            </span>
          </Tooltip>
        </span>
      </div>

      <HorizontalProgressBar
        value={data?.plannedLabourHour ? data?.plannedLabourHour : 0}
        total={data?.projectedLaborHour ? data?.projectedLaborHour : 0}
        color={"linear-gradient(270deg, #59B5C7 15.5%, #105C6B 85.5%)"}
      />
    </div>
  );
};

export default LaborProductivityProgress;
