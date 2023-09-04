import React, { useContext, useEffect, useState } from "react";
import { getDailyLogDetailsForPopover } from "src/modules/Dashboard/api/gql/form";
import { NoDataAvailable } from "src/modules/Dashboard/utils/commonFormFallback";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import CloseIcon from "../../../../../assets/images/closeIcon.svg";
import "./dailylogpopover.scss";
import moment from "moment";

export default function DailyLogPopover(props: any) {
  const [isLoading, setIsLoading] = useState(false);
  const [dailyLogPopoverDetails, setDailyLogPopoverDetails] = useState<any>([]);
  const { state }: any = useContext(stateContext);
  const { onClose, onDataLoad, taskId } = props;

  const columns: any = [
    "Date",
    "Daily Quantity",
    "Daily hours",
    "Daily Productivity",
    "Actual Quantity",
    "Actual hours",
  ];
  useEffect(() => {
    getDetails();
  }, []);

  const getDetails = async () => {
    try {
      setIsLoading(true);
      const response = await getDailyLogDetailsForPopover(
        taskId,
        state.selectedProjectToken
      );
      let combinedArray: any = [];
      if(!response.projectTaskPartialUpdate.length>0){
        setDailyLogPopoverDetails(combinedArray)
      }else{
        if (response.edw_insight_daily_log_detail_audit_tbl.length > 0) {
          combinedArray = [
            ...combinedArray,
            ...response.edw_insight_daily_log_detail_audit_tbl,
          ];
        }
        if (response.edw_insight_daily_log_detail_history_tbl.length > 0) {
          combinedArray = [
            ...combinedArray,
            ...response.edw_insight_daily_log_detail_history_tbl,
          ];
        }
        setDailyLogPopoverDetails(combinedArray);
      }

      setIsLoading(false);
      onDataLoad && onDataLoad(true);
    } catch (error) {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="v2-dailylog-popover-loader ">
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
        <div className="skeleton-box"></div>
      </div>
    );
  }
  if (!dailyLogPopoverDetails.length) {
    return (
      <div className="v2-dailylog-popover-fallback">
        <img src={CloseIcon} alt="" width={"22px"} onClick={onClose} />
        <NoDataAvailable />
      </div>
    );
  }

  return (
    <div className="v2-dailylog-popover">
      <div className="v2-dailylog-popover-header">
        <div className="v2-dailylog-popover-caption">Daily Log Information</div>
        <div className="v2-dailylog-popover-closeicon">
          <img src={CloseIcon} alt="" width={"22px"} onClick={onClose} />
        </div>
      </div>
      <div className="v2-dailylog-popover-wrapper">
        <table className="v2-dailylog-popover-table">
          <thead className="v2-dailylog-table-head">
            <tr>
              {columns.map((column: any) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dailyLogPopoverDetails &&
              dailyLogPopoverDetails.length > 0 &&
              dailyLogPopoverDetails.map((metric: any) => (
                <tr key={metric.createdAt || "--"}>
                  <td>
                    {" "}
                    {metric.value_metric_date
                      ? moment(metric.value_metric_date).format("DD MMM YYYY")
                      : "--"}
                  </td>
                  <td>{metric.plannedQuantity || "--"}</td>
                  <td>{metric.plannedLabourHour || "--"}</td>
                  <td>{metric.planned_productivity || "--"}</td>
                  <td>
                    {metric?.installedQuantity > -1
                      ? metric?.installedQuantity
                      : "--"}
                  </td>
                  <td>{metric.totalTimeToDate || "--"}</td>
                </tr>
              ))}
          </tbody>
        </table>
        {/* <div className="v2-dailylog-popover-pending">
					Pending Hours : 72 hours
				</div> */}
      </div>
    </div>
  );
}
