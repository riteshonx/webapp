import moment from "moment";
import React, { useState, useContext, useEffect } from "react";
import "./WeatherComponent.scss";
import img4 from "../../../../../../assets/images/bg-1.png";
import {
  WbSunny as WbSunnyIcon,
  Announcement as AnnouncementIcon,
} from "@mui/icons-material";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import clearSky from "../../../../../../assets/images/sun-icon.png";
import cloudy from "../../../../../../assets/images/cloud-icon.png";
import snow from "../../../../../../assets/images/snow-icon.png";
import rain from "../../../../../../assets/images/rain-icon.png";
import drizzel from "../../../../../../assets/images/light-rain.png";
import storm from "../../../../../../assets/images/storm-icon.png";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "src/services/authservice";
import axios from "axios";
import {
  setIsLoading,
  setProjectInfo,
  setProjectWeatherDetails,
  setZIndexPriority,
} from "src/modules/root/context/authentication/action";
import { Grid } from "@material-ui/core";

const API_KEY = "e24df970b55b5defb68874f3ab3e147d";
const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

const WeatherComponent = ({ open, handleClose }: any) => {
  const [selectedMenu, setSelectedMenu] = useState("one");
  const { state, dispatch }: any = useContext(stateContext);
  const wrapperRef: any = React.useRef(null);
  const [alerts, setAlerts] = useState([]);
  const [weatherDetails, setWeatherDetails] = useState({
    name: "",
    main: { humidity: 0, temp: 0 },
    weather: [{ main: "", icon: "" }],
    wind_speed: 0,
    temp: 0,
    day: "",
  });
  const [currentTime, setCurrentTime] = useState("");
  const [timezone, setTimezone] = useState("");
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const [dailyForecast, setDailyForecast] = useState([]);
  const [projectDetail, setProjectDetail] = useState({
    address: { city: "", fullAddress: "" },
  });

  useOutsideAlerter(wrapperRef);

  function useOutsideAlerter(ref: any) {
    React.useEffect(() => {
      function handleClickOutside(event: any) {
        if (ref.current && !ref.current.contains(event.target) && open) {
          handleClose();
        }
      }
      // Bind the event listener
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        // Unbind the event listener on clean up
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [ref, open]);
  }

  useEffect(() => {
    if (
      state?.projectInfo === null ||
      Object.keys(state?.projectInfo)?.length === 0
    ) {
      state?.currentProject?.projectId && getProjectsInfo();
    } else {
      state?.currentProject?.projectId && fetchWeatherAlerts(null);
      fetchForecast(state?.projectInfo);
      setProjectDetail(state?.projectInfo);
    }
  }, [state.projectInfo, state.selectedProjectToken]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeByTimezone();
    }, 1000);
    setCurrentTimeByTimezone();
    return () => clearInterval(timer);
  }, [timezone]);

  const setCurrentTimeByTimezone = () => {
    if (timezone !== "") {
      setCurrentTime(
        new Date().toLocaleString("en-US", {
          timeZone: timezone,
        })
      );
    }
  };

  useEffect(() => {
    if (state?.portfolioInfo?.projectInfos?.length > 0) {
      fetchWeatherAlerts(state?.portfolioInfo?.projectInfos[0]?.projectId);
      fetchForecast(state?.portfolioInfo?.projectInfos[0]);
      setProjectDetail(state?.portfolioInfo?.projectInfos[0]);
    }
  }, [state.portfolioInfo]);

  const fetchWeatherAlerts = (id: any) => {
    // if (state?.currentProject?.projectName === "All") return;
    let projectId = state?.currentProject?.projectId;
    if (id) {
      projectId = id;
    }
    const token = getExchangeToken();
    axios
      .get(
        `${DASHBOARD_URL}dashboard/getWeatherAlerts?tenantId=${
          decodeExchangeToken().tenantId
        }&projectId=${projectId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )
      .then((res: any) => {
        const data = res?.data;
        if (data.length > 0) {
          const temp: any = data[data.length - 1];
          const arr: any = [
            ...temp?.alertsFromRules,
            ...temp.alertsGeneral?.alert,
          ];
          setAlerts(arr);
        } else {
          setAlerts([]);
        }
      });
  };

  const getProjectsInfo = async () => {
    try {
      dispatch(setProjectInfo(null));
      dispatch(setIsLoading(true));
      const token = getExchangeToken();
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/getProjectInfo` +
          `?projectId=${state.currentProject.projectId}&portfolioId=${state.currentProject.portfolioId}`,
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

  const fetchForecast = async (projectInfo: any) => {
    const weatherInfo: any = sessionStorage.getItem("weatherDetails");
    if (projectInfo === null || Object.keys(projectInfo)?.length === 0) return;

    if (
      JSON.parse(weatherInfo) &&
      JSON.parse(weatherInfo).projectId === projectInfo?.projectId
    ) {
      setTimezone(JSON.parse(weatherInfo).timezone);
      dispatch(setProjectWeatherDetails(JSON.parse(weatherInfo).current));
      setWeatherDetails(JSON.parse(weatherInfo).current);
      setDailyForecast(JSON.parse(weatherInfo).forecast);
    } else {
      const lat = projectInfo?.latitude || 40.7508;
      const lon = projectInfo?.longitude || -73.99612;
      const api_call = await fetch(
        `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&dt=${new Date().getTime()}&&units=metric&appid=${API_KEY}`
      );
      const response = await api_call.json();
      let temp: any = [];
      let current: any = {};
      current = response.current;
      if (current) {
        current.day =
          moment(current?.dt * 1000)
            .format("dddd")
            .toUpperCase() +
          " " +
          moment(current.dt * 1000).format("Do");
        setTimezone(response?.timezone);
        dispatch(setProjectWeatherDetails(response.current));
        setWeatherDetails(response.current);
        response.daily.forEach((item: any) => {
          const data = {
            day: days[new Date(item.dt * 1000).getDay()],
            weather: item.weather[0],
            pop: item.pop,
            temp: item.temp.day,
          };
          temp.push(data);
        });
        temp = temp.slice(0, 6);
        setDailyForecast(temp);
        sessionStorage.setItem(
          "weatherDetails",
          JSON.stringify({
            timezone: response?.timezone,
            current: response.current,
            forecast: temp,
            projectId: projectInfo?.projectId,
          })
        );
      }
    }
  };
  return (
    <div
      className="weather-container"
      ref={wrapperRef}
      style={{
        backgroundImage: `url(${img4})`,
        zIndex: state?.zIndexPriority === "weatherComponent" ? 3 : 1,
      }}
      onClick={(e: any) => {
        e.stopPropagation();
        dispatch(setZIndexPriority("weatherComponent"));
      }}
    >
      <div className="weather-container__row-1">
        <div className="weather-container__row-1__col-1"></div>
        <div className="weather-container__row-1__col-2">
          <div>
            <LocationOnIcon className="weather-container__row-1__col-2__icon" />
          </div>
          <div className="weather-container__row-1__col-2__loc">
            {projectDetail?.address?.fullAddress &&
              projectDetail?.address?.fullAddress?.toUpperCase()}
          </div>
        </div>
      </div>

      <div className="weather-container__row-2">
        <div
          className={
            selectedMenu === "one"
              ? "weather-container__row-2__tab-1 weather-container__row-2__active"
              : "weather-container__row-2__tab-1"
          }
          onClick={() => setSelectedMenu("one")}
        >
          <WbSunnyIcon className="weather-container__row-2__tab-1__icon" />
          Weather
        </div>
        <div
          className={
            selectedMenu === "two"
              ? "weather-container__row-2__tab-2 weather-container__row-2__active"
              : "weather-container__row-2__tab-2"
          }
          onClick={() => setSelectedMenu("two")}
        >
          <AnnouncementIcon className="weather-container__row-2__tab-2__icon weather-container__blink_me" />
          Geo Intelligence
        </div>
      </div>
      <Grid container className={"weather-container__tab-content"}>
        {selectedMenu === "one" && (
          <>
            <Grid
              item
              xs={4}
              className={"weather-container__tab-content__left"}
            >
              {weatherDetails && (
                <Grid container>
                  <Grid item xs={6}>
                    <div
                      className={
                        "weather-container__tab-content__left__content"
                      }
                    >
                      <span>
                        {Math.round(weatherDetails?.temp)}
                        <sup
                          className={
                            "weather-container__tab-content__left__content__temp"
                          }
                        >
                          o
                        </sup>
                      </span>
                    </div>
                    <div
                      className={
                        "weather-container__tab-content__left__content__day"
                      }
                    >
                      {weatherDetails?.day}
                    </div>
                  </Grid>
                  <Grid item xs={6}>
                    {weatherDetails.weather[0].main === "Clouds" ? (
                      <img src={cloudy} alt="weather" height="90" />
                    ) : weatherDetails.weather[0].main === "Clear" ? (
                      <img src={clearSky} alt="weather" height="90" />
                    ) : weatherDetails.weather[0].main === "Snow" ? (
                      <img src={snow} alt="weather" height="90" />
                    ) : weatherDetails.weather[0].main === "Rain" ? (
                      <img src={rain} alt="weather" height="90" />
                    ) : weatherDetails.weather[0].main === "Drizzle" ? (
                      <img src={drizzel} alt="weather" height="90" />
                    ) : weatherDetails.weather[0].main === "Thunderstorm" ? (
                      <img src={storm} alt="weather" height="90" />
                    ) : (
                      <img src={cloudy} alt="weather" height="90" />
                    )}
                    <div>
                      <b
                        className={
                          "weather-container__tab-content__left__content__speed"
                        }
                      >
                        {Math.round(weatherDetails?.wind_speed * 3.6)} km/hr
                        &nbsp;
                      </b>
                    </div>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid
              item
              xs={8}
              className={"weather-container__forecast-container"}
            >
              <Grid container>
                {dailyForecast &&
                  dailyForecast.map((item: any, index: any) => (
                    <Grid
                      item
                      xs={2}
                      key={index}
                      className={
                        "weather-container__forecast-container__border"
                      }
                    >
                      <h3
                        className={"weather-container__forecast-container__day"}
                      >
                        {item.day.toUpperCase()}
                      </h3>
                      <div
                        className={
                          "weather-container__forecast-container__weatherType"
                        }
                      >
                        {item.weather.main === "Clouds" ? (
                          <img src={cloudy} alt="weather" height="30" />
                        ) : item.weather.main === "Clear" ? (
                          <img src={clearSky} alt="weather" height="30" />
                        ) : item.weather.main === "Snow" ? (
                          <img src={snow} alt="weather" height="30" />
                        ) : item.weather.main === "Rain" ? (
                          <img src={rain} alt="weather" height="30" />
                        ) : item.weather.main === "Drizzle" ? (
                          <img src={drizzel} alt="weather" height="30" />
                        ) : item.weather.main === "Thunderstorm" ? (
                          <img src={storm} alt="weather" height="30" />
                        ) : (
                          <img
                            src={`https://openweathermap.org/img/w/${item.weather.icon}.png`}
                            alt="weather"
                            height="30"
                          />
                        )}
                      </div>
                      <p
                        className={
                          "weather-container__forecast-container__temp"
                        }
                      >
                        <strong>
                          {Math.round(item.temp)}
                          <sup
                            className={
                              "weather-container__forecast-container__temp__sub"
                            }
                          >
                            o
                          </sup>
                        </strong>
                      </p>
                    </Grid>
                  ))}
              </Grid>
            </Grid>
          </>
        )}
        {selectedMenu === "two" && (
          <Grid container className={"weather-container__scrollText"}>
            {alerts.map((alert: any, index) => {
              return alert.title ? (
                <Grid item xs={12} key={index} className={"alert"}>
                  <h3>{alert?.title}:</h3>
                  <p>{alert?.msg}</p>
                </Grid>
              ) : (
                <Grid item xs={12} key={index} className={"alert"}>
                  <h3>{alert?.event}:</h3>
                  <p>{alert?.headline}</p>
                </Grid>
              );
            })}
            {alerts?.length === 0 && (
              <div className={"noAlerts"}>No alerts at this time!</div>
            )}
          </Grid>
        )}
      </Grid>
    </div>
  );
};

export default WeatherComponent;
