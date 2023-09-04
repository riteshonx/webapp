import { useEffect, useState, useContext } from "react";
import { Grid } from "@material-ui/core";
import {
  LocationOn as LocationOnIcon,
  WbSunny as WbSunnyIcon,
  Announcement as AnnouncementIcon,
} from "@material-ui/icons";
import clearSky from "../../../../assets/images/sun-icon.png";
import cloudy from "../../../../assets/images/cloud-icon.png";
import snow from "../../../../assets/images/snow-icon.png";
import rain from "../../../../assets/images/rain-icon.png";
import drizzel from "../../../../assets/images/light-rain.png";
import storm from "../../../../assets/images/storm-icon.png";
import moment from "moment";
import { stateContext } from "../../context/authentication/authContext";
import { decodeExchangeToken } from "../../../../services/authservice";
import "./WeatherPopup.scss";
import axios from "axios";
import { getExchangeToken } from "../../../../services/authservice";
import {
  setProjectWeatherDetails,
  setProjectInfo,
  setIsLoading,
} from "../../context/authentication/action";

const API_KEY = "e24df970b55b5defb68874f3ab3e147d";
const DASHBOARD_URL: any = process.env["REACT_APP_DASHBOARD_URL"];

const WeatherPopup = () => {
  const { state, dispatch }: any = useContext(stateContext);

  const [selectedTab, setSelectedTab] = useState("one");
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

  useEffect(() => {
    if (
      state?.projectInfo === null ||
      Object.keys(state?.projectInfo)?.length === 0
    ) {
      getProjectsInfo();
    } else {
      state?.currentProject?.projectId && fetchWeatherAlerts(null);
      fetchForecast(state?.projectInfo);
      setProjectDetail(state?.projectInfo);
    }
  }, [state.projectInfo, state.selectedProject]);

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
          `?projectId=${state.selectedProject.projectId}&portfolioId=${state.selectedProject.portfolioId}`,
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

  const handleTabChange = (val: any) => {
    setSelectedTab(val);
  };

  return (
    <div className={"weather-popup"}>
      <Grid container className={"weather-container"}>
        <Grid container>
          <Grid item xs={8}>
            <div className={"weather-container__projectName"}>
              {state.currentLevel === "project"
                ? state.currentProject?.projectName
                : state.portfolioInfo &&
                  state.portfolioInfo?.projectInfos &&
                  state.portfolioInfo?.projectInfos[0]?.projectName}
            </div>
          </Grid>
          <Grid item xs={4} className={"project-loc"}>
            <div>
              <LocationOnIcon className={"icon"} />
            </div>
            <div>
              <b>
                {projectDetail?.address?.fullAddress &&
                  projectDetail?.address?.fullAddress?.toUpperCase()}
              </b>
            </div>
            <span>
              <b>
                {currentTime !== "" &&
                  moment(new Date(currentTime)).format("LT")}
              </b>
            </span>
          </Grid>
        </Grid>
        <Grid container className={"tab-container"}>
          <Grid
            className={selectedTab === "one" ? "selected tab1" : "tab1"}
            item
            xs={2}
            onClick={() => handleTabChange("one")}
          >
            <WbSunnyIcon />
            &nbsp;WEATHER
          </Grid>
          <Grid
            className={selectedTab === "two" ? "selected tab2" : "tab2"}
            item
            xs={2}
            onClick={() => handleTabChange("two")}
          >
            <AnnouncementIcon className={"blink_me"} />
            &nbsp;Alerts
          </Grid>
        </Grid>
      </Grid>
      <Grid container className={"tab-content"}>
        {selectedTab === "one" && (
          <>
            <Grid item xs={4} className={"tab-content__left"}>
              {weatherDetails && (
                <Grid container>
                  <Grid item xs={6}>
                    <div className={"tab-content__left__content"}>
                      <span>
                        {Math.round(weatherDetails?.temp)}
                        <sup className={"tab-content__left__content__temp"}>
                          o
                        </sup>
                      </span>
                    </div>
                    <div className={"tab-content__left__content__day"}>
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
                      <b className={"tab-content__left__content__speed"}>
                        {Math.round(weatherDetails?.wind_speed * 3.6)} km/hr
                        &nbsp;
                      </b>
                    </div>
                  </Grid>
                </Grid>
              )}
            </Grid>
            <Grid item xs={8} className={"forecast-container"}>
              <Grid container>
                {dailyForecast &&
                  dailyForecast.map((item: any, index: any) => (
                    <Grid item xs={2} key={index} className={"border"}>
                      <h3 className={"day"}>{item.day.toUpperCase()}</h3>
                      <div className={"forecast-container__weatherType"}>
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
                      <p className={"forecast-container__temp"}>
                        <strong>
                          {Math.round(item.temp)}
                          <sup className={"forecast-container__temp__sub"}>
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
        {selectedTab === "two" && (
          <div className={"scroll-container"}>
            <Grid container className={"scroll-container__text"}>
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
          </div>
        )}
      </Grid>
    </div>
  );
};

export default WeatherPopup;
