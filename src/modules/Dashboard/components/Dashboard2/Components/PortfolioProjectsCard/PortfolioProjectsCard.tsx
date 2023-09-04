import { ReactElement } from "react";
import {
  Avatar,
  Card,
  CardContent,
  CardHeader,
  makeStyles,
  Tooltip,
} from "@material-ui/core";
import "./PortfolioProjectsCard.scss";
import Slider from "react-slick";
import tcprofile from "../../../../../../assets/images/tcbg5.svg";
import tcbg1 from "../../../../../../assets/images/personaBlack.svg";

const useStyles = makeStyles({
  headerTitle: {
    fontSize: "1.2rem",
    fontWeight: "bolder",
  },
});

const projectCardSettings = {
  dots: false,
  infinite: false,
  slidesToShow: 2,
  slidesToScroll: 2,
};

interface Props {
  info: any;
  levelType: string;
}

function PortfolioProjectsCard({ info, levelType }: Props): ReactElement {
  const classes = useStyles();
  return (
    <Card className={"portfolioProjectsCard-main"}>
      <CardHeader
        title={
          levelType === "portfolio" ? (
            "Projects"
          ) : (
            <span>
              Teammates <span className={"header-badge"}>{info?.length}</span>
            </span>
          )
        }
        classes={{
          title: classes.headerTitle,
        }}
      />
      <CardContent className={"portfolioProjectsCard-main__content"}>
        <div
          className={"portfolioProjectsCard-main__content__content1"}
          style={{
            justifyContent: info && info?.length === 1 ? "center" : "",
          }}
        >
          {info && levelType === "portfolio" ? (
            info?.length === 1 ? (
              <div
                className={"portfolioCard-main portfolioCard-main__singleValue"}
              >
                <div className={"portfolioCard-main__content"}>
                  <Avatar
                    alt={info[0]?.projectName}
                    src={tcprofile}
                    className={
                      "portfolioProjectsCard-main__content__content2__div__avatarContainer__avatar__new"
                    }
                  />
                </div>
                <div className={"portfolioCard-main__content__textContainer"}>
                  <Tooltip title={info[0]?.projectName} placement={"top"}>
                    <div className={"text1"}>{info[0]?.projectName}</div>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <Slider {...projectCardSettings}>
                {info?.map((item: any, index: any) => (
                  <div key={index}>
                    <div className={"portfolioCard-main"}>
                      <div className={"portfolioCard-main__content"}>
                        <Avatar
                          alt={item?.projectName}
                          src={tcprofile}
                          className={
                            "portfolioProjectsCard-main__content__content2__div__avatarContainer__avatar__new"
                          }
                        />
                      </div>
                      <div
                        className={"portfolioCard-main__content__textContainer"}
                      >
                        <Tooltip title={item?.projectName} placement={"top"}>
                          <div className={"text1"}>{item?.projectName}</div>
                        </Tooltip>
                      </div>
                    </div>
                  </div>
                ))}
              </Slider>
            )
          ) : info?.length === 1 ? (
            <div className={"projectCard-main projectCard-main__singleValue"}>
              <div className={"projectCard-main__content"}>
                <Avatar
                  alt={info[0]?.firstName + " " + info[0]?.lastName}
                  src={tcbg1}
                  className={
                    "portfolioProjectsCard-main__content__content2__div__avatarContainer__avatar__new1"
                  }
                />
              </div>
              <div className={"projectCard-main__content__textContainer"}>
                <Tooltip
                  title={info[0]?.firstName + " " + info[0]?.lastName}
                  placement={"top"}
                >
                  <div className={"text1"}>
                    {info[0]?.firstName + " " + info[0]?.lastName}
                  </div>
                </Tooltip>
                <div className={"text2"}>{info[0]?.role}</div>
              </div>
            </div>
          ) : (
            <Slider {...projectCardSettings}>
              {info?.map((item: any, index: any) => (
                <div key={index}>
                  <div className={"projectCard-main"}>
                    <div className={"projectCard-main__content"}>
                      <Avatar
                        alt={item?.firstName + " " + item?.lastName}
                        src={tcbg1}
                        className={
                          "portfolioProjectsCard-main__content__content2__div__avatarContainer__avatar__new1"
                        }
                      />
                    </div>
                    <div className={"projectCard-main__content__textContainer"}>
                      <Tooltip
                        title={item?.firstName + " " + item?.lastName}
                        placement={"top"}
                      >
                        <div className={"text1"}>
                          {item?.firstName + " " + item?.lastName}
                        </div>
                      </Tooltip>
                      <div className={"text2"}>{item?.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </Slider>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default PortfolioProjectsCard;
