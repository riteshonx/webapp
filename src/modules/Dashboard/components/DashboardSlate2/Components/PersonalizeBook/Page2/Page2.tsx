import React from "react";
import "./Page2.scss";

const Page2 = (): React.ReactElement => {
  return (
    <div className="personalizeBook-main-page2">
      <div className="personalizeBook-main-page2__overlay"></div>
      <div className="personalizeBook-main-page2__content">
        <div className="personalizeBook-main-page2__content__marginBottom">
          Objectives:
        </div>
        <div className="personalizeBook-main-page2__content__marginBottom">
          Operational
        </div>
        <div className="personalizeBook-main-page2__content__marginBottom">
          efficiency
        </div>
        Worker safety
      </div>
    </div>
  );
};

export default Page2;
