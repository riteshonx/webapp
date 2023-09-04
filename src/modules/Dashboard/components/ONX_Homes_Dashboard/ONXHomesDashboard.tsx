// react imports and main css import
import { ReactElement, useContext, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import "./ONXHomesDashboard.scss";

// component imports
import MapPopup from "./Components/MapPopup";

// img imports
import clearSky from "../../../../assets/images/sun-icon.png";
import cloudy from "../../../../assets/images/cloud-icon.png";
import snow from "../../../../assets/images/snow-icon.png";
import rain from "../../../../assets/images/rain-icon.png";
import drizzel from "../../../../assets/images/light-rain.png";
import storm from "../../../../assets/images/storm-icon.png";

// material ui imports
import Typography from "@material-ui/core/Typography";

// icons
import PlaceTwoToneIcon from "@material-ui/icons/PlaceTwoTone";

import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  setCurrentLevel,
  setCurrentProject,
  setIsLoading,
  setProjectInfo,
} from "../../../root/context/authentication/action";

// other imports
import moment from "moment";
import axios from "axios";
import { getExchangeToken } from "src/services/authservice";

const ONXHomesDashboard = (): ReactElement => {
  const history = useHistory();

  //state and dispatch
  const { state, dispatch }: any = useContext(stateContext);

  //ref
  const scrollRef = useRef<HTMLInputElement>(null);

  // token
  const token = getExchangeToken();

  // state
  const [projects, setProjects]: any = useState(null);
  const [openMap, setOpenMap] = useState(false);

  //useEffect
  useEffect(() => {
    dispatch(setIsLoading(true));
    state.currentPortfolio?.portfolioId &&
      state.currentProject?.projectId &&
      getProjectsInfo();
  }, [state.currentProject]);

  useEffect(() => {
    setProjects(state.projectList);
    const selectedProject: any = sessionStorage.getItem("selectedProject");
    if (JSON.parse(selectedProject)) {
      dispatch(setCurrentLevel("project"));
      dispatch(setCurrentProject(JSON.parse(selectedProject)));
    } else if (state.projectList?.length > 1) {
      sessionStorage.setItem(
        "selectedProject",
        JSON.stringify(state.projectList[1])
      );
      dispatch(setCurrentProject(state.projectList[1]));
      dispatch(setCurrentLevel("project"));
    }
  }, [state.projectList]);

  // api calls
  const getProjectsInfo = async () => {
    try {
      dispatch(setProjectInfo(null));
      dispatch(setIsLoading(true));
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
        dispatch(setProjectInfo(response.data));
        dispatch(setIsLoading(false));
      }
    } catch (error) {
      dispatch(setIsLoading(false));
    }
  };

  //events
  const onClickProject = (prjId: string) => {
    const selectedProject = state.projectList.find(
      (prj: any) => prj.projectId === prjId
    );
    sessionStorage.setItem("selectedProject", JSON.stringify(selectedProject));
    dispatch(setCurrentProject(selectedProject));
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  return state.projectList?.length > 1 ? (
    <div className="onxHomesDashboard-main">
      {state.currentProject?.projectId &&
      state.currentProject?.projectId > 0 ? (
        <div
          className={
            projects?.length < 5
              ? "onxHomesDashboard-main__landing-page__topPortfolios onxHomesDashboard-main__landing-page__topPortfolios__center"
              : "onxHomesDashboard-main__landing-page__topPortfolios"
          }
          ref={scrollRef}
        >
          <div
            className={`onxHomesDashboard-main__landing-page__topPortfolios__portfolioName onxHomesDashboard-main__landing-page__topPortfolios__selectedPortfolioName`}
            onClick={() => onClickProject(state.currentProject?.projectId)}
          >
            {state.currentProject?.projectName}
          </div>
          {state.projectList.map(
            (project: any) =>
              project?.projectId > 0 &&
              state.currentProject?.projectId !== project?.projectId && (
                <div
                  key={project?.projectId}
                  className={`onxHomesDashboard-main__landing-page__topPortfolios__portfolioName`}
                  onClick={() => onClickProject(project?.projectId)}
                >
                  {project.projectName}
                </div>
              )
          )}
        </div>
      ) : (
        <></>
      )}
      {!state.isLoading && state.projectInfo?.team?.length > 0 && (
        <>
          <div className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left">
            <div
              className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioLocation"
              onClick={() => {
                setOpenMap(true);
              }}
            >
              <PlaceTwoToneIcon className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioLocation__icon-position" />
              <Typography
                variant="h6"
                className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioLocation__text-position"
              >
                {state.projectInfo?.address?.fullAddress
                  ? state.projectInfo?.address?.fullAddress
                  : ""}
              </Typography>
            </div>
            <div className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioName">
              <Typography
                variant="h1"
                className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioName__text-position"
              >
                {state.projectInfo?.projectName
                  ? state.projectInfo?.projectName
                  : ""}
              </Typography>
            </div>{" "}
            <div className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioName__clickContainer">
              <Typography
                variant="h6"
                className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioName__click"
                onClick={() => {
                  localStorage.setItem(
                    "prjName",
                    state.projectInfo?.projectName
                  );
                  history.push("/inspection");
                }}
              >
                Click here to review...!
              </Typography>
            </div>
            <div className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioStatus">
              <Typography variant="h6">
                Est Completion Date:{" "}
                {state.projectInfo?.endDate
                  ? moment(state.projectInfo?.endDate).format("MMM DD, YYYY")
                  : ""}
              </Typography>
            </div>
            {/* <div className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__left__portfolioStatus__status">
              <Typography variant="h6">
                Project Status:{" "}
                {state.projectInfo?.completionStatus
                  ? state.projectInfo?.completionStatus[0].toUpperCase() +
                    state.projectInfo?.completionStatus.slice(1)
                  : ""}
              </Typography>
            </div> */}
          </div>
          <div className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__right">
            <div className="weather-panel">
              <div className="temperature">
                {state?.projectWeatherDetails?.weather[0].main === "Clouds" ? (
                  <img src={cloudy} alt="weather" height="50" />
                ) : state?.projectWeatherDetails?.weather[0].main ===
                  "Clear" ? (
                  <img src={clearSky} alt="weather" height="50" />
                ) : state?.projectWeatherDetails?.weather[0].main === "Snow" ? (
                  <img src={snow} alt="weather" height="50" />
                ) : state?.projectWeatherDetails?.weather[0].main === "Rain" ? (
                  <img src={rain} alt="weather" height="50" />
                ) : state?.projectWeatherDetails?.weather[0].main ===
                  "Drizzle" ? (
                  <img src={drizzel} alt="weather" height="50" />
                ) : state?.projectWeatherDetails?.weather[0].main ===
                  "Thunderstorm" ? (
                  <img src={storm} alt="weather" height="50" />
                ) : (
                  <img src={cloudy} alt="weather" height="50" />
                )}
                <label>
                  {state?.projectWeatherDetails?.temp
                    ? state?.projectWeatherDetails?.temp
                    : 0}
                  &nbsp;
                </label>
              </div>
              <div className="precipitation">
                <div className="values">
                  <h6 className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__right__commonSubTitleStyle">
                    Precipitation:
                  </h6>
                  <label>
                    {state?.projectWeatherDetails?.dew_point
                      ? state?.projectWeatherDetails?.dew_point
                      : 0}
                  </label>
                </div>
              </div>
              <div className="humidity">
                <div className="values">
                  <h6 className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__right__commonSubTitleStyle">
                    Humidity:
                  </h6>
                  <label>
                    {state?.projectWeatherDetails?.humidity
                      ? state?.projectWeatherDetails?.humidity
                      : 0}
                    %
                  </label>
                </div>
              </div>
              <div className="wind">
                <div className="values">
                  <h6 className="onxHomesDashboard-main__landing-page__selectedPortfolioContent__right__commonSubTitleStyle">
                    Wind:
                  </h6>
                  <label>
                    {state?.projectWeatherDetails?.wind_speed
                      ? Math.round(
                          state?.projectWeatherDetails?.wind_speed * 3.6
                        )
                      : 0}{" "}
                    km/h
                  </label>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
      <MapPopup
        open={openMap}
        close={() => setOpenMap(false)}
        location={{
          lat: state.projectInfo?.latitute ? state.projectInfo?.latitute : "",
          long: state.projectInfo?.longitude
            ? state.projectInfo?.longitude
            : "",
          prjName: state.projectInfo?.projectName
            ? state.projectInfo?.projectName
            : "",
        }}
      />
    </div>
  ) : (
    <div className="onxHomesDashboard-main onxHomesDashboard-main__noContent">
      {state.isLoading !== true &&
        state?.projectList?.length <= 1 &&
        state?.projectInfo?.projectId && (
          <>
            <span className={"onxHomesDashboard-main__noContent__text"}>
              Lets build something amazing !
            </span>
            <span className={"onxHomesDashboard-main__noContent__text1"}>
              Add projects to get started
            </span>
          </>
        )}
    </div>
  );
};

export default ONXHomesDashboard;
