import React from "react";
import "./Page3.scss";

interface Page3Props {
  persona: any;
}

const Page3 = ({ persona }: Page3Props): React.ReactElement => {
  return (
    <div className="personalizeBook-main-page3">
      <div className="personalizeBook-main-page3__slateLogo">Slate AI</div>
      <div className="personalizeBook-main-page3__container">
        <div className="personalizeBook-main-page3__container__content">
          <div className="personalizeBook-main-page3__container__content__marginBottom">
            As the{" "}
            <span className="personalizeBook-main-page3__container__content__yellow">
              {persona?.name}
            </span>{" "}
            you will get valuable insights across the entire project
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page3;
