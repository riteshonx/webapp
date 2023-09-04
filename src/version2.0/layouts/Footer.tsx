import React, { useState, useEffect } from "react";
import "./footer.scss";
import { Message, Icon } from "../utils/constants/FloatingMenuConstants";
interface FooterProps {
  message: Message;
  activeTab: boolean;
  Icons: Icon[];
}
export const Footer: React.FC<FooterProps> = (props: FooterProps) => {
  const { message, activeTab, Icons } = props;
  const CharacterScrollingSpeed = 50;
  const PixelScrollingSpeed =10;
  return (
    <div className={`v2-footer ${activeTab ? "open" : "close"}`}>
      <div className="v2-footer-container">
        <div className="v2-footer-content">
          <h3
            className="v2-footer-title"
            style={{
              animationDuration: `${
                message.title.length * CharacterScrollingSpeed + window.innerWidth * PixelScrollingSpeed 
              }ms`,
            }}
          >
            {message.title}
          </h3>
        </div>
        <div className="v2-footer-icons">
          {Icons.map((icon) => (
            <span key={icon.alt} className="v2-footer-icon">
              <img src={icon.src} alt={icon.alt} />{" "}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};
