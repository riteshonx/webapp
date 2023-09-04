import React from "react";
import { makeStyles, TextField } from "@material-ui/core";
import { Button } from "@mui/material";
import a7 from "../../../../../../assets/images/s3.png";

import {
  Twitter as TwitterIcon,
  LinkedIn as LinkedInIcon,
} from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  multilineColor: {
    color: "#000",
    fontWeight: "bold",
  },
}));

const CONSUMER_KEY = "k3ZAAGPIeQ74IuIZ74RJvB2OX";
const CONSUMER_SECRET = "KS8Iidk25IswtQo9HHxZNS8KRQ3LkeqouZc6MPo9fLJZIFJQ38";

function Screen2({ userDetails }: any): React.ReactElement {
  const classes = useStyles();
  return (
    <>
      <div className="welcomeScreenModal-main__screen2-container">
        <div className="welcomeScreenModal-main__screen2-container__imgMain">
          <img
            className={
              "welcomeScreenModal-main__screen2-container__imgMain__img"
            }
            src={a7}
          />
        </div>
        <div className={"welcomeScreenModal-main__screen2-container__content"}>
          <span
            className={
              "welcomeScreenModal-main__screen2-container__content__text1"
            }
          >
            How may we get in touch with you
          </span>
          <div className="welcomeScreenModal-main__screen2-container__content__col-1">
            <div
              className={
                "welcomeScreenModal-main__screen2-container__content__col-1__div1"
              }
            >
              <span
                className={
                  "welcomeScreenModal-main__screen2-container__content__col-1__div1__label"
                }
              >
                Telephone
              </span>
              <span className="welcomeScreenModal-main__screen2-container__content__col-1__div1__inputMain">
                <span className="welcomeScreenModal-main__screen2-container__content__col-1__div1__inputMain__dot">
                  :
                </span>
                <TextField
                  InputProps={{
                    className: classes.multilineColor,
                  }}
                  value={userDetails?.phone}
                ></TextField>
              </span>
            </div>
            <div
              className={
                "welcomeScreenModal-main__screen2-container__content__col-1__div2"
              }
            >
              <span
                className={
                  "welcomeScreenModal-main__screen2-container__content__col-1__div2__label"
                }
              >
                Primary Email
              </span>
              <span className="welcomeScreenModal-main__screen2-container__content__col-1__div2__inputMain">
                <span className="welcomeScreenModal-main__screen2-container__content__col-1__div2__inputMain__dot">
                  :
                </span>
                <TextField
                  InputProps={{
                    className: classes.multilineColor,
                  }}
                  value={userDetails?.email}
                ></TextField>
              </span>
            </div>
            <div
              className={
                "welcomeScreenModal-main__screen2-container__content__col-1__div3"
              }
            >
              <span
                className={
                  "welcomeScreenModal-main__screen2-container__content__col-1__div3__label"
                }
              >
                Secondary Email
              </span>
              <span
                className={
                  "welcomeScreenModal-main__screen2-container__content__col-1__div3__inputMain"
                }
              >
                <span className="welcomeScreenModal-main__screen2-container__content__col-1__div3__inputMain__dot">
                  :
                </span>
                <TextField
                  InputProps={{
                    className: classes.multilineColor,
                  }}
                ></TextField>
              </span>
            </div>
            <div
              className={
                "welcomeScreenModal-main__screen2-container__content__col-1__div4"
              }
            >
              <span
                className={
                  "welcomeScreenModal-main__screen2-container__content__col-1__div4__label"
                }
              >
                Location
              </span>
              <span
                className={
                  "welcomeScreenModal-main__screen2-container__content__col-1__div4__inputMain"
                }
              >
                <span className="welcomeScreenModal-main__screen2-container__content__col-1__div4__inputMain__dot">
                  :
                </span>
                <TextField
                  InputProps={{
                    className: classes.multilineColor,
                  }}
                  value={
                    userDetails?.addresses?.length &&
                    userDetails?.addresses[0]?.country
                  }
                ></TextField>
              </span>
            </div>
          </div>
          {/* <div
            className={
              "welcomeScreenModal-main__screen2-container__content__actionMain"
            }
          >
            <Button
              variant="outlined"
              startIcon={<TwitterIcon />}
              className={
                "welcomeScreenModal-main__screen2-container__content__actionMain__twitterBtn"
              }
            >
              Connect with Twitter
            </Button>
            <Button
              variant="contained"
              startIcon={<LinkedInIcon />}
              className={
                "welcomeScreenModal-main__screen2-container__content__actionMain__linkedinBtn"
              }
            >
              Connect with LinkedIn
            </Button>
          </div> */}
        </div>
      </div>
    </>
  );
}

export default Screen2;
