import { Action } from "../../../../models/context";
import {
  IS_AUTHENTICATED,
  USERNAME,
  ISLOADING,
  PROJECTS,
  SELECTEDPROJECT,
  PREVIOUS_FEATURE,
  PROJECTTOKEN,
  IS_DRAWER_OPEN,
  REFRESH_PROJECTS,
  PROJECT_FEATURE_PERMISSIONS,
  LOGOUT,
  SET_CURRENT_PORTFOLIO,
  SET_CURRENT_PROJECT,
  SET_PROJECT_WIDGET_SETTINGS,
  SET_PORTFOLIO_WIDGET_SETTINGS,
  SET_PORTFOLIO_LIST,
  SET_PROJECT_LIST,
  SET_CURRENT_LEVEL,
  SET_CURRENT_THEME,
  SET_PROJECT_INFO,
  SET_PORTFOLIO_INFO,
  SET_PREFERENCE,
  SET_HEADER_SHOWN,
  GET_PROJECT_LIST_ON_UPDATE,
  SET_EDGE_CENTER,
  SET_SELECTED_MENU,
  SET_IS_ABOUT_TO_LOGOUT,
  SET_PREVIOUS_ROUTE,
  SET_EDITMODE,
  SET_TENANT_SWITCH,
  SET_NOTIFICATION_BADGE_COUNT,
  NOTIFICATION_LOADING,
  NOTIFICATION_LOADED,
  NOTIFICATION_ERROR,
  NOTIFICATION_RESET,
  TRIGGER_FETCH,
  IS_ONX_HOMES_TENANT,
  SET_PROJECT_WEATHER_DETAILS,
  FETCH_INSPECTION_FORM_FEATURE_ID,
  SET_PRODUCTIVITY_INSIGHTS,
  HANDLE_BOTTOM_MENUS,
  SET_SHOW_METRICS_POP_UP,
  HANDLE_INSIGHT_METRIC,
  SET_DASHBOARD_TYPE,
  SET_ZINDEX_PRIORITY,
  SET_CHAT_TEXT,
  IS_NEW_SLATE_VERSION,
  SET_SOURCE_SYSTEM,
  CHAT_LOCAION,
  NO_PROJECT_FOUND,
  PHASES_CHANGE,
  PASSWORD_CONFIG,
  // IS_ONX_HOMES_TENANT,
} from "./action";
import {
  decodeExchangeToken,
  getExchangeToken,
} from "../../../../services/authservice";
import { AgaveLinkType } from "src/modules/connectors/utils/types";

export enum CURRENT_LEVEL {
  PROJECT = "project",
  PORTFOLIO = "portfolio",
  TENAANT = "tenant",
}

export interface Authentication {
  isAuthenticated: boolean;
  userName: string;
  isLoading: boolean;
  projects: any[];
  selectedProject: any;
  selectedProjectToken: string | null;
  previousFeature: any;
  isDrawerOpen: boolean;
  refreshProjects: boolean;
  projectFeaturePermissons: any;
  portfolioList: any[];
  projectList: any[];
  currentPortfolio: any;
  currentProject: any;
  projectWidgetSettings: any;
  portfolioWidgetSettings: any;
  selectedPreference: any;
  headerShown: boolean;
  projectInfo: any;
  portfolioInfo: any;
  currentLevel: CURRENT_LEVEL;
  currentTheme: any;
  getProjectList: boolean;
  edgeCenter: any;
  selectedMenu: string;
  isAboutToLogout: boolean;
  previousRotue: string;
  editMode: boolean;
  tenantSwitch: boolean;
  notificationBadgeCount: number;
  notification: any;
  isNotificationError: boolean;
  isNotificationLoading: boolean;
  triggerNotificationFetch: boolean;
  isOnxTenant: any;
  projectWeatherDetails: any;
  inspectionFormFeatureId: any;
  productivityInsights: any;
  showMetricsPopup: boolean;
  bottomMenu: any;
  selectedMetric: any;
  dashboardType: string;
  zIndexPriority: string;
  chatText: any;
  isNewSlateVersion: boolean;
  sourceSystem: AgaveLinkType | null;
  chatLocation: string | null;
  noProjectFound:boolean;
  phases:any,
  passwordConfig:any
}

const isAuthenticated = () => {
  if (getExchangeToken()) {
    const decodedToken = decodeExchangeToken();
    const current = new Date().getTime() / 1000;
    if (current < decodedToken.exp) {
      return true;
    }
  }
  if (
    !location.href.includes("login") &&
    location.pathname != "/" &&
    location.pathname !== "/reset-password" &&
    location.pathname !== "/forgot-password" &&
    location.pathname !== "/signup"
  ) {
    localStorage.setItem("redirectURL", location.href);
  }
  return false;
};

const portfolioSettings: any = sessionStorage.getItem(
  "portfolioWidgetSettings"
);

export const initialState: Authentication = {
  isAuthenticated: isAuthenticated(),
  userName: "",
  isLoading: false,
  projects: [],
  selectedProject: null,
  selectedProjectToken: null,
  previousFeature: null,
  isDrawerOpen: false,
  refreshProjects: false,
  projectFeaturePermissons: null,
  portfolioList: [],
  projectList: [
    {
      projectId: 0,
      projectName: "All",
      isRecent: true,
    },
  ],
  currentPortfolio: {},
  currentProject: {
    projectId: 0,
    projectName: "All",
    isRecent: true,
  },
  projectInfo: {},
  headerShown: false,
  portfolioInfo: {},
  selectedPreference: {},
  projectWidgetSettings: JSON.parse(portfolioSettings) || {},
  portfolioWidgetSettings: JSON.parse(portfolioSettings) || {},
  currentLevel:
    (sessionStorage.getItem("level") as CURRENT_LEVEL) ||
    CURRENT_LEVEL.PORTFOLIO,
  currentTheme: null,
  getProjectList: false,
  edgeCenter: [],
  selectedMenu: sessionStorage.getItem("selectedMenu") || "Home",
  isAboutToLogout: false,
  previousRotue: "",
  editMode: false,
  tenantSwitch: false,
  notificationBadgeCount: 0,
  notification: [],
  isNotificationError: false,
  isNotificationLoading: false,
  triggerNotificationFetch: false,
  isOnxTenant: null,
  projectWeatherDetails: {
    name: "",
    main: { humidity: 0, temp: 0 },
    weather: [{ main: "", icon: "" }],
    wind_speed: 0,
    temp: 0,
    day: "",
  },
  inspectionFormFeatureId: null,
  productivityInsights: [],
  showMetricsPopup: false,
  bottomMenu: {
    showBottomMenu: null,
    showWeatherPopup: null,
    showTaskAndNewsCard: null,
    showNotificationPopup: null,
    showChatPanel: null,
    showSlate2SideMenu: null,
  },
  selectedMetric: "Budget",
  dashboardType: sessionStorage.getItem("dashboardType") || "slate2.0",
  zIndexPriority: "",
  chatText: "",
  isNewSlateVersion: false,
  sourceSystem: null,
  chatLocation: null,
  noProjectFound:false,
  phases:null,
  passwordConfig:{
    minLength: 8,
		maxLength: 12,
		minUpperCase: 0,
		minNumeric: 0,
		minSpecialChar: 0,
  }
};

export const stateReducer = (
  state: Authentication = initialState,
  action: Action
): Authentication => {
  switch (action.type) {
    case IS_AUTHENTICATED: {
      return {
        ...state,
        isAuthenticated: action.payload,
      };
    }
    case USERNAME: {
      return {
        ...state,
        userName: action.payload,
      };
    }
    case ISLOADING: {
      return {
        ...state,
        isLoading: action.payload,
      };
    }
    case PROJECTS: {
      return {
        ...state,
        projects: action.payload,
      };
    }
    case SELECTEDPROJECT: {
      return {
        ...state,
        selectedProject: action.payload,
      };
    }
    case PROJECTTOKEN: {
      return {
        ...state,
        selectedProjectToken: action.payload,
      };
    }
    case PREVIOUS_FEATURE: {
      return {
        ...state,
        previousFeature: action.payload,
      };
    }
    case IS_DRAWER_OPEN: {
      return {
        ...state,
        isDrawerOpen: action.payload,
      };
    }
    case LOGOUT: {
      return {
        ...initialState,
      };
    }
    case REFRESH_PROJECTS: {
      return {
        ...state,
        refreshProjects: action.payload,
      };
    }
    case PROJECT_FEATURE_PERMISSIONS: {
      return {
        ...state,
        projectFeaturePermissons: action.payload,
      };
    }
    case SET_PORTFOLIO_LIST: {
      return {
        ...state,
        portfolioList: action.payload,
      };
    }
    case SET_PROJECT_LIST: {
      return {
        ...state,
        projectList: action.payload,
      };
    }
    case SET_CURRENT_PORTFOLIO: {
      return {
        ...state,
        currentPortfolio: action.payload,
      };
    }
    case SET_CURRENT_PROJECT: {
      return {
        ...state,
        currentProject: action.payload,
      };
    }
    case SET_PROJECT_INFO: {
      return {
        ...state,
        projectInfo: action.payload,
      };
    }
    case SET_PORTFOLIO_INFO: {
      return {
        ...state,
        portfolioInfo: action.payload,
      };
    }
    case SET_PREFERENCE: {
      return {
        ...state,
        selectedPreference: action.payload,
      };
    }
    case SET_HEADER_SHOWN: {
      return {
        ...state,
        headerShown: action.payload,
      };
    }
    case SET_PROJECT_WIDGET_SETTINGS: {
      return {
        ...state,
        projectWidgetSettings: action.payload,
      };
    }
    case SET_PORTFOLIO_WIDGET_SETTINGS: {
      return {
        ...state,
        portfolioWidgetSettings: action.payload,
      };
    }
    case SET_CURRENT_LEVEL: {
      return {
        ...state,
        currentLevel: action.payload,
      };
    }
    case SET_CURRENT_THEME: {
      return {
        ...state,
        currentTheme: action.payload,
      };
    }
    case GET_PROJECT_LIST_ON_UPDATE: {
      return {
        ...state,
        getProjectList: action.payload,
      };
    }
    case SET_EDGE_CENTER: {
      return {
        ...state,
        edgeCenter: action.payload,
      };
    }
    case SET_SELECTED_MENU: {
      return {
        ...state,
        selectedMenu: action.payload,
      };
    }
    case SET_IS_ABOUT_TO_LOGOUT: {
      return {
        ...state,
        isAboutToLogout: action.payload,
      };
    }
    case SET_PREVIOUS_ROUTE: {
      return {
        ...state,
        previousRotue: action.payload,
      };
    }
    case SET_EDITMODE: {
      return {
        ...state,
        editMode: action.payload,
      };
    }
    case SET_TENANT_SWITCH: {
      return {
        ...state,
        tenantSwitch: action.payload,
        portfolioList: action.payload ? [] : state?.portfolioList,
        projectList: action.payload
          ? [
              {
                projectId: 0,
                projectName: "All",
                isRecent: true,
              },
            ]
          : state?.projectList,
        currentPortfolio: action.payload ? {} : state?.currentPortfolio,
        currentProject: action.payload
          ? {
              projectId: 0,
              projectName: "All",
              isRecent: true,
            }
          : state?.currentProject,
        projectInfo: action.payload ? {} : state?.projectInfo,
        portfolioInfo: action.payload ? {} : state?.portfolioInfo,
      };
    }
    case IS_ONX_HOMES_TENANT: {
      return {
        ...state,
        isOnxTenant:
          action.payload?.toLowerCase()?.includes("onx") === true
            ? true
            : false,
      };
    }
    case SET_PROJECT_WEATHER_DETAILS: {
      return {
        ...state,
        projectWeatherDetails: action.payload,
      };
    }
    case FETCH_INSPECTION_FORM_FEATURE_ID: {
      return {
        ...state,
        inspectionFormFeatureId: action.payload,
      };
    }
    case SET_NOTIFICATION_BADGE_COUNT: {
      return {
        ...state,
        notificationBadgeCount: action.payload,
      };
    }
    case NOTIFICATION_LOADING: {
      return {
        ...state,
        isNotificationLoading: true,
        isNotificationError: false,
      };
    }
    case NOTIFICATION_LOADED:
      return {
        ...state,
        notification: action.payload,
        isNotificationLoading: false,
        isNotificationError: false,
      };
    case NOTIFICATION_ERROR:
      return {
        ...state,
        isNotificationLoading: false,
        isNotificationError: true,
      };
    case NOTIFICATION_RESET:
      return {
        ...state,
        isNotificationLoading: false,
        isNotificationError: false,
      };
    case SET_PRODUCTIVITY_INSIGHTS:
      return {
        ...state,
        productivityInsights: action.payload,
      };
    case TRIGGER_FETCH:
      return { ...state, triggerNotificationFetch: action.payload };
    case SET_SHOW_METRICS_POP_UP: {
      return {
        ...state,
        showMetricsPopup: action.payload,
      };
    }
    case HANDLE_BOTTOM_MENUS: {
      return {
        ...state,
        bottomMenu: action.payload,
      };
    }
    case HANDLE_INSIGHT_METRIC: {
      return {
        ...state,
        selectedMetric: action.payload,
      };
    }
    case SET_DASHBOARD_TYPE: {
      return {
        ...state,
        dashboardType: action.payload,
      };
    }
    case SET_ZINDEX_PRIORITY: {
      return {
        ...state,
        zIndexPriority: action.payload,
      };
    }
    case SET_CHAT_TEXT: {
      return {
        ...state,
        chatText: action.payload,
      };
    }
    case IS_NEW_SLATE_VERSION:
      return {
        ...state,
        isNewSlateVersion: action.payload,
      };
    case SET_SOURCE_SYSTEM:
      return { ...state, sourceSystem: action.payload };
    case CHAT_LOCAION:
      return {
        ...state,
        chatLocation: action.payload,
      };
      case NO_PROJECT_FOUND:
        return {
          ...state,
          noProjectFound: action.payload,
        };
          case PHASES_CHANGE:
        return {
          ...state,
          phases: action.payload,
        };
      case PASSWORD_CONFIG:
      return{
        ...state,
        passwordConfig:action.payload
      }
    default:
      return state;
  }
};
