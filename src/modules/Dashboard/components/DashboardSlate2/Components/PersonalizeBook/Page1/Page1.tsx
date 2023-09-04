import React from "react";
import { decodeExchangeToken } from "src/services/authservice";
import "./Page1.scss";

interface Page1Props {
  persona: any;
}

const Page1 = ({ persona }: Page1Props): React.ReactElement => {
  return (
    <div className="personalizeBook-main-page1">
      <div className="personalizeBook-main-page1__slateLogo">Slate AI</div>
      <div className="personalizeBook-main-page1__container">
        <div className="personalizeBook-main-page1__container__content">
          <div className="personalizeBook-main-page1__container__content__lineheight">
            {decodeExchangeToken().userName}
          </div>
          <div className="personalizeBook-main-page1__container__content__lineheight">
            {persona?.name}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page1;
