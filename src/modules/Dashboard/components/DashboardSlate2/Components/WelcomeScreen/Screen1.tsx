import React from "react";
import { decodeExchangeToken } from "src/services/authservice";
import a7 from "../../../../../../assets/images/s2.png";

function Screen1({ persona, setScreens }: any): React.ReactElement {
  return (
    <>
      <div className="welcomeScreenModal-main__screen1-container">
        <div className="welcomeScreenModal-main__screen1-container__imgMain">
          <img
            className={
              "welcomeScreenModal-main__screen1-container__imgMain__img"
            }
            src={a7}
          />
        </div>
        <div className={"welcomeScreenModal-main__screen1-container__content"}>
          <div
            className={"welcomeScreenModal-main__screen1-container__content"}
          >
            <span
              className={
                "welcomeScreenModal-main__screen1-container__content__text2"
              }
            >
              {[...`Hi ${decodeExchangeToken().userName}!`].map(
                (val: any, i: number) => (
                  <span
                    key={i}
                    style={{
                      animationDelay: `${i * 100}ms`,
                    }}
                    className="welcomeScreenModal-main__screen1-container__content__text2__flash"
                  >
                    {val}
                  </span>
                )
              )}
            </span>
            <span
              className={
                "welcomeScreenModal-main__screen1-container__content__text3"
              }
            >
              We are pleased to welcome you to Slate.Ai
            </span>
            <span
              className={
                "welcomeScreenModal-main__screen1-container__content__persona"
              }
            >
              Selected Persona:{" "}
              <span onClick={() => setScreens(4)}>{persona?.name}</span>
            </span>
          </div>
          <div
            className={
              "welcomeScreenModal-main__screen1-container__content__text4"
            }
          >
            Personalize your Slate Experience
          </div>
        </div>
      </div>
    </>
  );
}

export default Screen1;
