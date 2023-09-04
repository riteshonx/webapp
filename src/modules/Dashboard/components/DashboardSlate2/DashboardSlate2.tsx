import React, { useContext, useEffect, useState } from "react";
import classNames from "classnames";
import circle1 from "../../../../assets/images/spin0.png";
import circle2 from "../../../../assets/images/spin1.png";
import circle3 from "../../../../assets/images/spin2.png";
import wBg2 from "../../../../assets/images/w-bg2.png";
import wBg from "../../../../assets/images/4.jpeg";
import "./DashboardSlate2.scss";
import axios from "axios";
import {
  ArrowDropDown as ArrowDownIcon,
  ArrowDropUp as ArrowUpIcon,
} from "@material-ui/icons";

import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import { useHistory } from "react-router-dom";
import { CircularProgress } from "@mui/material";
import {
  handleBottomMenus,
  handleInsightMetric,
  setIsLoading,
  setProjectInfo,
  setShowMetricsPopup,
} from "src/modules/root/context/authentication/action";
import { Tooltip } from "@material-ui/core";
import { NoData } from "../Common/NoData/NoData";

const NoDataMessage =
  "Please create a new project or reach out to your Admin to become part of a project in order to use application properly";
import moment from "moment";
import BudgetMetrics from "./Components/BudgetMetrics/BudgetMetrics";
import { nFormatter } from "../../utils/util";
import { client } from "src/services/graphql";
import { GET_ROOT_PROJECT_TASK } from "../../api/queries/task";

const DashboardSlate2 = (props: any): React.ReactElement => {
  const history = useHistory();
  const { dispatch, state }: any = useContext(stateContext);
  const [circleDeg, setCurrentDeg] = useState(0);

  const [step, setStep] = useState(true);
  const [step1, setStep1] = useState(false);
  const [step2, setStep2] = useState(false);
  const [selectedOption, setSelectedOption]: any = useState(
    state?.selectedMetric === "Budget"
      ? 0
      : state?.selectedMetric === "Collab"
      ? 2
      : 3
  );
  const [budgetMetrics, setBudgetMetrics]: any = useState(null);
  const [projectInfo, setProjectDetails]: any = useState(null);
  const [isProjectLoading, setIsProjectLoading] = useState<boolean>(false);
  const [noDataMessage, setNoDataMessage] = useState<boolean>(false);
  const [projectTimeline, setProjectTimeline] = useState({
    show: false,
    delay: 0,
    estimatedEndDate: 0,
  });

  let current = 0;
  let currentDeg = 0;

  const token = getExchangeToken();

  useEffect(() => {
    state?.selectedMetric &&
      rotateTo(
        state?.selectedMetric === "Budget"
          ? 0
          : state?.selectedMetric === "Collab"
          ? 2
          : 3
      );
  }, []);

  useEffect(() => {
    state.currentProject?.projectId && getBudgetValueMetric();
  }, [state.currentProject]);

  useEffect(() => {
    setTimeout(() => {
      setStep(false);
      setStep1(true);
    }, 4000);
  }, []);

  useEffect(() => {
    if (step1) {
      setTimeout(() => {
        setStep1(false);
        setStep2(true);
      }, 4000);
    }
  }, [step1]);

  useEffect(() => {
    if (state?.projectList?.length === 1) {
      setTimeout(() => {
        setNoDataMessage(true);
      }, 2500);
    } else {
      setNoDataMessage(false);
    }
  }, [state?.projectList?.length]);

  useEffect(() => {
    // dispatch(setIsLoading(true));
    setIsProjectLoading(true);
    state.currentProject?.projectId && getProjectsInfo();
  }, [state.currentProject]);

  useEffect(() => {
    state.selectedProjectToken &&
      state.currentProject?.projectId &&
      getProjectTimeline();
  }, [state.selectedProjectToken, state.currentProject]);

  const getProjectsInfo = async () => {
    try {
      setIsProjectLoading(true);
      const token = getExchangeToken();
      dispatch(setProjectInfo(null));
      setProjectDetails(null);
      // dispatch(setIsLoading(true));
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getProjectInfo` +
          `?projectId=${state.currentProject.projectId}&portfolioId=${state.currentPortfolio.portfolioId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        setProjectDetails(response.data);
        dispatch(setProjectInfo(response.data));
        // dispatch(setIsLoading(false));
      }
    } catch (error) {
      dispatch(setIsLoading(false));
    } finally {
      setIsProjectLoading(false);
    }
  };

  const getBudgetValueMetric = async () => {
    const tenantId = Number(decodeExchangeToken().tenantId);
    const userId = decodeExchangeToken().userId;
    try {
      setIsProjectLoading(true);
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/v2/getBudgetValueMetric` +
          `?tenantId=${tenantId}&portfolioId=${state.currentPortfolio.portfolioId}&sessionUserId=${userId}&projectId=${state.currentProject?.projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        setBudgetMetrics(response.data?.list[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsProjectLoading(false);
    }
  };

  const rotateTo = (newPosition: any) => {
    setSelectedOption(null);
    let shift = 0;
    switch (current) {
      case 0:
        switch (newPosition) {
          case 1:
            shift = 72 * 4;
            break;
          case 2:
            shift = 72 * 3.38;
            break;
          case 3:
            shift = 72 * 1.68;
            break;
          case 4:
            shift = 72 * 1;
            break;
          default:
            break;
        }
        break;
      case 1:
        switch (newPosition) {
          case 0:
            shift = 72 * 1;
            break;
          case 2:
            shift = 72 * 4;
            break;
          case 3:
            shift = 72 * 3;
            break;
          case 4:
            shift = 72 * 2;
            break;
          default:
            break;
        }
        break;
      case 2:
        switch (newPosition) {
          case 0:
            shift = 72 * 1.7;
            break;
          case 1:
            shift = 72 * 1;
            break;
          case 3:
            shift = 72 * 3.4;
            break;
          case 4:
            shift = 72 * 3;
            break;
          default:
            break;
        }
        break;
      case 3:
        switch (newPosition) {
          case 4:
            shift = 72 * 4;
            break;
          case 0:
            shift = 72 * 3;
            break;
          case 1:
            shift = 72 * 2;
            break;
          case 2:
            shift = 72 * 1.6;
            break;
          default:
            break;
        }
        break;
      case 4:
        switch (newPosition) {
          case 0:
            shift = 72 * 4;
            break;
          case 1:
            shift = 72 * 3;
            break;
          case 2:
            shift = 72 * 2;
            break;
          case 3:
            shift = 72 * 1;
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
    current = newPosition;
    currentDeg += shift;
    setCurrentDeg(currentDeg);
    setTimeout(() => {
      setSelectedOption(newPosition);
      dispatch(
        handleInsightMetric(
          newPosition === 0
            ? "Budget"
            : newPosition === 2
            ? "Collab"
            : "Scheduler"
        )
      );
    }, 500);
  };

  const getProjectTimeline = async () => {
    const res = await client.query({
      query: GET_ROOT_PROJECT_TASK,
      fetchPolicy: "network-only",
      variables: {
        projectId: state.currentProject?.projectId,
        tenantId: Number(decodeExchangeToken().tenantId),
      },
      context: { role: "viewMasterPlan", token: state.selectedProjectToken },
    });
    // const { plannedEndDate } = res.data.projectTask?.[0] || {
    //   plannedEndDate: 0,
    // };
    // const plannedEndDate =
    //   res.data.projectTask_aggregate.aggregate.max.plannedEndDate;

    // const estimatedEndDate =
    //   res.data.projectInsightsTaskDelay_aggregate.aggregate.max
    //     .forecastedEndDate;

    // const estimatedEndDateValue = new Date(estimatedEndDate).valueOf();
    // const plannedEndDateValue = new Date(plannedEndDate).valueOf();
    const timelineObject = {
      show:
        res.data?.projectInsightsTaskDelay?.length &&
        res.data?.projectInsightsTaskDelay[0]?.forecastedDelay
          ? true
          : false,
      delay: res.data?.projectInsightsTaskDelay?.length
        ? res.data?.projectInsightsTaskDelay[0]?.forecastedDelay
        : 0,
      estimatedEndDate: res.data?.projectInsightsTaskDelay?.length
        ? res.data?.projectInsightsTaskDelay[0]?.forecastedEndDate
        : 0,
    };
    // if (estimatedEndDateValue && plannedEndDateValue) {
    //   timelineObject.show = true;
    //   timelineObject.delay = moment(estimatedEndDateValue).diff(
    //     plannedEndDateValue,
    //     "days"
    //   );
    // }
    setProjectTimeline(timelineObject);
  };

  return !state.selectedProjectToken &&
    !state.isLoading &&
    state?.noProjectFound &&
    !isProjectLoading ? (
    <NoData noDataMessage={NoDataMessage} />
  ) : (
    <div className="dashboardSlate2-main">
      {!state.isLoading &&
      state?.selectedProjectToken &&
      state.currentProject?.projectId ? (
        <>
          <div className="dashboardSlate2-main__header-row">
            <div className="dashboardSlate2-main__header-row__col-1"></div>
            <div className="dashboardSlate2-main__header-row__col-2">
              {state.currentProject?.projectName?.length &&
                state.currentProject?.projectName
                  ?.split("")
                  .map((val: any, i: number) => (
                    <span
                      key={i}
                      style={{
                        animationDelay: `${i * 100}ms`,
                      }}
                      className="dashboardSlate2-main__header-row__col-2__p-title"
                    >
                      {val.toUpperCase()}
                    </span>
                  ))}
            </div>
          </div>
          <div className="dashboardSlate2-main__content-row">
            <div className="dashboardSlate2-main__content-row__col-1"></div>
            <div className="dashboardSlate2-main__content-row__col-2">
              <div
                className={classNames(
                  "dashboardSlate2-main__content-row__col-2__menu-item",
                  {
                    "dashboardSlate2-main__content-row__col-2__menu-item__active":
                      selectedOption === 0,
                  }
                )}
              >
                <div
                  className="dashboardSlate2-main__content-row__col-2__menu-item__title"
                  onClick={() => {
                    rotateTo(0);
                    setTimeout(() => {
                      setSelectedOption(0);
                      dispatch(setShowMetricsPopup(true));
                    }, 1000);
                  }}
                >
                  Productivity{" "}
                  <span className="icon">
                    <span className="bar one"></span>
                    <span className="bar two"></span>
                    <span className="bar three"></span>
                  </span>
                </div>
                <div className="dashboardSlate2-main__content-row__col-2__menu-item__sub">
                  Progress, Value Metrics
                </div>
              </div>
              <div
                className={classNames(
                  "dashboardSlate2-main__content-row__col-2__menu-item",
                  {
                    "dashboardSlate2-main__content-row__col-2__menu-item__active":
                      selectedOption === 3,
                  }
                )}
              >
                <div
                  className="dashboardSlate2-main__content-row__col-2__menu-item__title"
                  onClick={() => {
                    rotateTo(3);
                    history.push("/slate-assist");
                  }}
                >
                  Insights
                </div>
                <div className="dashboardSlate2-main__content-row__col-2__menu-item__sub">
                  Recommendations, Analysis, Actions
                </div>
              </div>
              <div
                className={classNames(
                  "dashboardSlate2-main__content-row__col-2__menu-item",
                  {
                    "dashboardSlate2-main__content-row__col-2__menu-item__active":
                      selectedOption === 2,
                  }
                )}
              >
                <div
                  className="dashboardSlate2-main__content-row__col-2__menu-item__title"
                  onClick={() => {
                    rotateTo(2);
                    history.push("/collaborate");
                  }}
                >
                  Collaborate
                </div>
                <div className="dashboardSlate2-main__content-row__col-2__menu-item__sub">
                  Strategize, Interact, Converse
                </div>
              </div>
            </div>
            <div className="dashboardSlate2-main__content-row__col-3">
              <div
                style={{
                  transform: `rotate(${circleDeg}deg)`,
                  transition: "transform 0.4s linear",
                }}
              >
                <div className="dashboardSlate2-main__content-row__col-3__main">
                  <div className="dashboardSlate2-main__content-row__col-3__main__img-container">
                    <img src={circle3} className="rotate-clock" />
                  </div>
                  <div className="dashboardSlate2-main__content-row__col-3__main__img-container">
                    <img src={circle1} className="rotate-antiClock" />
                  </div>
                  <div className="dashboardSlate2-main__content-row__col-3__main__img-container">
                    <img src={circle2} className="rotate-clock" />
                  </div>

                  {selectedOption === 0 && (
                    <div className="dashboardSlate2-main__content-row__col-3__main__f-innerContent">
                      <img
                        src={wBg}
                        style={{
                          transform: `rotate(-${circleDeg}deg)`,
                        }}
                        className="dashboardSlate2-main__content-row__col-3__main__f-innerContent__img"
                      />
                    </div>
                  )}
                  {selectedOption === 2 && (
                    <>
                      <div className="dashboardSlate2-main__content-row__col-3__main__s-innerContent">
                        <img
                          src={wBg2}
                          style={{
                            transform: `rotate(-${circleDeg}deg)`,
                          }}
                          className="dashboardSlate2-main__content-row__col-3__main__s-innerContent__img"
                        />
                      </div>
                      <div
                        style={{
                          transform: `rotate(-${circleDeg}deg)`,
                        }}
                        className="dashboardSlate2-main__content-row__col-3__main__t-innerContent"
                      >
                        <div onClick={() => history.push("/collaborate")}>
                          SLATE CONVERSE
                        </div>
                      </div>
                    </>
                  )}
                  {selectedOption === 3 && (
                    <>
                      <div className="dashboardSlate2-main__content-row__col-3__main__schedule-main">
                        <div className="dashboardSlate2-main__content-row__col-3__main__schedule-main__circle-main">
                          <div
                            className="map"
                            style={{
                              transform: `rotate(-${circleDeg}deg)`,
                              transition: "transform 0.4s linear",
                            }}
                          ></div>
                          <div className="dashboardSlate2-main__content-row__col-3__main__schedule-main__circle-main__container">
                            <span
                              className="dashboardSlate2-main__content-row__col-3__main__schedule-main__circle-main__container__circle1"
                              style={{ animationDelay: "-2s" }}
                            ></span>
                            <span
                              className="dashboardSlate2-main__content-row__col-3__main__schedule-main__circle-main__container__circle1"
                              style={{ animationDelay: "-1s" }}
                            ></span>
                            <span
                              className="dashboardSlate2-main__content-row__col-3__main__schedule-main__circle-main__container__circle1"
                              style={{ animationDelay: "0s" }}
                            ></span>
                            <span className="center"></span>
                          </div>
                        </div>

                        <div
                          className="dashboardSlate2-main__content-row__col-3__main__schedule-main__content"
                          style={{
                            transform: `rotate(-${circleDeg}deg) translateX(74%)`,
                          }}
                          onClick={() =>
                            history.push(
                              `/scheduling/project-plan/${state?.currentProject?.projectId}`
                            )
                          }
                        >
                          VIEW SCHEDULE
                        </div>
                      </div>
                      <div
                        style={{
                          transform: `rotate(-${circleDeg}deg) translateX(16%)`,
                        }}
                        className={
                          "dashboardSlate2-main__content-row__col-3__main__schedule-sub " +
                          (projectTimeline.show ? "delay-days" : "")
                        }
                      >
                        <div
                          className={
                            "dashboardSlate2-main__content-row__col-3__main__schedule-sub__txt text-animation fadeInBottom"
                          }
                        >
                          Est. completion Date
                        </div>
                        {projectTimeline.show ? (
                          <div
                            className={
                              "dashboardSlate2-main__content-row__col-3__main__schedule-sub__txt text-animation fadeInBottom"
                            }
                          >
                            <span className="warning-text">
                              {Math.abs(projectTimeline.delay)} days{" "}
                            </span>{" "}
                            {projectTimeline.delay > 0 ? "behind" : "ahead of"}{" "}
                            Schedule
                          </div>
                        ) : (
                          ""
                        )}
                        <div
                          className={
                            "dashboardSlate2-main__content-row__col-3__main__schedule-sub__txt-1 text-animation fadeInBottom"
                          }
                        >
                          {projectTimeline?.estimatedEndDate
                            ? moment(projectTimeline?.estimatedEndDate).format(
                                "MMM DD, YYYY"
                              )
                            : "-"}
                        </div>
                      </div>
                    </>
                  )}
                  {selectedOption === 0 && (
                    <>
                      {step && (
                        <div
                          style={{
                            transform: `rotate(-${circleDeg}deg)`,
                          }}
                          className={
                            "dashboardSlate2-main__content-row__col-3__main__prod-step text-animation fadeInBottom"
                          }
                        >
                          <div className="dashboardSlate2-main__content-row__col-3__main__prod-step__txt">
                            Welcome {decodeExchangeToken().userName}!
                          </div>
                        </div>
                      )}
                      {step1 && (
                        <div
                          style={{
                            transform: `rotate(-${circleDeg}deg)`,
                          }}
                          className={
                            "dashboardSlate2-main__content-row__col-3__main__prod-step-1 text-animation fadeInBottom"
                          }
                        >
                          <div className="dashboardSlate2-main__content-row__col-3__main__prod-step-1__txt">
                            Here are some key happenings of interest for you{" "}
                          </div>
                        </div>
                      )}
                      {step2 && (
                        <div className="dashboardSlate2-main__content-row__col-3__main__prod-step-2">
                          <strong className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__strong-main-txt">
                            Fiscal impact{" "}
                          </strong>{" "}
                          for the{" "}
                          <strong className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__strong-txt">
                            current{" "}
                          </strong>{" "}
                          <div className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__icon-txt">
                            month is{" "}
                            <strong className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__strong-txt">
                              {budgetMetrics?.impact
                                ? parseFloat(
                                    (budgetMetrics?.impact * 100).toFixed(2)
                                  )
                                : 0}
                              %{" "}
                            </strong>{" "}
                            {!budgetMetrics?.impact ||
                            budgetMetrics?.impact >= 0 ? (
                              <ArrowUpIcon
                                className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__icon-txt__icon"
                                htmlColor="#FF3E13"
                              />
                            ) : (
                              <ArrowDownIcon
                                className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__icon-txt__icon"
                                htmlColor="#1FE08F"
                              />
                            )}
                            {budgetMetrics?.impact >= 0 ? (
                              <span>above the</span>
                            ) : (
                              <span>below the</span>
                            )}
                          </div>
                          original budget of{" "}
                          <strong className="dashboardSlate2-main__content-row__col-3__main__prod-step-2__strong-txt">
                            $
                            {budgetMetrics?.budget
                              ? nFormatter(budgetMetrics?.budget, 2)
                              : 0}
                          </strong>
                        </div>
                      )}
                      <div className="dashboardSlate2-main__content-row__col-3__main__action-main">
                        <div
                          style={{
                            transform: `rotate(-${circleDeg}deg)`,
                          }}
                          className="dashboardSlate2-main__content-row__col-3__main__action-main__btn"
                          onClick={() => dispatch(setShowMetricsPopup(true))}
                        >
                          Analyze
                        </div>
                      </div>
                    </>
                  )}

                  <div
                    className="dashboardSlate2-main__content-row__col-3__main__second-main"
                    style={{
                      top: selectedOption === 3 ? "90%" : "90%",
                      right: selectedOption === 3 ? "44%" : "45%",
                    }}
                    onClick={() => selectedOption !== 3 && rotateTo(3)}
                  >
                    {selectedOption === 3 ? (
                      <div
                        className={classNames({
                          "dashboardSlate2-main__content-row__col-3__main__second-main__first-circle":
                            selectedOption === 3,
                        })}
                      >
                        <div
                          className={classNames("mini-preview", {
                            active: selectedOption === 3,
                            "dashboardSlate2-main__content-row__col-3__main__second-main__first-circle":
                              selectedOption === 3,
                          })}
                          style={{ transform: `rotate(-${circleDeg}deg)` }}
                          onClick={() => {
                            dispatch(
                              handleBottomMenus({
                                ...state.bottomMenu,
                                showNotificationPopup: true,
                              })
                            );
                          }}
                        >
                          <span
                            style={{
                              color: selectedOption === 3 ? "#fff" : "#677a95",
                              textTransform: "uppercase",
                            }}
                          >
                            Schedule
                            <div>
                              {projectTimeline.show ? (
                                <span
                                  className={
                                    projectTimeline.delay > 0
                                      ? "delay-alert"
                                      : "success-alert"
                                  }
                                >
                                  <ArrowUpIcon className="dashboardSlate2-main__content-row__col-3__main__second-main__first-circle-txt__icon" />
                                  {Math.abs(projectTimeline.delay)} days{" "}
                                </span>
                              ) : (
                                ""
                              )}
                            </div>
                          </span>
                        </div>
                        <Tooltip title={"Completion"} placement="right">
                          <div
                            className={classNames(
                              "dashboardSlate2-main__content-row__col-3__main__second-main__small-circle"
                            )}
                            style={{ transform: `rotate(-${circleDeg}deg)` }}
                          >
                            <div
                              style={{
                                color:
                                  selectedOption === 3 ? "#fff" : "#677a95",
                              }}
                              className="dashboardSlate2-main__content-row__col-3__main__second-main__co-main"
                            >
                              <div className="dashboardSlate2-main__content-row__col-3__main__second-main__co-main__val">
                                <strong>
                                  {projectInfo?.plannedEndDate
                                    ? moment(
                                        projectInfo?.plannedEndDate
                                      ).format("MMM' YY")
                                    : "-"}
                                </strong>
                              </div>{" "}
                              <span className="dashboardSlate2-main__content-row__col-3__main__second-main__co-main__txt">
                                COMPLETE
                              </span>
                            </div>
                          </div>
                        </Tooltip>
                        <Tooltip title={"Inception"} placement="right">
                          <div
                            className={classNames(
                              "dashboardSlate2-main__content-row__col-3__main__second-main__small-circle1"
                            )}
                            style={{ transform: `rotate(-${circleDeg}deg)` }}
                          >
                            <span
                              style={{
                                color:
                                  selectedOption === 3 ? "#fff" : "#677a95",
                              }}
                              className="dashboardSlate2-main__content-row__col-3__main__second-main__ex-main"
                            >
                              <div className="dashboardSlate2-main__content-row__col-3__main__second-main__ex-main__val">
                                <strong>
                                  {" "}
                                  {projectInfo?.plannedStartDate
                                    ? moment(
                                        projectInfo?.plannedStartDate
                                      ).format("MMM' YY")
                                    : "-"}
                                </strong>
                              </div>{" "}
                              <span className="dashboardSlate2-main__content-row__col-3__main__second-main__ex-main__txt">
                                START
                              </span>{" "}
                            </span>
                          </div>
                        </Tooltip>
                      </div>
                    ) : (
                      <div
                        className={classNames("mini-preview", {
                          active: selectedOption === 3,
                        })}
                        style={{ transform: `rotate(-${circleDeg}deg)` }}
                      >
                        <span
                          style={{
                            color: selectedOption === 3 ? "#fff" : "#677a95",
                            textTransform: "uppercase",
                          }}
                        >
                          Schedule
                        </span>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      position: "absolute",
                      top: selectedOption === 2 ? "82%" : "90%",
                      right: selectedOption === 2 ? "-24%" : "-23%",
                    }}
                    onClick={() => selectedOption !== 2 && rotateTo(2)}
                  >
                    {selectedOption === 2 ? (
                      <div
                        className={classNames("mini-preview", {
                          active: selectedOption === 2,
                        })}
                        style={{
                          transform: `rotate(-${circleDeg}deg)`,
                        }}
                      >
                        <div className="dashboardSlate2-main__content-row__col-3__main__collab-expand">
                          Collaborate
                        </div>
                      </div>
                    ) : (
                      <Tooltip title={"Collaborate"} placement="top">
                        <div
                          className={classNames("mini-preview")}
                          style={{ transform: `rotate(-${circleDeg}deg)` }}
                        >
                          <span
                            style={{
                              color: selectedOption === 2 ? "#fff" : "#677a95",
                              textTransform: "uppercase",
                            }}
                          >
                            Collab
                          </span>
                        </div>
                      </Tooltip>
                    )}
                  </div>
                  <div
                    className="dashboardSlate2-main__content-row__col-3__main__first-main"
                    onClick={() => selectedOption !== 0 && rotateTo(0)}
                  >
                    {selectedOption === 0 ? (
                      <div
                        className={classNames({
                          "first-circle": selectedOption === 0,
                        })}
                      >
                        <Tooltip title={"Budget"} placement="top">
                          <div
                            className={classNames("mini-preview", {
                              active: selectedOption === 0,
                              "first-circle": selectedOption === 0,
                            })}
                            style={{
                              transform: `rotate(-${circleDeg}deg)`,
                              cursor: "pointer",
                            }}
                            onClick={() => {
                              dispatch(
                                handleBottomMenus({
                                  ...state.bottomMenu,
                                  showNotificationPopup: true,
                                })
                              );
                            }}
                          >
                            <span
                              style={{
                                color:
                                  selectedOption === 0 ? "#fff" : "#677a95",
                              }}
                              className="dashboardSlate2-main__content-row__col-3__main__first-main__budget-main"
                            >
                              <div className="dashboardSlate2-main__content-row__col-3__main__first-main__budget-main__val">
                                {"$"}
                                {nFormatter(
                                  (budgetMetrics?.budget
                                    ? budgetMetrics?.budget
                                    : 0) +
                                    (budgetMetrics?.approvedChangeOrders
                                      ? budgetMetrics?.approvedChangeOrders
                                      : 0) +
                                    (budgetMetrics?.exposure
                                      ? budgetMetrics?.exposure
                                      : 0),
                                  1
                                )}
                              </div>
                              <span className="dashboardSlate2-main__content-row__col-3__main__first-main__budget-main__txt">
                                Budget
                              </span>
                              <div className="dashboardSlate2-main__content-row__col-3__main__first-main__budget-main__iconContainer">
                                {!budgetMetrics?.impact ||
                                budgetMetrics?.impact >= 0 ? (
                                  <ArrowUpIcon
                                    htmlColor="#FF3E13"
                                    className="dashboardSlate2-main__content-row__col-3__main__first-main__budget-main__iconContainer__icon"
                                  />
                                ) : (
                                  <ArrowDownIcon
                                    htmlColor="#1FE08F"
                                    className="dashboardSlate2-main__content-row__col-3__main__first-main__budget-main__iconContainer__icon"
                                  />
                                )}
                              </div>
                            </span>
                          </div>
                        </Tooltip>
                        <Tooltip title={"Change Order"} placement="top">
                          <div
                            className={classNames("small-circle")}
                            style={{ transform: `rotate(-${circleDeg}deg)` }}
                          >
                            <div
                              style={{
                                color:
                                  selectedOption === 0 ? "#fff" : "#677a95",
                              }}
                              className="dashboardSlate2-main__content-row__col-3__main__first-main__co-main"
                            >
                              <div className="dashboardSlate2-main__content-row__col-3__main__first-main__co-main__val">
                                <strong>
                                  $
                                  {budgetMetrics?.approvedChangeOrders
                                    ? nFormatter(
                                        budgetMetrics?.approvedChangeOrders,
                                        1
                                      )
                                    : 0}
                                </strong>
                              </div>{" "}
                              <span className="dashboardSlate2-main__content-row__col-3__main__first-main__co-main__txt">
                                CO
                              </span>
                            </div>
                          </div>
                        </Tooltip>
                        <Tooltip title={"Exposure"} placement="right">
                          <div
                            className={classNames("small-circle1")}
                            style={{ transform: `rotate(-${circleDeg}deg)` }}
                          >
                            <span
                              style={{
                                color:
                                  selectedOption === 0 ? "#fff" : "#677a95",
                              }}
                              className="dashboardSlate2-main__content-row__col-3__main__first-main__ex-main"
                            >
                              <div className="dashboardSlate2-main__content-row__col-3__main__first-main__ex-main__val">
                                <strong>
                                  $
                                  {budgetMetrics?.exposure
                                    ? nFormatter(budgetMetrics?.exposure, 1)
                                    : 0}
                                </strong>
                              </div>{" "}
                              <span className="dashboardSlate2-main__content-row__col-3__main__first-main__ex-main__txt">
                                Exposure
                              </span>{" "}
                            </span>
                          </div>
                        </Tooltip>
                      </div>
                    ) : (
                      <Tooltip title={"Productivity"} placement="top">
                        <div
                          className={classNames("mini-preview", {
                            active: selectedOption === 0,
                            "first-circle": selectedOption === 0,
                          })}
                          style={{ transform: `rotate(-${circleDeg}deg)` }}
                        >
                          <span
                            style={{
                              color: selectedOption === 0 ? "#fff" : "#677a95",
                            }}
                            className="dashboardSlate2-main__content-row__col-3__main__prod-txt"
                          >
                            Prod
                          </span>
                        </div>
                      </Tooltip>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="dashboardSlate2-main__content-row__col-4"></div>
          </div>
          {state.showMetricsPopup && (
            <BudgetMetrics
              open={state.showMetricsPopup}
              handleClose={() => dispatch(setShowMetricsPopup(false))}
            />
          )}
        </>
      ) : (
        <div className="dashboardSlate2-main__spinner">
          {noDataMessage & state.noProjectFound ? (
            <NoData noDataMessage={NoDataMessage} />
          ) : (
            <CircularProgress color="primary" />
          )}
        </div>
      )}
    </div>
  );
};

export default DashboardSlate2;
