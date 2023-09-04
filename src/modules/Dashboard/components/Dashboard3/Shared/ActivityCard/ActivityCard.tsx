import { Tooltip } from "@material-ui/core";
import moment from "moment";
import React, { ReactElement, useContext } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import "./ActivityCard.scss";

interface ActivityCard {
  data: any;
}

const ActivityCard = ({ data }: ActivityCard): ReactElement => {
  const { state }: any = useContext(stateContext);

  return (
    <div
      className="activityCard-main"
      onClick={() => {
        const url = `/scheduling/project-plan/${data?.projectId}?task-id=${data?.taskId}`;
        window.open(url, "_blank");
      }}
    >
      <div className="activityCard-main__taskAndProjectContainer">
        <div className="activityCard-main__taskAndProjectContainer__taskContainer">
          {data?.taskName?.length > 25 ? (
            <Tooltip title={data?.taskName} placement="top">
              <span>{`${data?.taskName?.slice(0, 22)}...`}</span>
            </Tooltip>
          ) : (
            data?.taskName
          )}
        </div>
        <div className="activityCard-main__taskAndProjectContainer__projectContainer">
          {state?.currentLevel === "portfolio" &&
            (data?.projectName?.length > 20 ? (
              <Tooltip title={data?.projectName} placement="top">
                <span>{`${data?.projectName?.slice(0, 17)}...`}</span>
              </Tooltip>
            ) : (
              data?.projectName
            ))}
        </div>
      </div>
      <div className="activityCard-main__dateVariancesAndLinksContainer">
        <div>
          <span className="activityCard-main__dateVariancesAndLinksContainer__subHead">
            Start Date:{" "}
          </span>
          <span className="activityCard-main__dateVariancesAndLinksContainer__value">
            {moment(data?.plannedStartDate).format("DD MMM YYYY")}
          </span>
        </div>
        <div>
          <span className="activityCard-main__dateVariancesAndLinksContainer__subHead">
            End Date:{" "}
          </span>
          <span className="activityCard-main__dateVariancesAndLinksContainer__value">
            {moment(data?.plannedEndDate).format("DD MMM YYYY")}
          </span>
        </div>
        <div>
          <span className="activityCard-main__dateVariancesAndLinksContainer__subHead">
            Variances:{" "}
          </span>
          <span className="activityCard-main__dateVariancesAndLinksContainer__value">
            {data?.variancesCount}
          </span>
        </div>
        <div>
          <span className="activityCard-main__dateVariancesAndLinksContainer__subHead">
            Links:{" "}
          </span>
          <span className="activityCard-main__dateVariancesAndLinksContainer__value">
            {data?.linksCount}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
