import React from "react";
import "./Page5.scss";

const Page5 = (): React.ReactElement => {
  return (
    <div className="personalizeBook-main-page5">
      <div className="personalizeBook-main-page5__slateLogo">Slate AI</div>
      <div className="personalizeBook-main-page5__container">
        <div className="personalizeBook-main-page5__container__content1">
          <h2>Summary</h2>
          <p>
            As a supervisor, Slate offers rich insights into your teams
            productivity, schedule and budget efficiencies. Slate's digital
            assist will keep track of key performance
          </p>
        </div>
        <div className="personalizeBook-main-page5__container__content2">
          <h2>Getting started</h2>
          <p>
            Please select the Persona, you would like to experience Slate.ai as.
            You may need to log out and back in once you have selected to
            personalize the application experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Page5;
