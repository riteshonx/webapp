import React from "react";
import "./Page4.scss";

const Page4 = (): React.ReactElement => {
  return (
    <div className="personalizeBook-main-page4">
      <h4>Some of the insights you will experince include:</h4>
      <div className="personalizeBook-main-page4__container">
        <div className="personalizeBook-main-page4__container__content">
          <div className="personalizeBook-main-page4__container__content__flexRow">
            <div className="personalizeBook-main-page4__container__content__flexRow__subHead">
              Value Metrics
            </div>{" "}
            : Budget-Related Insights
          </div>
          <div className="personalizeBook-main-page4__container__content__flexRow">
            <div className="personalizeBook-main-page4__container__content__flexRow__subHead">
              Productivity Metrics
            </div>{" "}
            : Planned Vs Actual Metrics
          </div>
          <div>Team's overall Productivity</div>
          <div>Schedule Efficiencies</div>
          <div>Manage Project</div>
          <div>Manage Team Members</div>
        </div>
      </div>
    </div>
  );
};

export default Page4;
