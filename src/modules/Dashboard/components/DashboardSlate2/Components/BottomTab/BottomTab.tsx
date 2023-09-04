import { KeyboardArrowRight as KeyboardArrowRightIcon } from "@material-ui/icons";
import ClassicIcon from "@mui/icons-material/BrowseGallery";
import LibraryIcon from "@mui/icons-material/Collections";
import moment from "moment";
import React, { useContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import {
  handleBottomMenus,
  setZIndexPriority,
} from "src/modules/root/context/authentication/action";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import icon3 from "../../../../../../assets/images/icon3.png";
import gif from "../../../../../../assets/images/weather.svg";
import SwipeWrapper from "../../Shared/SwipeWrapper/SwipeWrapper";
import HorizontalTimeline from "../HorizontalTimeline/HorizontalTimeline";
import TaskAndNewsCard from "../TaskAndNewsCard/TaskAndNewsCard";
import WeatherComponent from "../WeatherComponent/WeatherComponent";
import "./BottomTab.scss";

const BottomTab = (): React.ReactElement => {
  const history: any = useHistory();
  const { state, dispatch }: any = useContext(stateContext);

  useEffect(() => {
    !state.bottomMenu.showBottomMenu &&
      state?.zIndexPriority === "bottomMenu" &&
      dispatch(setZIndexPriority(""));
  }, [state.bottomMenu.showBottomMenu, state?.zIndexPriority]);

  return (
    <div
      style={{
        transition: state.bottomMenu?.showBottomMenu ? "none" : "all 4s ease",
        zIndex:
          state?.zIndexPriority === "bottomMenu" ||
          state?.zIndexPriority === "weatherComponent" ||
          state?.zIndexPriority === "taskAndNewsCard"
            ? 3
            : -1,
      }}
      className="bottomTab-main"
      onClick={() => dispatch(setZIndexPriority("bottomMenu"))}
    >
      <div
        className={`${
          state.bottomMenu?.showBottomMenu
            ? "bottomTab-main__activeBar"
            : "bottomTab-main__inactiveBar"
        } bottomTab-main__container`}
      >
        <div className="bottomTab-main__container__leftContainer">
          <div>
            <img
              className="bottomTab-main__container__leftContainer__imgIcon"
              src={gif}
              onClick={(e: any) => {
                e.stopPropagation();
                dispatch(setZIndexPriority("weatherComponent"));
                dispatch(
                  handleBottomMenus({
                    ...state.bottomMenu,
                    showWeatherPopup: !state.bottomMenu.showWeatherPopup,
                  })
                );
              }}
            />
          </div>
        </div>
        <div className="bottomTab-main__container__centerContainer">
          <div className="bottomTab-main__container__centerContainer__timelineContainer">
            <HorizontalTimeline
              startDate={moment("01/01/2022")}
              uploadDates={[
                moment("01/04/2022").format("DD/MMM/YYYY ddd"),
                moment("05/19/2022").format("DD/MMM/YYYY ddd"),
                moment("11/20/2022").format("DD/MMM/YYYY ddd"),
                moment("01/01/2023").format("DD/MMM/YYYY ddd"),
                moment("01/02/2023").format("DD/MMM/YYYY ddd"),
                moment("02/20/2023").format("DD/MMM/YYYY ddd"),
                moment().format("DD/MMM/YYYY ddd"),
              ]}
            />
          </div>
        </div>
        <div className="bottomTab-main__container__rightContainer">
          <div>
            <img
              src={icon3}
              className="bottomTab-main__container__rightContainer__imgIcon"
              onClick={(e: any) => {
                e.stopPropagation();
                dispatch(setZIndexPriority("taskAndNewsCard"));
                dispatch(
                  handleBottomMenus({
                    ...state.bottomMenu,
                    showTaskAndNewsCard: true,
                  })
                );
              }}
            />
          </div>

          {/* {state?.selectedPreference?.menuItems?.map((item: any, i: number) => (
            <div key={i}>
              {item === 'Schedule' && (
                <img
                  src={icon3}
                  className="bottomTab-main__container__rightContainer__imgIcon"
                  onClick={() => {
                    history.push(
                      `/scheduling/project-plan/${state.currentProject?.projectId}`
                    );
                  }}
                />
              )}
              {item === 'Classic' && (
                <ClassicIcon
                  className="bottomTab-main__container__rightContainer__materialIcon"
                  onClick={() => {
                    history.push(
                      `/scheduling/project-plan/${state.currentProject?.projectId}`
                    );
                    sessionStorage.setItem('level', 'project');
                    sessionStorage.setItem('dashboardType', 'classic');
                    history.push('/');
                    location.reload();
                  }}
                />
              )}
              {item === 'Library' && (
                <LibraryIcon
                  className="bottomTab-main__container__rightContainer__materialIcon"
                  onClick={() => {
                    history.push(
                      `/documentlibrary/projects/${state.currentProject?.projectId}`
                    );
                  }}
                />
              )}
            </div>
          ))} */}

          <KeyboardArrowRightIcon
            className="bottomTab-main__closeIcon"
            onClick={() => {
              dispatch(
                handleBottomMenus({
                  ...state.bottomMenu,
                  showTaskAndNewsCard: false,
                  showWeatherPopup: false,
                  showBottomMenu: false,
                })
              );
            }}
          />
        </div>
      </div>

      <SwipeWrapper
        open={state.bottomMenu?.showWeatherPopup}
        placement={{ right: "20%", bottom: 70 }}
        width={"60%"}
        animationType={"bottomToTop"}
        height={"auto"}
        zIndexPriority={state?.zIndexPriority === "weatherComponent"}
      >
        <WeatherComponent
          open={state.bottomMenu?.showWeatherPopup}
          handleClose={() =>
            dispatch(
              handleBottomMenus({
                ...state.bottomMenu,
                showWeatherPopup: false,
              })
            )
          }
        />
      </SwipeWrapper>
      <SwipeWrapper
        open={state.bottomMenu?.showTaskAndNewsCard}
        placement={{ right: "8%", bottom: 70 }}
        width={"40rem"}
        animationType={"bottomToTop"}
        height={"78%"}
        zIndexPriority={state?.zIndexPriority === "taskAndNewsCard"}
      >
        {state.bottomMenu?.showTaskAndNewsCard && (
          <TaskAndNewsCard
            open={state.bottomMenu?.showTaskAndNewsCard}
            handleClose={() =>
              dispatch(
                handleBottomMenus({
                  ...state.bottomMenu,
                  showTaskAndNewsCard: false,
                })
              )
            }
          />
        )}
      </SwipeWrapper>
    </div>
  );
};

export default BottomTab;
