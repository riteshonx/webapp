import React, { useState } from "react";
import { Footer } from "src/version2.0/layouts/Footer";
import openIcon from "../../../assets/images/open-button-icon.png";
import activeIcon from "../../../assets/images/open-btn-footer.png";
import footerIcon from "../../../assets/images/footer-doc-icon.png";
import footerAlarm from "../../../assets/images/footer-alarm-icon.png";
import { Message, Icon } from "../../../utils/constants/FloatingMenuConstants";
import "./floatingmenu.scss";

const message:Message = {
  title:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Proin dolor justo, egestas in tellus ac, luctus pretium ante.",
};
const Icons: Icon[] = [
  { src: footerAlarm, alt: "Icon 1" },
  { src: footerIcon, alt: "Icon 2" },
];

export default function FloatingMenu() {
  const [activeTab, setActiveTab] = useState(false);
  return (
    <>
      <div className="v2-floatingmenu-container-icon-wrapper">
        <div onClick={() => setActiveTab(!activeTab)}>
          <img src={activeTab ? activeIcon : openIcon} />
        </div>
      </div>
      <Footer message={message} activeTab={activeTab} Icons={Icons} />
    </>
  );
}
