import { SourceSystemType } from "src/modules/connectors/utils/types";
import { Action } from "../../../../models/context";
import { initialState } from "./reducer";
export const IS_AUTHENTICATED = "IS_AUTHENTICATED";
export const USERNAME = "USERNAME";
export const ISLOADING = "ISLOADING";
export const PROJECTS = "PROJECTS";
export const SELECTEDPROJECT = "SELECTEDPROJECT";
export const PROJECTTOKEN = "PROJECTTOKEN";
export const PREVIOUS_FEATURE = "PREVIOUS_FEATURE";
export const LOGOUT = "LOGOUT";
export const IS_DRAWER_OPEN = "IS_DRAWER_OPEN";
export const REFRESH_PROJECTS = "REFRESH_PROJECTS";
export const PROJECT_FEATURE_PERMISSIONS = "PROJECT_FEATURE_PERMISSIONS";
export const SET_PORTFOLIO_LIST = "SET_PORTFOLIO_LIST";
export const SET_PROJECT_LIST = "SET_PROJECT_LIST";
export const SET_CURRENT_PORTFOLIO = "SET_CURRENT_PORTFOLIO";
export const SET_CURRENT_PROJECT = "SET_CURRENT_PROJECT";
export const SET_CURRENT_LEVEL = "SET_CURRENT_LEVEL";
export const SET_CURRENT_THEME = "SET_CURRENT_THEME";
export const SET_PREFERENCE = "SET_PREFERENCE";
export const SET_PROJECT_INFO = "SET_PROJECT_INFO";
export const SET_PORTFOLIO_INFO = "SET_PORTFOLIO_INFO";
export const SET_PORTFOLIO_WIDGET_SETTINGS = "SET_PORTFOLIO_WIDGET_SETTINGS";
export const SET_PROJECT_WIDGET_SETTINGS = "SET_PROJECT_WIDGET_SETTINGS";
export const GET_PROJECT_LIST_ON_UPDATE = "GET_PROJECT_LIST_ON_UPDATE";
export const SET_HEADER_SHOWN = "SET_HEADER_SHOWN";
export const SET_EDGE_CENTER = "SET_EDGE_CENTER";
export const SET_SELECTED_MENU = "SET_SELECTED_MENU";
export const SET_IS_ABOUT_TO_LOGOUT = "SET_IS_ABOUT_TO_LOGOUT";
export const SET_PREVIOUS_ROUTE = "SET_PREVIOUS_ROUTE";
export const SET_EDITMODE = "SET_EDITMODE";
export const SET_TENANT_SWITCH = "SET_TENANT_SWITCH";
export const IS_ONX_HOMES_TENANT = "IS_ONX_HOMES_TENANT";
export const SET_PROJECT_WEATHER_DETAILS = "SET_PROJECT_WEATHER_DETAILS";
export const FETCH_INSPECTION_FORM_FEATURE_ID =
  "FETCH_INSPECTION_FORM_FEATURE_ID";
export const SET_NOTIFICATION_BADGE_COUNT = "SET_NOTIFICATION_BADGE_COUNT";
export const NOTIFICATION_LOADING = "NOTIFICATION_LOADING";
export const NOTIFICATION_LOADED = "NOTIFICATION_LOADED";
export const NOTIFICATION_ERROR = "NOTIFICATION_ERROR";
export const NOTIFICATION_RESET = "NOTIFICATION_RESET";
export const TRIGGER_FETCH = "TRIGGER_FETCH";
export const SET_PRODUCTIVITY_INSIGHTS = "SET_PRODUCTIVITY_INSIGHTS";
export const SET_SHOW_METRICS_POP_UP = "SET_SHOW_METRICS_POP_UP";
export const HANDLE_BOTTOM_MENUS = "HANDLE_BOTTOM_MENUS";
export const HANDLE_INSIGHT_METRIC = "HANDLE_INSIGHT_METRIC";
export const SET_DASHBOARD_TYPE = "SET_DASHBOARD_TYPE";
export const SET_ZINDEX_PRIORITY = "SET_ZINDEX_PRIORITY";
export const SET_CHAT_TEXT = "SET_CHAT_TEXT";
export const IS_NEW_SLATE_VERSION = "IS_NEW_SLATE_VERSION";
export const SET_SOURCE_SYSTEM = "SET_SOURCE_SYSTEM";
export const CHAT_LOCAION = "CHAT_LOCAION";
export const NO_PROJECT_FOUND = "NO_PROJECT_FOUND";
export const PHASES_CHANGE="PHASES_CHANGE";
export const PASSWORD_CONFIG= "PASSWORD_CONFIG";

export const setNoProjectFound = (payload: boolean): Action => {
  return {
    type: NO_PROJECT_FOUND,
    payload,
  };
};
export const setphaseChanges  = (payload: boolean): Action => {
  return {
    type: PHASES_CHANGE,
    payload,
  };
};

export const setIsAuthenticated = (payload: boolean): Action => {
  return {
    type: IS_AUTHENTICATED,
    payload,
  };
};

export const setUserName = (payload: string): Action => {
  return {
    type: USERNAME,
    payload,
  };
};

export const setIsLoading = (payload: boolean): Action => {
  return {
    type: ISLOADING,
    payload,
  };
};

export const setProjects = (payload: any[]): Action => {
  return {
    type: PROJECTS,
    payload,
  };
};

export const setSelectedProject = (payload: any): Action => {
  return {
    type: SELECTEDPROJECT,
    payload,
  };
};

export const setProjectToken = (payload: string): Action => {
  return {
    type: PROJECTTOKEN,
    payload,
  };
};

export const setPreviousFeature = (payload: any): Action => {
  return {
    type: PREVIOUS_FEATURE,
    payload,
  };
};

export const setLogout = (): Action => {
  return {
    type: LOGOUT,
    payload: "",
  };
};

export const setDrawerOpen = (payload: boolean): Action => {
  return {
    type: IS_DRAWER_OPEN,
    payload,
  };
};

export const setRefreshProjects = (payload: boolean): Action => {
  return {
    type: REFRESH_PROJECTS,
    payload,
  };
};

export const setProjectPermissions = (payload: any): Action => {
  return {
    type: PROJECT_FEATURE_PERMISSIONS,
    payload,
  };
};

export const setPortfolioList = (payload: any): Action => {
  return {
    type: SET_PORTFOLIO_LIST,
    payload,
  };
};

export const setProjectList = (payload: any): Action => {
  return {
    type: SET_PROJECT_LIST,
    payload,
  };
};

export const setCurrentPortfolio = (payload: any): Action => {
  return {
    type: SET_CURRENT_PORTFOLIO,
    payload,
  };
};

export const setCurrentProject = (payload: any): Action => {
  return {
    type: SET_CURRENT_PROJECT,
    payload,
  };
};

export const setProjectInfo = (payload: any): Action => {
  return {
    type: SET_PROJECT_INFO,
    payload,
  };
};

export const setPortfolioInfo = (payload: any): Action => {
  return {
    type: SET_PORTFOLIO_INFO,
    payload,
  };
};

export const setHeaderShown = (payload: any): Action => {
  return {
    type: SET_HEADER_SHOWN,
    payload,
  };
};

export const setPreference = (payload: any): Action => {
  return {
    type: SET_PREFERENCE,
    payload,
  };
};

export const setProjectSettings = (payload: any): Action => {
  return {
    type: SET_PROJECT_WIDGET_SETTINGS,
    payload,
  };
};

export const setPortfolioSettings = (payload: any): Action => {
  return {
    type: SET_PORTFOLIO_WIDGET_SETTINGS,
    payload,
  };
};

export const setCurrentLevel = (payload: any): Action => {
  return {
    type: SET_CURRENT_LEVEL,
    payload,
  };
};

export const setCurrentTheme = (payload: any): Action => {
  return {
    type: SET_CURRENT_THEME,
    payload,
  };
};

export const updateProjectList = (payload: any): Action => {
  return {
    type: GET_PROJECT_LIST_ON_UPDATE,
    payload,
  };
};

export const setEdgeCenter = (payload: any): Action => {
  return {
    type: SET_EDGE_CENTER,
    payload,
  };
};

export const setSelectedMenu = (payload: any): Action => {
  return {
    type: SET_SELECTED_MENU,
    payload,
  };
};

export const setIsAboutToLogout = (payload: boolean): Action => {
  return {
    type: SET_IS_ABOUT_TO_LOGOUT,
    payload,
  };
};

export const setPreviousRoute = (payload: any): Action => {
  return {
    type: SET_PREVIOUS_ROUTE,
    payload,
  };
};

export const setEditMode = (payload: boolean): Action => {
  return {
    type: SET_EDITMODE,
    payload,
  };
};

export const setTenantSwitch = (payload: boolean): Action => {
  return {
    type: SET_TENANT_SWITCH,
    payload,
  };
};

export const setIsOnxTenant = (payload: boolean): Action => {
  return {
    type: IS_ONX_HOMES_TENANT,
    payload,
  };
};

export const setNotificationBadgeCount = (payload: number): Action => {
  return {
    type: SET_NOTIFICATION_BADGE_COUNT,
    payload,
  };
};

export const setProjectWeatherDetails = (payload: boolean): Action => {
  return {
    type: SET_PROJECT_WEATHER_DETAILS,
    payload,
  };
};

export const setInspectionFormFeatureId = (payload: any) => {
  return {
    type: FETCH_INSPECTION_FORM_FEATURE_ID,
    payload,
  };
};
export const setNotificationLoading = (): any => {
  return { type: NOTIFICATION_LOADING };
};

export const setNotificationLoaded = (payload: any): Action => {
  return {
    type: NOTIFICATION_LOADED,
    payload: payload,
  };
};

export const setNotificationTriggerFetch = (payload: any): Action => {
  return {
    type: TRIGGER_FETCH,
    payload: payload,
  };
};

export const setNotificationError = (): any => {
  return { type: NOTIFICATION_ERROR };
};

export const setProductivityInsights = (payload: any): Action => {
  return {
    type: SET_PRODUCTIVITY_INSIGHTS,
    payload: payload,
  };
};

export const setShowMetricsPopup = (payload: any): Action => {
  return {
    type: SET_SHOW_METRICS_POP_UP,
    payload: payload,
  };
};

export const handleBottomMenus = (payload: any): Action => {
  return {
    type: HANDLE_BOTTOM_MENUS,
    payload: payload,
  };
};

export const handleInsightMetric = (payload: any): Action => {
  return {
    type: HANDLE_INSIGHT_METRIC,
    payload: payload,
  };
};

export const setDashboardType = (payload: any): Action => {
  return {
    type: SET_DASHBOARD_TYPE,
    payload: payload,
  };
};

export const setZIndexPriority = (payload: any): Action => {
  return {
    type: SET_ZINDEX_PRIORITY,
    payload: payload,
  };
};

export const setChatText = (payload: any): Action => {
  return {
    type: SET_CHAT_TEXT,
    payload: payload,
  };
};
export const setIsNewSlateVersion = (payload: boolean): Action => {
  return {
    type: IS_NEW_SLATE_VERSION,
    payload,
  };
};

export const setSourceSystem = (payload: SourceSystemType): Action => ({
  type: SET_SOURCE_SYSTEM,
  payload,
});

export const setChatLocation = (payload: string): Action => ({
  type: CHAT_LOCAION,
  payload,
});

export const setPasswordConfig = (payload:any)=>({
  type:PASSWORD_CONFIG,
  payload,
})