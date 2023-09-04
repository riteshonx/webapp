import classNames from "classnames";
import React, { useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  handleBottomMenus,
  setChatText,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import BottomPanel from "../../Shared/SwipeWrapper/SwipeWrapper";
import "./Collaborate.scss";
import LeftArrowIcon from "@material-ui/icons/KeyboardArrowLeft";
import { IconButton } from "@material-ui/core";
import { decodeExchangeToken } from "src/services/authservice";

const initialOptionsArr = [
  "What is my Productivity?",
  "What is the Completion Date?",
  "Any impending issues?",
  "Email my Colleague",
];

const Collaborate = (): React.ReactElement => {
  const history = useHistory();
  const { state, dispatch }: any = useContext(stateContext);
  const [showChatSuggestions, setShowChatSuggestions]: any = useState(null);
  const [suggestions, setSuggestions] = useState(initialOptionsArr);

  useEffect(() => {
    if (!state.bottomMenu?.showChatPanel) {
      setShowChatSuggestions(false);
    } else {
      setShowChatSuggestions(true);
    }
  }, [state.bottomMenu?.showChatPanel]);

  const handleConverseClick = () => {
    setShowChatSuggestions(true);
    dispatch(
      handleBottomMenus({
        ...state.bottomMenu,
        showChatPanel: true,
      })
    );
  };

  return (
    <div className="collaborateMain">
      <IconButton
        className="collaborateMain__backButtonIcon"
        onClick={() => history.push("/")}
      >
        <LeftArrowIcon />
      </IconButton>

      <div className="collaborateMain__container">
        {!showChatSuggestions && (
          <>
            <div className="collaborateMain__container__textContainer1 collaborateMain__container__textAnimation">
              Good Day{" "}
              <span className="collaborateMain__container__username">
                {decodeExchangeToken().userName}!
              </span>
            </div>
            <div className="collaborateMain__container__textContainer2 collaborateMain__container__textAnimation">
              How may I assist you?
            </div>
            <div className="collaborateMain__container__textContainer3 collaborateMain__container__textAnimation">
              <div className="collaborateMain__container__textContainer3__button">
                Interact{" "}
              </div>
              <div
                className="collaborateMain__container__textContainer3__button"
                onClick={handleConverseClick}
              >
                Converse
              </div>
              <div className="collaborateMain__container__textContainer3__button">
                Strategize
              </div>
            </div>
          </>
        )}
      </div>
      <BottomPanel
        open={showChatSuggestions}
        placement={{ left: "5%" }}
        backgroundImage={"transparent"}
        animationType={"bottomToTop"}
      >
        <div
          className={classNames({
            "collaborateMain__suggestion-list": true,
            "collaborateMain__scroll-text": true,
          })}
        >
          {suggestions.map((item: any, index: number) => (
            <div
              className={
                index % 2 === 0
                  ? "collaborateMain__suggestion collaborateMain__suggestion__left"
                  : "collaborateMain__suggestion collaborateMain__suggestion__right"
              }
              onClick={() => {
                dispatch(setChatText(item));
              }}
              key={index}
            >
              {item}
            </div>
          ))}
        </div>
      </BottomPanel>
    </div>
  );
};

export default Collaborate;
