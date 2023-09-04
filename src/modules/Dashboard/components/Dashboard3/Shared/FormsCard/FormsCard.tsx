import { Tooltip } from "@material-ui/core";
import moment from "moment";
import React, { ReactElement, useContext } from "react";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import "./FormsCard.scss";

interface FormsCard {
  data: any;
}

const FormsCard = ({ data }: FormsCard): ReactElement => {
  const { state }: any = useContext(stateContext);
  const subject = data?.formsData
    ? data?.formsData
    : data?.nodeName
    ? data?.nodeName
    : "NA";
  return (
    <div
      className="formsCard-main"
      onClick={() =>
        window.open(
          `/base/projects/${data?.projectId}/form/${data?.featureId}/edit/${data?.formsId}`,
          "_blank"
        )
      }
    >
      <div className="formsCard-main__nameStatusAndFeatureContainer">
        <span className="formsCard-main__nameStatusAndFeatureContainer__name">
          {subject?.length > 12 ? (
            <Tooltip title={subject} placement="top">
              <span>{`${subject?.slice(0, 12)}...`}</span>
            </Tooltip>
          ) : (
            subject
          )}
        </span>
        <span className="formsCard-main__nameStatusAndFeatureContainer__statusContainer">
          <span className="formsCard-main__subHead">Status: </span>
          <span className="formsCard-main__nameStatusAndFeatureContainer__statusContainer__status">
            {data?.status}
          </span>
        </span>
        <span className="formsCard-main__nameStatusAndFeatureContainer__featureContainer">
          {data?.feature?.length > 15 ? (
            <Tooltip title={data?.feature} placement="top">
              <span>{`${data?.feature?.slice(0, 15)}...`}</span>
            </Tooltip>
          ) : (
            data?.feature
          )}
        </span>
      </div>
      <div className="formsCard-main__projectName">
        {state?.currentLevel === "portfolio" &&
          (data?.projectName ? data?.projectName : "")}
      </div>
      <div className="formsCard-main__dateAndUserContainer">
        <span>
          <span className="formsCard-main__subHead">Created On: </span>
          <span className="formsCard-main__value">
            {moment(data?.createdAt).format("DD MMM YYYY")}
          </span>
        </span>
        <span>
          <span className="formsCard-main__subHead">Created By: </span>
          <span className="formsCard-main__value">
            {data?.firstName + " " + data?.lastName}
          </span>
        </span>
      </div>
    </div>
  );
};

export default FormsCard;
