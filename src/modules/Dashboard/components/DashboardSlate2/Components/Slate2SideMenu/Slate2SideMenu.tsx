import React, { useContext } from "react";
import { Tooltip } from "@material-ui/core";
import {
  UsbTwoTone as UsbIcon,
  Assignment as ScheduleIcon,
  ListAlt as FormsIcon,
  CastForEducation as CastForEducationIcon,
} from "@material-ui/icons";
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import "./Slate2SideMenu.scss";
import { stateContext } from "src/modules/root/context/authentication/authContext";
import {
  handleBottomMenus,
  setCurrentLevel,
  setZIndexPriority,
} from "src/modules/root/context/authentication/action";
import { useHistory } from "react-router-dom";
import { decodeToken } from "src/services/authservice";
import { DrawingsIcon } from "src/modules/root/components/Sidebar/IconList";
import {
  CollectionsBookmarkOutlined as BookMark,
  Business as BusinessIcon,
  BorderColorOutlined as DailyLogIcon,
} from "@material-ui/icons";
import ClassicIcon from "@mui/icons-material/BrowseGallery";
import LibraryIcon from "@mui/icons-material/Collections";

const Slate2SideMenu = ({ pathname }: any): React.ReactElement => {
  const history = useHistory();
  const { dispatch, state }: any = useContext(stateContext);
  const { adminUser } = decodeToken();

  const handleDockedIconClick = (item: string) => {
    dispatch(setCurrentLevel("project"));
    sessionStorage.setItem("level", "project");
    if (item === "Schedule") {
      history.push(
        `/scheduling/project-plan/${state.currentProject?.projectId}`
      );
    } else if (item === "Classic") {
      history.push(
        `/scheduling/project-plan/${state.currentProject?.projectId}`
      );
      sessionStorage.setItem("dashboardType", "classic");
      history.push("/");
      location.reload();
    } else if (item === "Library") {
      history.push(
        `/documentlibrary/projects/${state.currentProject?.projectId}`
      );
    } else if (item === "Drawings") {
      history.push(
        `/drawings/projects/${state.currentProject?.projectId}/lists`
      );
    } else if (item === "Models") {
      history.push(`/bim/${state.currentProject?.projectId}/list`);
    } else if (item === "Specifications") {
      history.push(
        `/specifications/projects/${state.currentProject?.projectId}/lists`
      );
    } else if (item === "DailyLogs") {
      history.push(`/dailyLogs/projects/${state.currentProject?.projectId}`);
    }
  };

  const handleDockSelectedMenuItem = (item: string) => {
    if (item === "Schedule" && pathname.includes("scheduling")) {
      return "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected";
    } else if (item === "Library" && pathname.includes("documentlibrary")) {
      return "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected";
    } else if (item === "Drawings" && pathname.includes("drawings")) {
      return "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected";
    } else if (item === "Models" && pathname.includes("bim")) {
      return "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected";
    } else if (
      item === "Specifications" &&
      pathname.includes("specifications")
    ) {
      return "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected";
    } else if (item === "DailyLogs" && pathname.includes("dailyLogs")) {
      return "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected";
    } else {
      return "slate2SideMenu-main__iconContainer";
    }
  };

  return (
    <div className="slate2SideMenu-main">
      <Tooltip title="Insights" placement="top-end">
        <div
          className={
            state?.bottomMenu?.showNotificationPopup
              ? "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected"
              : "slate2SideMenu-main__iconContainer"
          }
          onClick={() => {
            dispatch(setZIndexPriority("insightNotification"));
            dispatch(
              handleBottomMenus({
                ...state.bottomMenu,
                showSlate2SideMenu: !state.bottomMenu.showSlate2SideMenu,
                showNotificationPopup: !state.bottomMenu.showNotificationPopup,
                showBottomMenu: false,
              })
            );
          }}
        >
          <CastForEducationIcon
            htmlColor={
              state?.bottomMenu?.showNotificationPopup ? "#fff" : "#f7b047"
            }
            className="slate2SideMenu-main__iconContainer__icon"
          />
          Insights
        </div>
      </Tooltip>
      {adminUser ? (
        <Tooltip title="Connectors" placement="top-end">
          <div
            className={
              pathname === "connectors"
                ? "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected"
                : "slate2SideMenu-main__iconContainer"
            }
            onClick={() => {
              history.push("/connectors");
            }}
          >
            <UsbIcon
              htmlColor={pathname === "connectors" ? "#fff" : "#f7b047"}
              className="slate2SideMenu-main__iconContainer__icon"
            />
            Connectors
          </div>
        </Tooltip>
      ) : null}
      <Tooltip title="Visualize" placement="top-end">
        <div
          className={
            pathname === "visualize"
              ? "slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected"
              : "slate2SideMenu-main__iconContainer"
          }
          onClick={() => {
            dispatch(setCurrentLevel("project"));
            sessionStorage.setItem("level", "project");
            history.push(`/visualize/${state.currentProject?.projectId}`);
          }}
        >
          <DomainAddIcon
            htmlColor={pathname.includes("visualize") ? "#fff" : "#f7b047"}
            className="slate2SideMenu-main__iconContainer__icon"
          />
          Visualize
        </div>
      </Tooltip>
      <Tooltip title="Forms" placement="top-end">
        <div
          className={
            pathname.includes("base")
              ? `slate2SideMenu-main__iconContainer slate2SideMenu-main__iconContainer__selected ${
                  !state?.selectedPreference?.menuItems?.length
                    ? "slate2SideMenu-main__iconContainer__noMargin"
                    : ""
                } `
              : `slate2SideMenu-main__iconContainer ${
                  !state?.selectedPreference?.menuItems?.length
                    ? "slate2SideMenu-main__iconContainer__noMargin"
                    : ""
                } `
          }
          onClick={() => {
            dispatch(setCurrentLevel("project"));
            sessionStorage.setItem("level", "project");
            history.push(
              `/base/projects/${state.currentProject?.projectId}/form/2`
            );
          }}
        >
          <FormsIcon
            htmlColor={pathname.includes("base") ? "#fff" : "#f7b047"}
            className="slate2SideMenu-main__iconContainer__icon"
          />
          Forms
        </div>
      </Tooltip>
      {state?.selectedPreference?.menuItems?.map((item: any, i: number) => (
        <Tooltip
          title={item === "Classic" ? "Engine Room" : item}
          placement="top-end"
        >
          <div
            className={handleDockSelectedMenuItem(item)}
            style={{
              marginBottom:
                i === state?.selectedPreference?.menuItems?.length - 1
                  ? "1rem"
                  : "3.5rem",
            }}
            onClick={() => handleDockedIconClick(item)}
          >
            {item === "Schedule" && (
              <ScheduleIcon
                htmlColor={pathname.includes("scheduling") ? "#fff" : "#f7b047"}
                className="slate2SideMenu-main__iconContainer__icon"
              />
            )}
            {item === "Classic" && (
              <ClassicIcon className="slate2SideMenu-main__iconContainer__icon" />
            )}
            {item === "Library" && (
              <LibraryIcon
                htmlColor={
                  pathname.includes("documentlibrary") ? "#fff" : "#f7b047"
                }
                className="slate2SideMenu-main__iconContainer__icon"
              />
            )}
            {item === "Drawings" && (
              <DrawingsIcon
                htmlColor={pathname.includes("drawings") ? "#fff" : "#f7b047"}
                className="slate2SideMenu-main__iconContainer__icon"
              />
            )}
            {item === "Models" && (
              <BusinessIcon
                htmlColor={pathname.includes("bim") ? "#fff" : "#f7b047"}
                className="slate2SideMenu-main__iconContainer__icon"
              />
            )}
            {item === "Specifications" && (
              <BookMark
                htmlColor={
                  pathname.includes("specifications") ? "#fff" : "#f7b047"
                }
                className="slate2SideMenu-main__iconContainer__icon"
              />
            )}
            {item === "DailyLogs" && (
              <DailyLogIcon
                htmlColor={pathname.includes("dailyLogs") ? "#fff" : "#f7b047"}
                className="slate2SideMenu-main__iconContainer__icon"
              />
            )}
            {item === "Classic" ? "Engin..." : item}
          </div>
        </Tooltip>
      ))}
    </div>
  );
};

export default Slate2SideMenu;
