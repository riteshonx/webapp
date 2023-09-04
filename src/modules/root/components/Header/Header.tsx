import {
  AppBar,
  Badge,
  CssBaseline,
  IconButton,
  Menu,
  MenuItem,
  Popover,
  SvgIcon,
  Toolbar,
  Tooltip,
  Typography,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import {
  AccountCircle,
  Notifications as NotificationsIcon,
  ExitToApp as LogoutIcon,
  Home as HomeIcon,
  ArrowLeft as ArrowLeftIcon,
  ArrowRight as ArrowRightIcon,
  UsbTwoTone as UsbIcon,
  BorderColorOutlined as DailyLogIcon,
  Business as BusinessIcon,
  Assignment as ScheduleIcon,
  CollectionsBookmarkOutlined as BookMark,
  Dock as DockIcon,
  Ballot as Ballot,
  CalendarToday as CalendarToday,
  Dashboard as DashboardIcon,
  EmojiPeople as EmojiPeople,
  Equalizer as EqualizerIcon,
  FolderOpen as FolderOpenIcon,
  Input as InputIcon,
  ListAlt as ListAltIcon,
  LowPriority as LowPriority,
  People as People,
  Receipt as Recipes,
} from "@material-ui/icons";
import { PhotoLibraryOutlined as DocumentLibraryIcon, GridView } from "@mui/icons-material";
import LockClockOutlinedIcon from '@mui/icons-material/LockClockOutlined';
// import MenuIcon from '@mui/icons-material/Menu';
import DomainAddIcon from "@mui/icons-material/DomainAdd";
import ClassicIcon from "@mui/icons-material/BrowseGallery";
import FitbitIcon from "@mui/icons-material/Fitbit";
import axios from "axios";
import classNames from "classnames";
import React, { useContext, useEffect, useState } from "react";
import { Prompt, useHistory, useLocation } from "react-router-dom";
import {
  DrawingsIcon,
  FormTemplateIcon,
  InsightsIcon,
  ListIcon,
  MaterialIcon,
  ProductivityIcon,
  projectSettingIcon,
  ProjectsIcon,
  TimelineIcon,
} from "src/modules/root/components/Sidebar/IconList";
import { PasswordConfigure } from "./MyProfile/PassworConfiguration/PasswordConfigure";
import {
  ExchangeToken,
  exchangeTokenFeatures,
  projectExchangeTokenFeatures,
} from "src/modules/authentication/utils";
import { initializeUserflow } from "src/modules/authentication/utils/userflow";
import {
  FETCH_TENANT_DETAILS,
  GET_TENANT_ROLE,
  UPDATE_TENANT_DETAILS,
} from "src/modules/Dashboard/graphql/queries/dashboard";
import DropdownSearch from "src/modules/shared/components/DropdownSearch/DropdownSearch";
import { usePCLMode } from "src/modules/visualize/VisualizeRouting/PCL/usePCLMode";
import { axiosApiInstance, postApiWithProjectExchange } from "src/services/api";
import { genFetchProjectNames } from "src/services/projectServices";
import SlateLogo from "../../../../assets/images/Logo_v2.svg";
import gif from "../../../../assets/images/weather.svg";
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined';
import {
  FETCH_MYPORJECT_PORTFOLIO,
  FETCH_PORTFOLIOS,
} from "../../../../graphhql/queries/projects";
import { postApi } from "../../../../services/api";
import {
  decodeExchangeToken,
  decodeProjectExchangeToken,
  decodeToken,
  getActiveTenantId,
  getAllExchangeToken,
  getExchangeToken,
  logout,
  setActiveTenantId,
  setExchangeToken,
  setProjectExchangeToken,
} from "../../../../services/authservice";
import { client } from "../../../../services/graphql";
import { themes } from "../../../../utils/constants";
import "./Header.scss";
import {
  myProjectRole,
  projectFeatureAllowedRoles,
  tenantRoles,
} from "../../../../utils/role";
import NotificationMessage, {
  AlertTypes,
} from "../../../shared/components/Toaster/Toaster";
import { CustomPopOver } from "../../../shared/utils/CustomPopOver";
import {
  handleBottomMenus,
  handleInsightMetric,
  setCurrentLevel,
  setCurrentPortfolio,
  setCurrentProject,
  setCurrentTheme,
  setDrawerOpen,
  setEditMode,
  setInspectionFormFeatureId,
  setIsAboutToLogout,
  setIsLoading,
  setIsOnxTenant,
  setLogout,
  setNotificationBadgeCount,
  setPortfolioList,
  setPreference,
  setProjectList,
  setProjectPermissions,
  setProjectSettings,
  setProjectToken,
  setSelectedMenu,
  setSelectedProject,
  setTenantSwitch,
  setZIndexPriority,
  setNoProjectFound,
} from "../../context/authentication/action";
import { stateContext } from "../../context/authentication/authContext";
import RootNavigation from "../../pages/RootNavigation/RootNavigation";
import { CustomThemeContext } from "../Themes/CustomThemeProvider";
import AddTenantDialog from "./AddTenantDialog";
import HorizontalNavbar from "./HorizontalNavbar";
import LeftDrawer from "./LeftDrawer";
import MicroDrawer from "./MicroDrawer";
import MyProfile from "./MyProfile";
import styles from "./NavbarElements";
import Notification from "./Notification";
import { Preference } from "./Preference/Preference";
import RightDrawer from "./RightDrawer";
import Support from "./Support/Support";
import WeatherPopup from "./WeatherPopup";
import icon1 from "../../../../assets/images/icon1.png";
import icon2 from "../../../../assets/images/icon2.png";
import WelcomeScreenModal from "src/modules/Dashboard/components/DashboardSlate2/Components/WelcomeScreen/WelcomeScreenModal";
import InsightSendMail from "src/modules/Dashboard/components/DashboardSlate2/Components/InsightSendMail/InsightSendMail";
import ProjectPhaseDialog from "src/modules/Dashboard/components/DashboardSlate2/Components/ProjectPhase/ProjectPhaseDialog";
import {
  canViewBimModel,
  canViewCustomList,
  canViewDrawings,
  canViewForm,
  canViewFormTemplates,
  canViewProjectSchedule,
  canViewProjects,
  canViewRoles,
  canViewSpecifications,
  canViewTenantCalendar,
  canViewTenantMaterialMaster,
  canViewTenantTask,
  canViewTenantUsers,
  canViewUploads,
  canViewWorkflowTemplate,
} from "../Sidebar/permission";
import Chat from "../../../Dashboard/components/DashboardSlate2/Components/Chat/Chat";
import About from "../../../Dashboard/components/DashboardSlate2/Components/About/About";
import InsightNotification from "src/modules/Dashboard/components/DashboardSlate2/Components/InsightNotification/InsightNotification";
import SwipeWrapper from "src/modules/Dashboard/components/DashboardSlate2/Shared/SwipeWrapper/SwipeWrapper";
import BottomTab from "src/modules/Dashboard/components/DashboardSlate2/Components/BottomTab/BottomTab";
import Slate2SideMenu from "src/modules/Dashboard/components/DashboardSlate2/Components/Slate2SideMenu/Slate2SideMenu";
import MenuIcon from "../../../../assets/images/app-icon.svg";
import { useCanViewVisualize } from "../Sidebar/useCanViewVisualize";
import { GridMenuIcon } from "@mui/x-data-grid";

const NOTIFICATION_URL: any = process.env["REACT_APP_NOTIFICATION_URL"];
const NOTIFICATION_PATH = "V1/notification";
const NOTIFICATION_POLLING_SECONDS = 60;
let timer: any = null;

const ProjectSettingIcon = (props: any) => {
  return (
    <SvgIcon {...props}>
      <path d="M9 15c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zm13.1-8.16c.01-.11.02-.22.02-.34 0-.12-.01-.23-.03-.34l.74-.58c.07-.05.08-.15.04-.22l-.7-1.21c-.04-.08-.14-.1-.21-.08l-.86.35c-.18-.14-.38-.25-.59-.34l-.13-.93c-.02-.09-.09-.15-.18-.15h-1.4c-.09 0-.16.06-.17.15l-.13.93c-.21.09-.41.21-.59.34l-.87-.35c-.08-.03-.17 0-.21.08l-.7 1.21c-.04.08-.03.17.04.22l.74.58c-.02.11-.03.23-.03.34 0 .11.01.23.03.34l-.74.58c-.07.05-.08.15-.04.22l.7 1.21c.04.08.14.1.21.08l.87-.35c.18.14.38.25.59.34l.13.93c.01.09.08.15.17.15h1.4c.09 0 .16-.06.17-.15l.13-.93c.21-.09.41-.21.59-.34l.87.35c.08.03.17 0 .21-.08l.7-1.21c.04-.08.03-.17-.04-.22l-.73-.58zm-2.6.91c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25zm.42 3.93-.5-.87c-.03-.06-.1-.08-.15-.06l-.62.25c-.13-.1-.27-.18-.42-.24l-.09-.66c-.02-.06-.08-.1-.14-.1h-1c-.06 0-.11.04-.12.11l-.09.66c-.15.06-.29.15-.42.24l-.62-.25c-.06-.02-.12 0-.15.06l-.5.87c-.03.06-.02.12.03.16l.53.41c-.01.08-.02.16-.02.24 0 .08.01.17.02.24l-.53.41c-.05.04-.06.11-.03.16l.5.87c.03.06.1.08.15.06l.62-.25c.13.1.27.18.42.24l.09.66c.01.07.06.11.12.11h1c.06 0 .12-.04.12-.11l.09-.66c.15-.06.29-.15.42-.24l.62.25c.06.02.12 0 .15-.06l.5-.87c.03-.06.02-.12-.03-.16l-.52-.41c.01-.08.02-.16.02-.24 0-.08-.01-.17-.02-.24l.53-.41c.05-.04.06-.11.04-.17zm-2.42 1.65c-.46 0-.83-.38-.83-.83 0-.46.38-.83.83-.83s.83.38.83.83c0 .46-.37.83-.83.83zM4.74 9h8.53c.27 0 .49-.22.49-.49v-.02c0-.27-.22-.49-.49-.49H13c0-1.48-.81-2.75-2-3.45v.95c0 .28-.22.5-.5.5s-.5-.22-.5-.5V4.14C9.68 4.06 9.35 4 9 4s-.68.06-1 .14V5.5c0 .28-.22.5-.5.5S7 5.78 7 5.5v-.95C5.81 5.25 5 6.52 5 8h-.26c-.27 0-.49.22-.49.49v.03c0 .26.22.48.49.48zM9 13c1.86 0 3.41-1.28 3.86-3H5.14c.45 1.72 2 3 3.86 3z" />
    </SvgIcon>
  );
};

const BookMarkIcon = (props: any) => {
  return (
    <SvgIcon {...props}>
      <path d="M4 2H20C20.2652 2 20.5196 2.10536 20.7071 2.29289C20.8946 2.48043 21 2.73478 21 3V22.276C21.0001 22.3594 20.9793 22.4416 20.9395 22.5149C20.8997 22.5882 20.8422 22.6505 20.7722 22.6959C20.7023 22.7413 20.622 22.7685 20.5388 22.775C20.4557 22.7815 20.3722 22.767 20.296 22.733L12 19.03L3.704 22.732C3.6279 22.766 3.54451 22.7805 3.46141 22.774C3.37831 22.7676 3.29813 22.7405 3.22818 22.6952C3.15822 22.6499 3.1007 22.5878 3.06085 22.5146C3.021 22.4414 3.00008 22.3593 3 22.276V3C3 2.73478 3.10536 2.48043 3.29289 2.29289C3.48043 2.10536 3.73478 2 4 2ZM19 19.965V4H5V19.965L12 16.841L19 19.965ZM12 13.5L9.061 15.045L9.622 11.773L7.245 9.455L10.531 8.977L12 6L13.47 8.977L16.755 9.455L14.378 11.773L14.938 15.045L12 13.5Z" />
    </SvgIcon>
  );
};

// const GeneratorIcon = () => {
//   return (
//     <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#fe9a0b">
//       <path d="M21 3H14V10H21V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
//       <path d="M21 14H14V21H21V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
//       <path d="M10 14H3V21H10V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
//       <path d="M10 3H3V10H10V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
//     </svg>
//   )
// }
const Header = (props: any) => {
  const { dispatch, state }: any = useContext(stateContext);
  const { classes } = props;
  const history = useHistory();
  const [selectedProjectId, setSelectedProjectId] = useState(-1);
  const [showAddTenant, setShowAddTenant] = useState(false);
  const [productionCenterEnabled, setProductionCenterEnabled] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const popOverclasses = CustomPopOver();
  const urlPathName = window.location.pathname.split("/");
  const [pathname, setPathname] = useState(
    decodeURI(window.location.pathname.split("/")[1])
  );
  const [userProfileModalOpen, setUserProfileModalOpen] = useState(false);
  let position = null;
  if (
    pathname === "vertical" ||
    pathname === "horizontal 1" ||
    pathname === "horizontal 2"
  ) {
    position = pathname;
  }
  const [appMenuItems, setAppMenuItems] = useState([]);

  const openDrawerValue = sessionStorage.getItem("openDrawer");

  const {
    isUserPCLButNotAdmin,
    isUserPCLButNotAdminRef,
    onGettingStartedUserFlowInitialized,
  } = usePCLMode();

  useEffect(() => {
    if (isUserPCLButNotAdmin) {
      handleDrawerOpen("PCLMODE", true);
    } else {
      handleDrawerOpen("third", false);
    }
  }, [isUserPCLButNotAdmin]);

  const [anchorEl2, setAnchorEl2] = useState(null);
  const [anchorEl3, setAnchorEl3] = useState(null);
  const [anchorEl4, setAnchorEl4] = useState(null);
  const [passwordConfigureModal, setPasswordConfigureModal] = useState<boolean>(false)
  const [moduleListAnchorEl, setModuleListAnchorEl] = useState<any>(null);

  const [sideBarPos, setSideBarPos] = useState(position || "vertical");
  const [open, setOpen] = useState(
    openDrawerValue !== null
      ? JSON.parse(openDrawerValue)
      : sideBarPos !== "vertical"
        ? false
        : false
  );
  const [stateView, setStateView] = useState(
    sessionStorage.getItem("stateView") || "third"
  );
  const [openRightPanel, setRightDrawer] = useState(false);
  const [showPortfolio, setShowPortfolio] = useState(true);
  const urlArray = [
    "project-lists",
    "companies",
    "roles",
    "calendar",
    "customList",
    "forms",
    "workflow",
    "task-library",
    "teammates",
  ];

  const { currentTheme, setTheme } = useContext(CustomThemeContext);
  const isDark = Boolean(currentTheme === "dark");

  const [weatherEl, setWaetherEl] = useState(null);
  const [notificationEl, setNotificationEl] = useState(null);
  const [tenantList, settenantList] = useState<Array<any>>([]);
  const [isOpenPortfolioDropdown, setOpenPortfolioDropdown] = useState(false);
  const [isOpenDropdown, setOpenDropdown] = useState(false);
  const [preferenceOpen, setPreferenceOpen] = useState(false);
  const [
    portfolioProjectAssociationList,
    setPortfolioProjectAssociationList,
  ]: any = useState([]);
  const [openWelcomeScreen, setOpenWelcomeScreen] = useState(false);
  const [openSupportModal, setOpenSupportModal] = useState(false);
  const [showProductionCenterMenu, setShowProductionCenterMenu] =
    useState(false);
  const [projectIdFromUrl, setProjectIdFromUrl] = useState(-1);
  const [selectedMenuItem, setSelectedMenuItem] = useState("");
  const [showCube, setShowCube] = useState(true);
  const [openProjectPhase, setOpenProjectPhase] = useState(false);
  const [openAbout, setOpenAbout] = useState(false);
  const [showConnectedSystems, setShowConnectedSystems] = useState(false);
  const [selectedMenuTab, setSelectedMenuTab]: any = useState("analyze");
  let menuItems: any;

  const [contextAnchorEl, setContextAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const openContextMenu = Boolean(contextAnchorEl);
  const { adminUser } = decodeToken();

  useEffect(() => {
    setPathname(decodeURI(window.location.pathname.split("/")[1]));
  }, [window.location.pathname]);
  const canViewVisualize = useCanViewVisualize();
  const [hideProjectSettingIcon, setHideProjectSettingIcon] = useState(false);

  useEffect(() => {
    let hideTenantLevel = true;
    let hideProjectLevel = true;
    if (state.currentLevel === "portfolio") {
      hideTenantLevel = true;
      hideProjectLevel = true;
    } else if (state.currentLevel === "tenant") {
      hideTenantLevel = true;
      hideProjectLevel = false;
    } else if (state.currentLevel === "project") {
      hideTenantLevel = true;
      hideProjectLevel = false;
    }
    menuItems = [
      {
        name: "Administer",
        label: "Administer",
        level: 1,
        Icon: null,
        imgSrc: icon2,
        link: () => {
          handleClose();
          history.push(`/`);
        },
        items: [
          {
            name: "Production Center",
            label: "Prod Ctr",
            level: 2,
            childIcon: DashboardIcon,
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push(`/productionCenter`);
            },
            items: [],
            show: productionCenterEnabled,
            parent: "administer",
          },
          {
            name: "Project Settings",
            label: "Settings",
            level: 1,
            childIcon: projectSettingIcon,
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push(
                `/base/project-lists/${state.currentProject?.projectId}/details`
              );
            },
            items: [],
            parent: "administer",
            show: true,
          },
          {
            name: "Project Phase",
            level: 1,
            label: "Phases",
            childIcon: FitbitIcon,
            showContextMenu: false,
            show: true,
            link: () => handleProjectPhase(),
            items: [],
            parent: "administer",
          },
          {
            name: "Auto Link",
            level: 2,
            label: "Auto Link",
            childIcon: BookMarkIcon,
            showContextMenu: false,
            show: true,
            link: () => {
              handleClose();
              history.push(`/autolink/${state.currentProject?.projectId}`);
            },
            items: [],
            parent: "administer",
          },
          {
            name: "Connections",
            label: "Connect",
            level: 2,
            childIcon: UsbIcon,
            showContextMenu: false,
            show: !(!hideTenantLevel && adminUser),
            link: () => {
              handleClose();
              handleConnectedSystems();
            },
            items: [],
            parent: "administer",
          },
          {
            name: "Personalize",
            label: "Personalize",
            level: 1,
            childIcon: null,
            imgSrc: icon1,
            show: true,
            showContextMenu: false,
            link: () => {
              handleClose();
              setOpenWelcomeScreen(!openWelcomeScreen);
            },
            items: [],
            parent: "administer",
          },
          {
            name: "Engine Room",
            label: "Engine Room",
            level: 1,
            childIcon: ClassicIcon,
            show: true,
            showContextMenu: true,
            link: () => {
              handleClose();
              sessionStorage.setItem("level", "project");
              sessionStorage.setItem("dashboardType", "classic");
              history.push("/");
              location.reload();
            },
            items: [],
            parent: "administer",
          }
        ],
        parent: "administer",
        show: true,
      },

      {
        name: "Data",
        level: 1,
        Icon: TimelineIcon,
        items: [
          {
            name: "Schedule",
            childIcon: ScheduleIcon,
            label: "Schedule",
            link: () => {
              handleClose();
              history.push(
                `/scheduling/project-plan/${state.currentProject?.projectId}`
              );
            },
            level: 2,
            showContextMenu: true,
            items: [],
            parent: "analyze",
            show: canViewProjectSchedule(),
          },
          {
            name: "Model",
            label: "Model",
            childIcon: BusinessIcon,
            showContextMenu: true,
            level: 2,
            link: () => {
              handleClose();
              history.push(`/bim/${state.currentProject?.projectId}/list`);
            },
            show: canViewBimModel(),
            items: [],
            parent: "analyze",
          },
          {
            name: "Insights",
            label: "Insights",
            level: 2,
            showContextMenu: false,
            childIcon: InsightsIcon,
            link: () => {
              handleClose();
              history.push(
                `/insights/projects/${state.currentProject?.projectId}/scheduleImpact`
              );
            },
            items: [],
            parent: "analyze",
            show: canViewProjectSchedule(),
          },
          {
            name: "Productivity",
            label: "Productivity",
            level: 2,
            childIcon: ProductivityIcon,
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push(
                `/productivityMetrics/${state.currentProject?.projectId}`
              );
            },
            items: [],
            parent: "analyze",
            show: canViewProjectSchedule(),
          },
          {
            name: "Generator",
            label: "Generator",
            level: 2,
            childIcon: GridView,
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push(
                `/generator`
              );
            },
            items: [],
            parent: "analyze",
            show: true,
          },
          {
            name: "Visualize",
            label: "Visualize",
            level: 2,
            childIcon: DomainAddIcon,
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push(`/visualize/${state.currentProject?.projectId}`);
            },
            items: [],
            parent: "analyze",
            show: canViewVisualize,
          },
        ],
        parent: "Data",
        show:
          hideProjectLevel || (!canViewProjectSchedule() && !canViewBimModel()),
      },
      {
        name: "Input",
        level: 1,
        Icon: InputIcon,
        items: [
          {
            name: "Forms",
            label: "Forms",
            level: 2,
            childIcon: ListAltIcon,
            link: () => {
              handleClose();
              history.push(
                `/base/projects/${state.currentProject?.projectId}/form/2`
              );
            },
            items: [],
            showContextMenu: false,
            parent: "manage",
            show: canViewForm(),
          },
          {
            name: "Daily Logs",
            level: 2,
            label: "Daily Logs",
            childIcon: DailyLogIcon,
            link: () => {
              handleClose();
              history.push(
                `/dailyLogs/projects/${state.currentProject?.projectId}`
              );
            },
            items: [],
            showContextMenu: true,
            parent: "manage",
            show: canViewProjectSchedule(),
          },
          {
            name: "Quality Control",
            label: "Quality Ctrl",
            level: 2,
            childIcon: ListAltIcon,
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push(
                `/base/qualityControl/projects/${state.currentProject?.projectId}/building`
              );
            },
            items: [],
            parent: "manage",
            show: canViewForm(),
          },
        ],
        parent: "Input",
        show: canViewProjectSchedule() && canViewForm(),
      },
      {
        name: "Documents",
        Icon: FolderOpenIcon,
        level: 1,
        show: canViewDrawings() && canViewSpecifications(),
        items: [
          {
            name: "Library",
            label: "Library",
            level: 2,
            showContextMenu: true,
            childIcon: DocumentLibraryIcon,
            link: () => {
              handleClose();
              history.push(
                `/documentlibrary/projects/${state.currentProject?.projectId}`
              );
            },
            parent: "manage",
            show: canViewUploads(),
          },
          {
            name: "Drawings",
            label: "Drawings",
            level: 2,
            showContextMenu: true,
            childIcon: DrawingsIcon,
            link: () => {
              handleClose();
              history.push(
                `/drawings/projects/${state.currentProject?.projectId}/lists`
              );
            },
            parent: "manage",
            show: canViewDrawings(),
          },
          {
            name: "Specification",
            label: "Specs",
            level: 2,
            showContextMenu: true,
            childIcon: BookMark,
            link: () => {
              handleClose();
              history.push(
                `/specifications/projects/${state.currentProject?.projectId}/lists`
              );
            },
            parent: "manage",
            show: canViewSpecifications(),
          },
        ],
      },

      {
        name: "Data Sets",
        level: 1,
        Icon: EqualizerIcon,
        show:
          hideTenantLevel ||
          (!canViewTenantTask() && !canViewTenantMaterialMaster()),
        items: [
          {
            name: "Recipes",
            label: "Recipes",
            link: () => {
              handleClose();
              history.push("/scheduling/library/recipes");
            },
            showContextMenu: false,
            childIcon: Recipes,
            level: 2,
            parent: "manage",
            show: canViewTenantTask(),
          },
          {
            name: "Material Master",
            label: "Materials",
            link: () => {
              handleClose();
              history.push("/scheduling/library/material-master");
            },
            showContextMenu: false,
            childIcon: MaterialIcon,
            level: 2,
            parent: "manage",
            show: canViewTenantMaterialMaster(),
          }
        ],
      },

      {
        name: "Settings",
        label: "Settings",
        level: 1,
        Icon: null,
        imgSrc: icon2,
        link: () => {
          handleClose();
          history.push(`/`);
        },
        items: [
          {
            name: "Projects",
            label: "Projects",
            level: 1,
            childIcon: ProjectsIcon,
            show: canViewProjects(),
            showContextMenu: false,
            link: () => {
              handleClose();
              history.push("/base/project-lists");
            },
            items: [],
            parent: "settings",
          },
          {
            name: "Teammates",
            label: "Teammates",
            level: 1,
            childIcon: People,
            showContextMenu: false,
            show: canViewTenantUsers(),
            link: () => {
              handleClose();
              history.push("/base/teammates/lists");
            },
            items: [],
            parent: "settings",
          },
          {
            name: "Equipment Master",
            label: "Equipments",
            link: () => {
              handleClose();
              history.push("/scheduling/library/equipment-master");
            },
            showContextMenu: false,
            childIcon: Ballot,
            level: 2,
            parent: "settings",
            show: canViewTenantMaterialMaster(),
          },
          {
            name: 'Roles',
            label: "Roles",
            link: () => {
              handleClose();
              history.push("/base/roles");
            },
            childIcon: EmojiPeople,
            level: 2,
            parent: 'settings',
            show: canViewRoles(),
          },
          {
            name: 'Form Templates',
            label: "Form Temp",
            link: () => {
              handleClose();
              history.push("/base/forms");
            },
            childIcon: FormTemplateIcon,
            level: 2,
            parent: 'settings',
            show: canViewFormTemplates(),
          },
          {
            name: 'Workflow',
            label: "Workflow",
            link: () => {
              handleClose();
              history.push("/workflow");
            },
            childIcon: LowPriority,
            level: 2,
            parent: 'settings',
            show: canViewWorkflowTemplate(),
          },
          {
            name: 'Calendar Templates',
            label: "Calendar",
            link: () => {
              handleClose();
              history.push("/scheduling/library/calendar");
            },
            childIcon: CalendarToday,
            level: 2,
            parent: 'settings',
            show: canViewTenantCalendar(),
          },
          {
            name: 'Custom Lists',
            label: "Custom Lists",
            link: () => {
              handleClose();
              history.push("/base/customList");
            },
            childIcon: ListIcon,
            level: 2,
            parent: 'settings',
            show: canViewCustomList(),
          },
          {
            name: 'Weather Template',
            label: "Weather",
            link: () => {
              handleClose();
              history.push("/base/weatherTemplate");
            },
            childIcon: ThunderstormOutlinedIcon,
            level: 2,
            parent: 'settings',
            show: canViewCustomList(),
          },
          {
            name: 'Password Configuration',
            label: "Password",
            link: () => {
              handleClose();
              setPasswordConfigureModal(true);
            },
            childIcon: LockClockOutlinedIcon,
            level: 2,
            parent: 'settings',
            show: showAddTenant,
          },
        ],
        parent: "settings",
        show: true,
      },

    ];
    setAppMenuItems(menuItems);
  }, [
    state.currentProject,
    state.currentLevel,
    state.selectedProjectToken,
    productionCenterEnabled,
    hideProjectSettingIcon,
    canViewVisualize,
  ]);

  const urlLocation = useLocation();
  useEffect(() => {
    setShowCube(true);
    setTimeout(() => {
      if (urlLocation?.pathname?.includes("visualize")) {
        dispatch(
          handleBottomMenus({
            ...state?.bottomMenu,
            showBottomMenu: null,
            showWeatherPopup: null,
            showTaskAndNewsCard: null,
            showNotificationPopup: null,
            showSlate2SideMenu: null,
          })
        );
      } else {
        dispatch(
          handleBottomMenus({
            ...state?.bottomMenu,
            showBottomMenu: null,
            showWeatherPopup: null,
            showTaskAndNewsCard: null,
            showNotificationPopup: null,
            showChatPanel: null,
            showSlate2SideMenu: null,
          })
        );
      }
    }, 100);
    if (
      urlLocation?.pathname?.includes("scheduling") ||
      urlLocation?.pathname?.includes("visualize")
    ) {
      dispatch(handleInsightMetric("Scheduler"));
    } else {
      dispatch(handleInsightMetric(state?.selectedMetric));
    }
  }, [urlLocation]);

  const [mailModal, setMailModal]: any = useState(null);

  const getValuesFromHistory = () => {
    let projectId = -1;
    let menuType = "Home";

    if (history.location.pathname.includes("/base/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 4 ? Number(ids[3]) : -1;
      menuType = "Forms";
    }
    if (history.location.pathname.includes("/scheduling/project-plan")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Schedule";
    }
    if (history.location.pathname.includes("/drawings/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Documents,Drawing";
    }
    if (history.location.pathname.includes("/specifications/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Documents,Drawing";
    }
    if (history.location.pathname.includes("/insights/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Insights";
    }
    if (history.location.pathname.includes("/bim")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 2 ? Number(ids[2]) : -1;
      menuType = "Model";
    }
    if (history.location.pathname.includes("/documentlibrary/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Document Library";
    }
    if (history.location.pathname.includes("/insights/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Insights";
    }
    if (history.location.pathname.includes("/productivityMetrics")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[2]) : -1;
      menuType = "Productivity";
    }
    if (history.location.pathname.includes("/dailyLogs/projects/")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[3]) : -1;
      menuType = "Daily Logs";
    }
    if (history.location.pathname.includes("/base/qualityControl/projects")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[4]) : -1;
      menuType = "Quality Control";
    }

    if (history.location.pathname.includes("/visualize")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length > 2 ? Number(ids[2]) : -1;
      menuType = "Visualize";
    }
    if (history.location.pathname.includes("/slate-assist")) {
      const ids = history.location.pathname.split("/");
      projectId = ids.length >= 3 ? Number(ids[2]) : -1;
      menuType = "SlateAssist";
    }
    if (isNaN(projectId)) {
      projectId = -1;
    }

    return { projectId, menuType };
  };

  useEffect(() => {
    if (state.bottomMenu.showBottomMenu) {
      setShowCube(false);
    } else {
      setTimeout(() => {
        setShowCube(true);
      }, 3000);
    }
  }, [state.bottomMenu.showBottomMenu]);

  useEffect(() => {
    const activeTenantName: any = localStorage.getItem("activeTenantName");
    dispatch(setIsOnxTenant(activeTenantName));
  }, [getActiveTenantId()]);

  const getActiveTenant = async () => {
    try {
      const { projectId, menuType } = getValuesFromHistory();
      setSelectedTenantBasedOnUrl();

      const selectedProject: any = sessionStorage.getItem("selectedProject");
      if (
        selectedProject &&
        projectId == JSON.parse(selectedProject)?.projectId
      ) {
        getPortfolios(projectId);
        return;
      } else if (projectId < 0) {
        getPortfolios(projectId);
        return;
      } else if (projectId > 0) {
        sessionStorage.removeItem("selectedProject");
      }

      dispatch(setIsLoading(true));
      const projectNamesResponse = await genFetchProjectNames([projectId]);
      if (projectNamesResponse?.data?.project?.length) {
        getPortfolios(projectId, menuType);
        dispatch(setCurrentLevel("project"));
        dispatch(setSelectedMenu(menuType));
        sessionStorage.setItem("selectedMenu", menuType);
        return;
      } else {
        if (!getAllExchangeToken()) {
          getPortfolios(projectId);
          return;
        }
        let allTokens = JSON.parse(getAllExchangeToken());
        allTokens = Object.entries(allTokens);
        let targetActiveTenantFound = false;
        let targetTenant;
        for (let i = 0; i < allTokens.length; i++) {
          const response = await genFetchProjectNames(
            [projectId],
            allTokens[i][1]
          );
          if (response?.data?.project?.length) {
            targetActiveTenantFound = true;
            targetTenant = response?.data?.project[0];
            console.log("targetTenant", targetTenant);

            break;
          }
        }
        dispatch(setIsLoading(false));
        if (targetActiveTenantFound) {
          setActiveTenantId(
            targetTenant?.tenantId,
            targetTenant?.tenantCompany
          );
          dispatch(setCurrentLevel("project"));
          dispatch(setSelectedMenu(menuType));
          sessionStorage.setItem("selectedMenu", menuType);
          getPortfolios(projectId);
        } else {
          checkOtherTenants(projectId, menuType);
        }
      }
    } catch (error) {
      dispatch(setIsLoading(false));
      console.error(error);
    }
  };

  const checkOtherTenants = async (projectId: number, menuType: string) => {
    const allTokens = JSON.parse(getAllExchangeToken());
    if (decodeToken().tenants.length > Object.entries(allTokens).length) {
      const tenants = Object.entries(allTokens).map((aT: any) => Number(aT[0]));

      const userTenantIds: any = decodeToken().tenants.filter((eToken: any) => {
        return tenants.indexOf(eToken.id) == -1;
      });

      const promiseList = [];
      for (let i = 0; i < userTenantIds.length; i++) {
        const exchangeToken: ExchangeToken = {
          tenantId: Number(userTenantIds[i].id),
          features: exchangeTokenFeatures,
        };
        promiseList.push(postApi("V1/user/login/exchange", exchangeToken));
      }

      dispatch(setIsLoading(true));
      const responseList = await Promise.all(promiseList);
      for (let i = 0; i < responseList.length; i++) {
        setExchangeToken(responseList[i].success, Number(userTenantIds[i].id));
      }

      let targetActiveTenantFound = false;
      let targetTenant;
      for (let i = 0; i < responseList.length; i++) {
        const response = await genFetchProjectNames(
          [projectId],
          responseList[i].success
        );
        if (response?.data?.project?.length) {
          targetActiveTenantFound = true;
          targetTenant = response?.data?.project[0];
          console.log("targetTenant", targetTenant);
          break;
        }
      }

      dispatch(setIsLoading(false));

      if (targetActiveTenantFound) {
        setActiveTenantId(targetTenant?.tenantId, targetTenant?.tenantCompany);
        dispatch(setCurrentLevel("project"));
        dispatch(setSelectedMenu(menuType));
        sessionStorage.setItem("selectedMenu", menuType);
      } else {
        history.push("/");
        dispatch(setSelectedMenu("Home"));
        sessionStorage.setItem("selectedMenu", "Home");
      }
    } else {
      history.push("/");
      dispatch(setSelectedMenu("Home"));
      sessionStorage.setItem("selectedMenu", "Home");
    }
    getPortfolios(projectId);
  };

  const getPortfolios = async (projectId = -1, menuType?: string) => {
    try {
      dispatch(setIsLoading(true));
      const preferenceData = await genPreference();
      await genTenantDetails();
      await genTenantRole();
      setProjectIdFromUrl(projectId);
      const response = await client.query({
        query: FETCH_PORTFOLIOS,
        fetchPolicy: "network-only",
        context: {
          role: "viewMyProjects",
        },
      });
      if (response?.data?.portfolio?.length) {
        const portfolioData: Array<any> = response?.data?.portfolio.map(
          (p: any) => ({
            portfolioId: p.id,
            portfolioName: p.name,
            projectInfos: p.projectPortfolioAssociations,
          })
        );

        dispatch(setPortfolioList(portfolioData));
        const selectedPortfolio = sessionStorage.getItem("selectedPortfolio");
        const portfolioProjectAssList: any = [];

        for (let i = 0; i < portfolioData?.length; i++) {
          const data = portfolioData[i]?.projectInfos.map((val: any) => {
            return { [val.projectId]: portfolioData[i]?.portfolioId };
          });
          portfolioProjectAssList.push(...data);
        }

        setPortfolioProjectAssociationList(portfolioProjectAssList);

        !state?.isOnxTenant &&
          dispatch(setCurrentProject(state.projectList[0]));
        if (
          selectedPortfolio &&
          portfolioData.find(
            (item) =>
              item.portfolioId === JSON.parse(selectedPortfolio).portfolioId
          ) &&
          menuType !== "SlateAssist"
        ) {
          const portfolio: any = sessionStorage.getItem("selectedPortfolio");
          dispatch(setCurrentPortfolio(JSON.parse(portfolio)));
        } else if (preferenceData?.defaultPortfolio && projectId <= 0) {
          const currentPortfolio = portfolioData.find(
            (item) => item.portfolioId === preferenceData?.defaultPortfolio
          );
          dispatch(setCurrentPortfolio(currentPortfolio));
        } else {
          if (projectId > 0) {
            const currentPortfolioId = portfolioProjectAssList.find(
              (val: any) => {
                return projectId === Number(Object.keys(val)[0]);
              }
            );

            let targetPorfolio = portfolioData;
            if (currentPortfolioId) {
              targetPorfolio = portfolioData.filter(
                (pd) => pd.portfolioId == currentPortfolioId[projectId]
              );
            }

            sessionStorage.setItem(
              "selectedPortfolio",
              JSON.stringify(targetPorfolio[0])
            );
            dispatch(setCurrentPortfolio(targetPorfolio[0]));
          } else {
            sessionStorage.setItem(
              "selectedPortfolio",
              JSON.stringify(portfolioData[0])
            );
            dispatch(setCurrentPortfolio(portfolioData[0]));
          }
        }

        if (state.tenantSwitch) {
          dispatch(setTenantSwitch(false));
          sessionStorage.setItem("level", "portfolio");
          !state?.isOnxTenant &&
            dispatch(setCurrentProject(state?.projectList[0]));
          dispatch(setCurrentLevel("portfolio"));
          handleListItem("", "Home");
          history.push("/");
        }

        dispatch(setIsLoading(false));
      }
    } catch (error) {
      console.error(error);
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    if (state.tenantSwitch) {
      getPortfolios();
    }
  }, [state.tenantSwitch]);

  useEffect(() => {
    if (
      portfolioProjectAssociationList.length > 0 &&
      !state?.isOnxTenant &&
      !isUserPCLButNotAdminRef.current &&
      state.dashboardType !== "slate2.0"
    ) {
      initializeUserflow(portfolioProjectAssociationList);
    }
  }, [
    portfolioProjectAssociationList,
    state?.isOnxTenant,
    state.dashboardType,
  ]);

  useEffect(() => {
    getActiveTenant();
    dispatch(setCurrentTheme(themes[0]));
    genPreference();
    genTenantDetails().then((res: any) => {
      if (history.location.pathname.includes("/productionCenter")) {
        if (!res) {
          dispatch(setSelectedMenu("Home"));
          sessionStorage.setItem("selectedMenu", "Home");
          history.push("/");
        }
      }
    });
    genTenantRole();
  }, []);

  const genTenantRole = async () => {
    try {
      const tenantAssociationResponse = await client.query({
        query: GET_TENANT_ROLE,
        variables: {
          userId: decodeExchangeToken().userId,
        },
        fetchPolicy: "network-only",
        context: {
          role: "updateMyUser",
        },
      });

      setShowProductionCenterMenu(
        tenantAssociationResponse?.data?.tenantAssociation[0]?.roleByRole
          ?.role === "Account Owner"
      );
    } catch (error) {
      console.error(error);
    }
  };

  const genTenantDetails = async () => {
    return new Promise(async (resolve, reject) => {
      try {
        const tenantDetailsResponse = await client.query({
          query: FETCH_TENANT_DETAILS,
          fetchPolicy: "network-only",
          context: {
            role: myProjectRole.viewMyProjects,
          },
        });
        setProductionCenterEnabled(
          tenantDetailsResponse?.data?.tenant[0]?.productionCenterEnabled
        );
        resolve(
          tenantDetailsResponse?.data?.tenant[0]?.productionCenterEnabled
        );
      } catch (err) {
        console.error("Error occurred while fetching tenant details");
        reject(err);
      }
    });
  };

  useEffect(() => {
    state?.selectedProjectToken && fetchInspectionFormFeatureId();
  }, [state?.selectedProjectToken]);

  const fetchInspectionFormFeatureId = async () => {
    try {
      const payload = {
        input: {
          source: "FORM",
        },
      };

      const responseData = await postApiWithProjectExchange(
        "V1/form/navigationData",
        payload,
        state?.selectedProjectToken
      );

      responseData?.navigationData?.forEach((item: any) => {
        if (item?.feature === "QUALITY_CONTROL") {
          dispatch(setInspectionFormFeatureId(item?.featureId));
        }
      });
    } catch (error: any) {
      console.log(error);
    }
  };

  const updateTenantDetails = async () => {
    dispatch(setIsLoading(true));
    try {
      await client.mutate({
        mutation: UPDATE_TENANT_DETAILS,
        variables: {
          productionCenterEnabled: !productionCenterEnabled,
        },
        context: { role: tenantRoles.updateTenantRoleStatus },
      });
      if (history.location.pathname.includes("/productionCenter")) {
        dispatch(setSelectedMenu("Home"));
        sessionStorage.setItem("selectedMenu", "Home");
        history.push("/");
      }
      genTenantDetails();
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
      console.error("Error occurred while updating tenant details");
    }
  };

  const genPreference = async () => {
    const prefObj = {
      mode: "minified",
      theme: "normal",
      twitter: ["Technology"],
      widgets: {
        budget: true,
        rfi: true,
        milestone: true,
        status: true,
        ontime: true,
        ahead: true,
        behind: true,
        tmr: true,
        ppc: true,
        variances: true,
        constraints: true,
        carbonfootprint: true,
        carbondata: true,
        carbon: true,
        productivity: true,
        noncompliance: true,
        onsite: true,
        timeandstatus: true,
        spi: true,
        health: true,
      },
      dashboardType: "default",
    };
    try {
      const token = getExchangeToken();
      const response = await axios.get(
        `${process.env["REACT_APP_DASHBOARD_URL"]
        }dashboard/getPreferences?tenantId=${Number(
          decodeExchangeToken().tenantId
        )}&userId=${decodeExchangeToken().userId}`,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response?.status === 200) {
        if (response?.data === "") {
          dispatch(setPreference(prefObj));
          dispatch(setProjectSettings(prefObj.widgets));
        } else {
          const data = response.data;
          dispatch(setProjectSettings({ ...prefObj.widgets, ...data.widgets }));
          dispatch(setPreference(data));
          return data;
        }
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    state.currentLevel === "tenant" && setSelectedTenantBasedOnUrl();
  }, [state.currentPortfolio, state.currentProject, state.currentLevel]);

  const getProjects = async () => {
    try {
      dispatch(setIsLoading(true));

      const response = await client.query({
        query: FETCH_MYPORJECT_PORTFOLIO,
        fetchPolicy: "network-only",
        context: {
          role: "viewMyProjects",
        },
        variables: {
          portfolioId: state.currentPortfolio.portfolioId,
        },
      });
      if (response?.data?.project.length == 0) {
        dispatch(setNoProjectFound(true));
      }
      if (response?.data?.project) {
        const targetResponse: Array<any> = [];
        response?.data?.project.forEach((p: any) => {
          targetResponse.push({
            portfolioId: p?.projectPortfolioAssociations[0]?.portfolioId,
            projectId: p?.id,
            projectName: p?.name,
          });
        });

        const data = [
          {
            projectId: 0,
            projectName: "All",
            isRecent: "true",
          },
          ...targetResponse,
        ];
        const selectedProject: any = sessionStorage.getItem("selectedProject");
        if (JSON.parse(selectedProject)) {
          const isExist = data.find(
            (item: any) =>
              item.projectId === JSON.parse(selectedProject).projectId
          );
          if (isExist?.projectId) {
            const project: any = sessionStorage.getItem("selectedProject");
            dispatch(setCurrentProject(JSON.parse(project)));
          } else {
            sessionStorage.setItem(
              "selectedProject",
              JSON.stringify(data[1] || null)
            );
            dispatch(setCurrentProject(data[1] || data[0]));
          }
        } else if (
          data.find(
            (item: any) =>
              item.projectId === state.selectedPreference?.defaultProject
          )?.projectId &&
          state.selectedPreference?.defaultProject &&
          projectIdFromUrl <= 0
        ) {
          const project = data.find(
            (item: any) =>
              item.projectId === state.selectedPreference?.defaultProject
          );

          dispatch(setCurrentProject(project || data[1]));
        } else {
          if (projectIdFromUrl > 0) {
            const targetProject = data.find(
              (item: any) => item.projectId === projectIdFromUrl
            );

            if (targetProject) {
              dispatch(setCurrentProject(targetProject));
              dispatch(setSelectedProject(targetProject));
              sessionStorage.setItem(
                "selectedProject",
                JSON.stringify(targetProject)
              );
            } else {
              dispatch(setCurrentProject(data[state?.isOnxTenant ? 1 : 1]));
              dispatch(setSelectedProject(data[state?.isOnxTenant ? 1 : 1]));
              sessionStorage.setItem(
                "selectedProject",
                JSON.stringify(data[state?.isOnxTenant ? 1 : 1])
              );
            }
          } else {
            state?.isOnxTenant
              ? dispatch(setCurrentProject(data[1]))
              : dispatch(setCurrentProject(data[1]));
          }
        }
        //setSelectedProjectBasedOnUrl(data);
        dispatch(setProjectList(data));
        dispatch(setIsLoading(false));
      }
    } catch (error) {
      console.error(error);
      dispatch(setIsLoading(false));
    }
  };

  useEffect(() => {
    state.currentPortfolio?.portfolioId && getProjects();
  }, [
    state.currentPortfolio,
    state.getProjectList,
    projectIdFromUrl,
    state?.selectedPreference,
  ]);

  useEffect(() => {
    try {
      const fetchNotificationCount = () =>
        axiosApiInstance
          .get(`${NOTIFICATION_URL}${NOTIFICATION_PATH}`, {
            headers: {
              token: "exchange",
            },
          })
          .then((res) =>
            dispatch(setNotificationBadgeCount(Number(res.data.success?.count)))
          );
      const timerId = setInterval(() => {
        fetchNotificationCount();
      }, NOTIFICATION_POLLING_SECONDS * 1000);
      fetchNotificationCount();
      return () => clearInterval(timerId);
    } catch (error: any) {
      console.error(error);
    }
  }, [getActiveTenantId()]);

  useEffect(() => {
    settenantList(decodeToken().tenants);
    setShowAddTenant(decodeToken().adminUser);
  }, []);

  useEffect(() => {
    state?.tenantSwitch === false &&
      state.isOnxTenant === false &&
      handleUrlBasedOnTenantChange();
  }, [state?.isOnxTenant, state?.tenantSwitch]);

  const handleAddTenant = () => {
    handleClose();
    setOpenDialog(true);
  };

  useEffect(() => {
    let isExist;
    if (urlPathName && urlPathName.length > 0) {
      isExist = urlPathName.find((item) => {
        if (urlArray.includes(decodeURI(item))) {
          return true;
        }
      });
    }
    if (isExist) setShowPortfolio(false);
    else setShowPortfolio(true);
  });

  useEffect(() => {
    const value = sessionStorage.getItem("openDrawer") || "false";
    if (value === "false") {
      dispatch(setDrawerOpen(false));
    } else {
      dispatch(setDrawerOpen(true));
    }
    return () => {
      dispatch(setSelectedProject(null));
    };
  }, []);

  useEffect(() => {
    if (state?.currentProject && state.currentProject?.projectName !== "All") {
      setSelectedProjectId(state.currentProject.projectId);
      fetchProjectToken(state.currentProject.projectId);
    } else {
      setSelectedProjectId(-1);
    }
  }, [state.currentProject]);

  const handleWeather = (event: any) => {
    setWaetherEl(event.currentTarget);
  };

  const handleCloseWeather = () => {
    setWaetherEl(null);
  };

  const handleUrlBasedOnTenantChange = () => {
    if (
      history.location.pathname.includes("/inspectionForm") ||
      history.location.pathname.includes("/inspection")
    ) {
      history.push("/");
      setPathname("/");
    }
  };

  const setSelectedTenantBasedOnUrl = (): boolean => {
    let returnValue = false;
    if (history.location.pathname.includes("/base/project-lists")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Getting Started,Projects"));
      sessionStorage.setItem("selectedMenu", "Getting Started,Projects");
      returnValue = true;
    } else if (history.location.pathname.includes("/base/teammates/lists")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Getting Started,Teammates"));
      sessionStorage.setItem("selectedMenu", "Getting Started,Teammates");
      returnValue = true;
    } else if (history.location.pathname.includes("/base/companies")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Getting Started,Companies"));
      sessionStorage.setItem("selectedMenu", "Getting Started,Companies");
      returnValue = true;
    } else if (history.location.pathname.includes("/base/roles")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Templates,Roles"));
      sessionStorage.setItem("selectedMenu", "Templates,Roles");
      returnValue = true;
    } else if (history.location.pathname.includes("/base/forms")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Templates,Forms Templates"));
      sessionStorage.setItem("selectedMenu", "Templates,Forms Templates");
      returnValue = true;
    } else if (history.location.pathname.includes("/workflow")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Templates,Workflow"));
      sessionStorage.setItem("selectedMenu", "Templates,Workflow");
      returnValue = true;
    } else if (
      history.location.pathname.includes("/scheduling/library/calendar")
    ) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Templates,Calendar Templates"));
      sessionStorage.setItem("selectedMenu", "Templates,Calendar Templates");
      returnValue = true;
    } else if (history.location.pathname.includes("/base/customList/view")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Templates,Custom Lists"));
      sessionStorage.setItem("selectedMenu", "Templates,Custom Lists");
      returnValue = true;
    } else if (
      history.location.pathname.includes("/scheduling/library/recipes")
    ) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Data Sets,Recipes"));
      sessionStorage.setItem("selectedMenu", "Data Sets,Recipes");
      returnValue = true;
    } else if (
      history.location.pathname.includes("/scheduling/library/recipe-plan")
    ) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Data Sets,Recipes"));
      localStorage.setItem("selectedMenu", "Data Sets,Recipes");
    } else if (
      history.location.pathname.includes("/scheduling/library/material-master")
    ) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Data Sets,Material Master"));
      sessionStorage.setItem("selectedMenu", "Data Sets,Material Master");
      returnValue = true;
    } else if (
      history.location.pathname.includes("/scheduling/library/equipment-master")
    ) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Data Sets,Equipment Master"));
      sessionStorage.setItem("selectedMenu", "Data Sets,Equipment Master");
      returnValue = true;
    } else if (history.location.pathname.includes("/equipments-map")) {
      dispatch(setCurrentLevel("portfolio"));
      sessionStorage.setItem("level", "portfolio");
      //dispatch(setSelectedMenu('Data Sets,Equipment Master'));
      //sessionStorage.setItem('selectedMenu', 'Data Sets,Equipment Master');
      returnValue = true;
    } else if (history.location.pathname.includes("visualize")) {
      dispatch(setCurrentLevel("project"));
      dispatch(setSelectedMenu("Visualize"));
      sessionStorage.setItem("selectedMenu", "Visualize");
      returnValue = true;
    } else if (history.location.pathname.includes("connectors")) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Connectors"));
      sessionStorage.setItem("selectedMenu", "Connectors");
      returnValue = true;
    }
    else if (
      history.location.pathname.includes("/base/weatherTemplate")
    ) {
      dispatch(setCurrentLevel("tenant"));
      dispatch(setSelectedMenu("Templates,Weather Template"));
      sessionStorage.setItem("selectedMenu", "Templates,Weather Template");
      returnValue = true;
    }
    return returnValue;
  };

  const handleThemeChange = (event: any) => {
    const { checked } = event.target;
    if (checked) {
      setTheme("dark");
    } else {
      setTheme("normal");
    }
  };

  const handleDrawerOpen = (val: any, openDrawer: any) => {
    sessionStorage.setItem("stateView", val);
    sessionStorage.setItem("openDrawer", openDrawer);
    dispatch(setDrawerOpen(openDrawer));
    setStateView(val);
    setOpen(openDrawer);
  };

  const handleClose = () => {
    setAnchorEl2(null);
    setAnchorEl3(null);
    setAnchorEl4(null);
  };

  const handleCloseProjectPhase = (value: string) => {
    setOpenProjectPhase(false);
  };

  const handleCloseAbout = () => {
    setOpenAbout(false);
  };
  const handleClosePassword = () => {
    setPasswordConfigureModal(false)
  }

  const handleCloseConnectedSystems = () => {
    setShowConnectedSystems(false);
  };

  const handleListItem = (ev: any, parent: any) => {
    // fetchProjects();
    if (ev === undefined || parent === "Micro") {
      handleDrawerOpen("fourth", false);
      return;
    }
    if (parent) {
      sessionStorage.setItem("selectedMenu", parent);
      if (state.editMode) {
        const payload = {
          type: "NAVIGATION",
          selectedValue: parent,
        };
        sessionStorage.setItem("promptResponse", "INPROGRESS");
        history.push("/");
        handlePromptResponse(payload);
      } else {
        dispatch(setSelectedMenu(parent));
      }
    }
    if (
      ev &&
      ev.target &&
      (ev.target.innerText === "Horizontal 1" ||
        ev.target.innerText === "Horizontal 2" ||
        ev.target.innerText === "Vertical")
    ) {
      const text = ev.target.innerText;
      setSideBarPos(text.toLowerCase());
      handleDrawerOpen(
        ev.target.innerText === "Vertical" ? "third" : "first",
        false
      );
    } else if (
      ev === "vertical" ||
      ev === "horizontal 1" ||
      ev === "horizontal 2"
    ) {
      setSideBarPos(ev.toLowerCase());
      handleDrawerOpen(ev === "vertical" ? "third" : "first", false);
      setAnchorEl2(null);
      setAnchorEl3(null);
      setAnchorEl4(null);
    }
  };

  const openRightDrawer = () => {
    setRightDrawer(!openRightPanel);
  };

  const handleRightDrawerClose = () => {
    setRightDrawer(!openRightPanel);
  };

  const handleAccount = (ev: any) => {
    setAnchorEl3(ev.currentTarget);
  };

  const handleSlate2Account = (ev: any) => {
    setAnchorEl4(ev.currentTarget);
  };

  const handleCloseContextMenu = () => {
    setContextAnchorEl(null);
  };

  const handleProjectPhase = () => {
    handleClose();
    setOpenProjectPhase(true);
  };

  const handleAbout = () => {
    handleClose();
    setOpenAbout(true);
  };

  const handleConnectedSystems = () => {
    handleClose();
    history.push("/connectedSystems");
  };

  const handleContextMenu = (ev: any) => {
    ev.preventDefault();
    setContextAnchorEl(ev.currentTarget);
  };

  const handleLayouts = (ev: any) => {
    setAnchorEl2(ev.currentTarget);
  };

  const handleNotification = (ev: any) => {
    setNotificationEl(ev.currentTarget);
  };

  const loggingOut = async () => {
    await savePortfolioAndProjectPreference();
    if (
      history.location.pathname.includes("/drawings/projects") ||
      history.location.pathname.includes("scheduling/project-plan")
    ) {
      dispatch(setIsLoading(true));
      dispatch(setIsAboutToLogout(true));
      setTimeout(() => {
        dispatch(setIsLoading(true));
        dispatch(setLogout());
        logout();
      }, 4000);
    } else {
      dispatch(setLogout());
      logout();
    }
  };

  const savePortfolioAndProjectPreference = async () => {
    const payload = {
      tenantId: Number(decodeExchangeToken().tenantId),
      userId: decodeExchangeToken().userId,
      preferencesJson: {
        ...state?.selectedPreference,
        defaultPortfolio: state?.currentPortfolio?.portfolioId,
        defaultProject: state?.currentProject?.projectId,
      },
    };
    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200) {
        dispatch(setPreference(payload.preferencesJson));
      }
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    if (state.dashboardType == "slate2.0") dispatch(setCurrentLevel("project"));
  }, [state.dashboardType]);

  useEffect(() => {
    // fetchProjects();
  }, [state.refreshProjects]);

  const fetchProjectToken = async (argProjectId: number) => {
    try {
      dispatch(setIsLoading(true));
      const ProjectToken: any = {
        tenantId: Number(decodeExchangeToken().tenantId),
        projectId: argProjectId,
        features: projectExchangeTokenFeatures,
      };
      const projectTokenResponse = await postApi(
        "V1/user/login/exchange",
        ProjectToken
      );
      const projectToken = projectTokenResponse.success;
      setProjectExchangeToken(projectToken);
      setProjectSpecificPermission(projectToken);
      dispatch(setProjectToken(projectToken));
      dispatch(setIsLoading(false));
    } catch (error) {
      NotificationMessage.sendNotification(
        `We are unable fetch project token. Please refesh the page`,
        AlertTypes.error
      );
      dispatch(setIsLoading(false));
    }
  };

  const setProjectSpecificPermission = (argToken: string) => {
    const allowedRoles = decodeProjectExchangeToken(argToken).allowedRoles;
    const permissions: any = {};
    for (const [key, value] of Object.entries(projectFeatureAllowedRoles)) {
      const currentRole: any = value;
      permissions[`can${key}`] = allowedRoles.indexOf(currentRole) > -1;
    }
    dispatch(setProjectPermissions(permissions));
  };

  const navigate = () => {
    sessionStorage.setItem("selectedMenu", "Home");
    dispatch(setSelectedMenu("Home"));
    history.push("/");
  };

  const openDropdown = () => {
    setOpenDropdown(!isOpenDropdown);
  };

  const openPortfolioDropdown = () => {
    setOpenPortfolioDropdown(!isOpenPortfolioDropdown);
  };

  const projectOptions = state.projectList.map((option: any) => {
    // const isRecent = option.title[0].toUpperCase();
    if (state?.isOnxTenant || state?.dashboardType === "slate2.0") {
      return (
        option.projectId !== 0 && {
          // recent: option.isRecent ? "Recent" : "All Projects",
          ...option,
          projectName: option.projectName,
        }
      );
    } else {
      return {
        // recent: option.isRecent ? "Recent" : "All Projects",
        ...option,
        projectName: option.projectName,
      };
    }
  });

  const portfolioOptions: [
    {
      portfolioId: number;
      portfolioName: string;
      projectInfos: [any];
    }
  ] = state.portfolioList?.length
      ? state.portfolioList.map((option: any) => {
        // const isRecent = option.title[0].toUpperCase();
        return {
          // recent: option.isRecent ? "Recent" : "All Portfolios",
          ...option,
          portfolioName: option.portfolioName,
        };
      })
      : [];

  const handleProjectSelection = (val: any) => {
    const selectedProject = state.projectList.find(
      (item: any) => item.projectName === val?.projectName
    );
    if (state.editMode) {
      const payload = {
        type: "PROJECT",
        selectedValue: selectedProject,
      };
      sessionStorage.setItem("promptResponse", "INPROGRESS");
      history.push("/");
      handlePromptResponse(payload);
    } else {
      handleProjectChange(selectedProject, true);
    }
  };

  const handleProjectChange = (selectedProject: any, reRoute = false) => {
    if (selectedProject) {
      if (selectedProject.projectName === "All") {
        sessionStorage.setItem("selectedProject", JSON.stringify(null));
      } else {
        sessionStorage.setItem(
          "selectedProject",
          JSON.stringify(selectedProject)
        );
      }
      dispatch(setCurrentProject(selectedProject));
      setOpenDropdown(false);
      if (reRoute) {
        history.push("/");
      }
      if (selectedProject.projectName === "All") {
        sessionStorage.setItem("level", "portfolio");
        dispatch(setCurrentLevel("portfolio"));
        dispatch(setSelectedMenu("Home"));
        sessionStorage.setItem("selectedMenu", "Home");
      } else {
        dispatch(setSelectedMenu("Home"));
        sessionStorage.setItem("selectedMenu", "Home");
        sessionStorage.setItem("level", "project");
        dispatch(setCurrentLevel("project"));
      }
    }
  };

  const handlePortfolioSelection = (val: any) => {
    const selectedPortfolio = state.portfolioList?.find(
      (item: any) => item.portfolioName === val?.portfolioName
    );
    if (state.editMode) {
      const payload = {
        type: "PORTFOLIO",
        selectedValue: selectedPortfolio,
      };
      sessionStorage.setItem("promptResponse", "INPROGRESS");
      history.push("/");
      handlePromptResponse(payload);
    } else {
      handlePortfolioChange(selectedPortfolio, true);
    }
  };

  const handlePortfolioChange = (selectedPortfolio: any, reRoute = false) => {
    if (selectedPortfolio) {
      dispatch(setCurrentPortfolio(selectedPortfolio));
      setOpenPortfolioDropdown(false);
      if (reRoute) {
        history.push("/");
      }
      sessionStorage.setItem(
        "selectedPortfolio",
        JSON.stringify(selectedPortfolio)
      );
      sessionStorage.setItem("selectedProject", JSON.stringify(null));
      dispatch(setCurrentProject(state.projectList[0]));
      state.dashboardType !== "slate2.0" &&
        sessionStorage.setItem("level", "portfolio");
      state.dashboardType !== "slate2.0" &&
        dispatch(setCurrentLevel("portfolio"));
    }
  };

  const handlePromptResponse = (argValue: any) => {
    const response = sessionStorage.getItem("promptResponse");
    if (response) {
      if (response === "PROCEED") {
        sessionStorage.setItem("promptResponse", "COMPLETED");
        actOnActionToBeTaken(argValue);
        dispatch(setEditMode(false));
      }
    }
    if (response === "COMPLTETD") {
      clearTimeout(timer);
    }
    if (response === "INPROGRESS" || response === null) {
      timer = setTimeout(() => {
        handlePromptResponse(argValue);
      }, 1000);
    }
  };

  const actOnActionToBeTaken = (argValue: any) => {
    if (argValue) {
      switch (argValue.type) {
        case "PROJECT": {
          handleProjectChange(argValue.selectedValue);
          return;
        }
        case "PORTFOLIO": {
          handlePortfolioChange(argValue.selectedValue);
          return;
        }
        case "NAVIGATION": {
          dispatch(setSelectedMenu(argValue.selectedValue));
          return;
        }
      }
    }
  };

  const handleModuleListClick = (event: any) => {
    event.preventDefault();
    setModuleListAnchorEl(event.currentTarget);
  };

  const handleModuleListClose = () => {
    setModuleListAnchorEl(null);
  };

  const savePreference = async (data: any) => {
    const payload = {
      tenantId: Number(decodeExchangeToken().tenantId),
      userId: decodeExchangeToken().userId,
      preferencesJson: { ...state?.selectedPreference, menuItems: data },
    };
    const token = getExchangeToken();
    try {
      const response = await axios.post(
        `${process.env["REACT_APP_DASHBOARD_URL"]}dashboard/savePreferences`,
        payload,
        {
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response?.status === 200) {
        dispatch(setPreference(payload.preferencesJson));
      }
    } catch (error) {
      console.log(error);
    }
  };

  const addMenuToDock = () => {
    handleCloseContextMenu();
    const temp = state?.selectedPreference?.menuItems || [];
    const index = temp.indexOf(selectedMenuItem);
    if (index > -1) {
      temp.splice(index, 1); // 2nd parameter means remove one item only
      savePreference(temp);
    } else {
      temp.push(selectedMenuItem);
      console.log("temp", temp);
      savePreference(temp);
    }
  };
  // @todo can't use state.isLoading to stop the UI render, need fix
  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar
        style={{ visibility: pathname === "mapView" ? "hidden" : "visible" }}
        position="fixed"
        color="inherit"
        // className={classes.appBar}
        classes={{
          root: open
            ? classes.appBarShift
            : stateView === "third"
              ? classes.appBarShiftClose
              : "false",
        }}
        className={classNames({
          [classes.appBar]:
            !state.headerShown &&
            !state.isOnxTenant &&
            pathname !== "inspectionForm",
          [classes.appBarSlate]:
            !state.headerShown &&
            !state.isOnxTenant &&
            pathname !== "inspectionForm" &&
            state.dashboardType === "slate2.0",
          [classes.appBarClassic]: state.dashboardType === "classic",
          [classes.appBarOnx]: !state.headerShown && state.isOnxTenant,
          [classes.appBarHeader]: state.headerShown,
          [classes.tenantHeader]:
            pathname === "/" &&
            !state.headerShown &&
            !isUserPCLButNotAdmin &&
            state.dashboardType !== "slate2.0",
          [classes.tenantHeader]:
            pathname === "" &&
            !state.headerShown &&
            !state.isOnxTenant &&
            !isUserPCLButNotAdmin &&
            state.dashboardType !== "slate2.0",
          [classes.tenantHeaderOnx]:
            pathname === "" &&
            !state.headerShown &&
            state.isOnxTenant &&
            !isUserPCLButNotAdmin,
        })}
      >
        <Toolbar
          disableGutters={true}
          className={classNames(classes.toolbarHeight, "header__toolbar")}
        >
          <img
            id="Header-Logo"
            src={SlateLogo}
            className={classes.slateLogo}
            onClick={navigate}
          />
          {!state.isLoading &&
            state.currentLevel !== "tenant" &&
            !isUserPCLButNotAdmin && (
              <div className="header__left__portfolio">
                <>
                  <div
                    className="header__left__portfolio__title"
                    data-testid={`header-portfolio`}
                  >
                    Portfolio
                  </div>
                  <DropdownSearch
                    open={isOpenPortfolioDropdown}
                    selectedValue={state.currentPortfolio}
                    handleDropDownClick={openPortfolioDropdown}
                    options={portfolioOptions}
                    optionLabel={"portfolioName"}
                    handleDropdownSelectionChange={handlePortfolioSelection}
                    isDisabled={state.currentLevel !== "tenant" ? false : true}
                    type={"portfolio"}
                    transparent={
                      pathname === "" && state.projectList?.length === 1
                    }
                    isOnxTenant={state.isOnxTenant}
                  />
                </>
                {state.projectList && state.projectList?.length > 1 && (
                  <>
                    <div
                      className="header__left__portfolio__title"
                      data-testid={`header-portfolio-project`}
                    >
                      Project
                    </div>
                    <div>
                      <DropdownSearch
                        open={isOpenDropdown}
                        selectedValue={state.currentProject}
                        handleDropDownClick={openDropdown}
                        options={projectOptions}
                        optionLabel={"projectName"}
                        handleDropdownSelectionChange={handleProjectSelection}
                        isDisabled={
                          state.projectList?.length > 1 &&
                            state.currentLevel !== "tenant"
                            ? false
                            : true
                        }
                        transparent={
                          pathname === "" && state.projectList?.length === 1
                        }
                        type={"project"}
                        isOnxTenant={state.isOnxTenant}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          <div className={classes.grow} />
          <div className="header__right">
            {/* <div className="header__right__portfolio">
              <div
                className="header__right__portfolio__title"
                data-testid={`header-portfolio`}
              >
                Tenant
              </div>
              <div className="header__right__portfolio__option">
                <FormControl fullWidth>
                  <Select
                    data-testid={`header-project-select`}
                    labelId="demo-simple-select-helper-label"
                    id="demo-simple-select-helper"
                    value={currentTenant ? currentTenant : "Add Tenant"}
                    onChange={handleChangeInTenant}
                    MenuProps={{
                      classes: { paper: popOverclasses.root },
                      anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left",
                      },
                      transformOrigin: {
                        vertical: "top",
                        horizontal: "left",
                      },
                      getContentAnchorEl: null,
                    }}
                  >
                    {tenantList.map((item: any, index: number) => (
                      <MenuItem
                        value={item.id}
                        className={"addIconContainer__optionFont"}
                        data-testid={`header-project-select-${index}`}
                        key={`Project-${item.name}-${index}`}
                      >
                        {item.name}
                      </MenuItem>
                    ))}
                    {showAddTenant && (
                      <MenuItem
                        className={
                          "addIconContainer addIconContainer__optionFont"
                        }
                        value="Add Tenant"
                        key={`Project-AddTenant`}
                      >
                        <IconButton className={"addIconContainer__parent"}>
                          <AddIcon className={"addIconContainer__addIcon"} />
                        </IconButton>
                        Add Tenant
                      </MenuItem>
                    )}
                  </Select>
                </FormControl>
              </div>
            </div> */}
            {/* {state.dashboardType === "slate2.0" && (
              <HomeIcon
                className="homeIcon"
                onClick={() => history.push("/")}
              />
            )} */}
            {/* <ShowComponent showState={adminUser && pathname === 'connectors'}>
              <AgaveLink />
            </ShowComponent> */}
            <Typography
              component="span"
              variant="body2"
              color="textPrimary"
              className={
                state.dashboardType === "classic"
                  ? "user-name"
                  : "user-name yellowColor"
              }
            >
              Welcome {decodeExchangeToken().userName}!
            </Typography>
            {state.dashboardType === "slate2.0" && (
              <IconButton
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() => history.push("/")}
              >
                <HomeIcon className="homeIcon" />
              </IconButton>
            )}
            {state.isOnxTenant && state.projectList?.length > 1 && (
              <IconButton
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onClick={() =>
                  history.push(
                    `/base/project-lists/${state.currentProject?.projectId}/details`
                  )
                }
              >
                <ProjectSettingIcon style={{ color: "#fff" }} />
              </IconButton>
            )}

            {state?.projectList?.length > 1 &&
              !isUserPCLButNotAdmin &&
              state.dashboardType === "classic" && (
                <IconButton
                  aria-haspopup="true"
                  onClick={handleWeather}
                  color="primary"
                >
                  <img src={gif} className={classes.weatherIcon} alt=""></img>
                </IconButton>
              )}
            <Popover
              id={Boolean(weatherEl) ? "simple-popover" : undefined}
              open={Boolean(weatherEl)}
              anchorEl={weatherEl}
              keepMounted
              onClose={handleCloseWeather}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              getContentAnchorEl={null}
              classes={{
                paper: classes.popoverPaper,
              }}
            >
              <WeatherPopup />
            </Popover>
            {!isUserPCLButNotAdmin && state.dashboardType === "classic" && (
              <IconButton
                aria-haspopup="true"
                onClick={(e) => handleNotification(e)}
                className={classes.colorWhite}
              >
                {state?.notificationBadgeCount ? (
                  <Badge
                    badgeContent={state?.notificationBadgeCount}
                    color="secondary"
                  >
                    <NotificationsIcon />
                  </Badge>
                ) : (
                  <Badge color="secondary">
                    <NotificationsIcon />
                  </Badge>
                )}
              </IconButton>
            )}
            <Popover
              id={Boolean(notificationEl) ? "notification-popover" : undefined}
              open={Boolean(notificationEl)}
              anchorEl={notificationEl}
              onClose={() => setNotificationEl(null)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "right",
              }}
              getContentAnchorEl={null}
            >
              {[1].map((item, index) => (
                <Notification
                  key={`Notification-container-${index}`}
                  handleUpdateUnreadCount={(count: number) =>
                    dispatch(setNotificationBadgeCount(count))
                  }
                  unreadCount={state?.notificationBadgeCount}
                  closePopup={() => setNotificationEl(null)}
                />
              ))}
            </Popover>
            <IconButton
              aria-owns={"menu-appbar"}
              aria-haspopup="true"
              onClick={(e) => {
                state.dashboardType === "classic"
                  ? handleAccount(e)
                  : handleSlate2Account(e);
              }}
              className={
                state.dashboardType === "classic"
                  ? classes.accountIcon
                  : classes.accountIconSlate
              }
            >
              {state.dashboardType === "classic" ? (
                <AccountCircle />
              ) : (
                <img src={MenuIcon} className="app-icon" />
              )}
            </IconButton>
            {state.dashboardType != "classic" && (
              <IconButton
                aria-owns={"menu-appbar"}
                aria-haspopup="true"
                onClick={(e) => {
                  handleAccount(e);
                }}
              >
                <AccountCircle
                  className="icon-style"
                  style={{ color: "#f7b047" }}
                />
              </IconButton>
            )}
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl3}
              open={Boolean(anchorEl3)}
              onClose={handleClose}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              classes={{
                paper:
                  pathname === "" && state.projectList?.length === 1
                    ? classes.paperTransparent
                    : state.isOnxTenant
                      ? classes.paperOnx
                      : classes.paper,
              }}
              className={
                state.isOnxTenant ? "acct-dropdown-onx" : "acct-dropdown"
              }
            >
              <MenuItem
                onClick={() => {
                  handleClose();
                  setUserProfileModalOpen(true);
                }}
                className={
                  state.dashboardType != "classic"
                    ? "mat-menu-item-sm icon-style"
                    : "mat-menu-item-sm"
                }
              >
                My Profile
              </MenuItem>
              {showAddTenant && (
                <MenuItem
                  className={
                    state.dashboardType != "classic"
                      ? "mat-menu-item-sm icon-style"
                      : "mat-menu-item-sm"
                  }
                  onClick={() => {
                    handleClose();
                    setPreferenceOpen(true);
                  }}
                >
                  Accounts
                </MenuItem>
              )}
              {state.dashboardType != "classic" && <MenuItem
                className={
                  state.dashboardType != "classic"
                    ? "mat-menu-item-sm icon-style"
                    : "mat-menu-item-sm"
                }
                onClick={() => {
                  handleAbout()
                }}
              >
                About
              </MenuItem>}
              {!state.isOnxTenant &&
                showProductionCenterMenu &&
                !isUserPCLButNotAdmin && (
                  <MenuItem
                    className={
                      state.dashboardType != "classic"
                        ? "mat-menu-item-sm icon-style"
                        : "mat-menu-item-sm"
                    }
                    onClick={() => {
                      handleClose();
                      updateTenantDetails();
                    }}
                  >
                    {productionCenterEnabled ? "Disable" : "Enable"} Production
                    Center
                  </MenuItem>
                )}
              {state.dashboardType === "classic" ? (
                <>
                  {showAddTenant && (
                    <MenuItem
                      className="mat-menu-item-sm"
                      onClick={handleAddTenant}
                    >
                      Add Account
                    </MenuItem>
                  )}
                  <MenuItem
                    className="mat-menu-item-sm"
                    onClick={() => {
                      handleClose();
                      sessionStorage.setItem("level", "project");
                      sessionStorage.setItem("dashboardType", "slate2.0");
                      history.push("/");
                      location.reload();
                    }}
                  >
                    Slate 2.0
                  </MenuItem>
                  <MenuItem
                    className="mat-menu-item-sm"
                    onClick={() => {
                      setOpenSupportModal(true);
                      handleClose();
                    }}
                  >
                    Support
                  </MenuItem>
                </>
              ) : null}

              <MenuItem onClick={loggingOut} className="mat-menu-item-sm">
                Logout
              </MenuItem>
            </Menu>
            <Menu
              id="menu-appbar header2"
              anchorEl={anchorEl4}
              open={Boolean(anchorEl4)}
              // open={true}
              onClose={handleClose}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              classes={{
                paper: classes.menuPaper,
              }}
            >
              {!isUserPCLButNotAdmin ? (
                <>
                  <div className="header__slate2Menu-headContainer">
                    <div className="header__slate2Menu-headContainer__tabContainer">
                      <span
                        className={
                          selectedMenuTab === "analyze"
                            ? "header__slate2Menu-headContainer__tabContainer__selectedTab"
                            : "header__slate2Menu-headContainer__tabContainer__tab"
                        }
                        onClick={() => setSelectedMenuTab("analyze")}
                      >
                        Analyze
                      </span>
                    </div>
                    <div className="header__slate2Menu-headContainer__tabContainer">
                      <span
                        className={
                          selectedMenuTab === "manage"
                            ? "header__slate2Menu-headContainer__tabContainer__selectedTab"
                            : "header__slate2Menu-headContainer__tabContainer__tab"
                        }
                        onClick={() => setSelectedMenuTab("manage")}
                      >
                        Manage
                      </span>
                    </div>
                    <div className="header__slate2Menu-headContainer__tabContainer">
                      <span
                        className={
                          selectedMenuTab === "administer"
                            ? "header__slate2Menu-headContainer__tabContainer__selectedTab"
                            : "header__slate2Menu-headContainer__tabContainer__tab"
                        }
                        onClick={() => setSelectedMenuTab("administer")}
                      >
                        Administer
                      </span>
                    </div>
                    <div className="header__slate2Menu-headContainer__tabContainer">
                      <span
                        className={
                          selectedMenuTab === "settings"
                            ? "header__slate2Menu-headContainer__tabContainer__selectedTab"
                            : "header__slate2Menu-headContainer__tabContainer__tab"
                        }
                        onClick={() => setSelectedMenuTab("settings")}
                      >
                        Settings
                      </span>
                    </div>
                  </div>
                  <div className="header__slate2Menu-menuItemsContainer">
                    {appMenuItems?.length
                      ? appMenuItems?.map((menuItem: any) =>
                        menuItem.items?.map((subMenuItem: any, j: number) =>
                          selectedMenuTab === subMenuItem?.parent &&
                            subMenuItem?.show ? (
                            <Tooltip
                              classes={{
                                tooltip: classes.tooltipStyle,
                              }}
                              key={j}
                              title={
                                subMenuItem.name?.length >= 11
                                  ? subMenuItem.name
                                  : ""
                              }
                              placement="top"
                            >
                              <div
                                key={j}
                                className={
                                  (j + 1) % 4 === 0
                                    // eslint-disable-next-line max-len
                                    ? "header__slate2Menu-menuItemsContainer__menuItemContainer header__slate2Menu-menuItemsContainer__menuItemContainer__lastMenuItem"
                                    : "header__slate2Menu-menuItemsContainer__menuItemContainer"
                                }
                                onContextMenu={(ev: any) => {
                                  if (subMenuItem.showContextMenu) {
                                    setSelectedMenuItem(subMenuItem.name);
                                    handleContextMenu(ev);
                                  } else return;
                                }}
                                onClick={subMenuItem?.link}
                              >
                                {subMenuItem?.childIcon ? (
                                  <subMenuItem.childIcon
                                    className="header__slate2Menu-menuItemsContainer__menuItemContainer__icon"
                                    htmlColor="#fe9a0b"
                                  />
                                ) : (
                                  <img
                                    className="header__slate2Menu-menuItemsContainer__menuItemContainer__img"
                                    src={subMenuItem.imgSrc}
                                  />
                                )}
                                <span
                                  className={
                                    subMenuItem?.childIcon
                                      ? "header__slate2Menu-menuItemsContainer__menuItemContainer__txt"
                                      : "header__slate2Menu-menuItemsContainer__menuItemContainer__imgTxt"
                                  }
                                >
                                  {subMenuItem.label}
                                </span>
                                {state?.selectedPreference?.menuItems?.includes(
                                  subMenuItem.name
                                ) ? (
                                  <DockIcon className="header__slate2Menu-menuItemsContainer__menuItemContainer__dockIcon" />
                                ) : (
                                  ""
                                )}
                              </div>
                            </Tooltip>
                          ) : null
                        )
                      )
                      : null}
                  </div>
                </>
              ) : (
                <div className="header__slate2Menu-container">
                  <div className="header__slate2Menu-container__menuItem">
                    <MenuItem
                      classes={{
                        root: classes.menuItemRoot,
                      }}
                      className="mat-menu-item-sm"
                    >
                      <div
                        className="header__slate2Menu-container__menuItem__iconContainer"
                        onContextMenu={(ev: any) => {
                          setSelectedMenuItem("Classic");
                          handleContextMenu(ev);
                        }}
                        onClick={() => {
                          handleClose();
                          sessionStorage.setItem("level", "project");
                          sessionStorage.setItem("dashboardType", "classic");
                          history.push("/");
                          location.reload();
                        }}
                      >
                        <ClassicIcon className="header__slate2Menu-container__menuItem__iconContainer__icon1" />
                        <span>Engine Room</span>
                      </div>
                    </MenuItem>
                  </div>
                  <div className="header__slate2Menu-container__menuItem">
                    <MenuItem
                      classes={{
                        root: classes.menuItemRoot,
                      }}
                      onClick={loggingOut}
                      style={{ marginTop: "-1rem !important" }}
                      className="mat-menu-item-sm"
                    >
                      <div className="header__slate2Menu-container__menuItem__iconContainer">
                        <LogoutIcon className="header__slate2Menu-container__menuItem__iconContainer__icon1" />
                        <span>Logout</span>
                      </div>
                    </MenuItem>
                  </div>
                </div>
              )}
            </Menu>
            <Menu
              id="context-menu"
              anchorEl={contextAnchorEl}
              open={openContextMenu}
              onClose={handleCloseContextMenu}
              getContentAnchorEl={null}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "center",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "center",
              }}
              classes={{
                paper: classes.dockPaper,
              }}
            >
              <MenuItem onClick={() => addMenuToDock()}>
                {state?.selectedPreference?.menuItems?.includes(
                  selectedMenuItem
                )
                  ? "Remove from Dock"
                  : "Keep in Dock"}
              </MenuItem>
            </Menu>
            {userProfileModalOpen ? (
              <MyProfile
                open={userProfileModalOpen}
                handleCloseModal={() => setUserProfileModalOpen(false)}
              />
            ) : (
              <> </>
            )}
            {preferenceOpen && (
              <Preference
                open={preferenceOpen}
                currentTenant={Number(getActiveTenantId())}
                handleClose={() => setPreferenceOpen(false)}
              />
            )}
          </div>
        </Toolbar>
      </AppBar>
      <RightDrawer
        classes={classes}
        handleRightDrawerClose={handleRightDrawerClose}
        openRightPanel={openRightPanel}
      />
      {!state.isOnxTenant &&
        state.dashboardType === "classic" &&
        sideBarPos === "vertical" &&
        (stateView === "second" || stateView === "third") && (
          <LeftDrawer
            classes={classes}
            open={open}
            state={stateView}
            handleDrawerOpen={handleDrawerOpen}
            handleListItem={(ev, parent) => handleListItem(ev, parent)}
            selectedMenu={state.selectedMenu}
            getProjects={getProjects}
            getPortfolios={getPortfolios}
            productionCenterEnabled={productionCenterEnabled}
          />
        )}
      {openDialog && state.dashboardType === "classic" && (
        <AddTenantDialog
          openDialog={openDialog}
          companyIds={props?.companyIds}
          showAddTenant={showAddTenant}
          handleClose={(e: any) => setOpenDialog(false)}
        ></AddTenantDialog>
      )}
      {/* {openDialog && state.dashboardType === "slate2.0" && (
        <AddTenantDialog2
          openDialog={openDialog}
          companyIds={props?.companyIds}
          showAddTenant={showAddTenant}
          handleClose={(e: any) => setOpenDialog(false)}
        ></AddTenantDialog2>
      )} */}
      <div className={classes.fullWidth}>
        <div className={classes.toolbar} />
        {(sideBarPos === "horizontal 1" || sideBarPos === "horizontal 2") && (
          <div
            className={
              sideBarPos === "horizontal 1" ? classes.bottomBar : classes.topBar
            }
          >
            <HorizontalNavbar
              classes={classes}
              handleClose={handleClose}
              handleListItem={(ev) => handleListItem(ev, "")}
              handleLayouts={handleLayouts}
              anchorEl2={anchorEl2}
            />
          </div>
        )}
        <main
          className={classNames({
            [classes.content]: true,
            [classes.paddingTop]: sideBarPos === "horizontal 2",
          })}
        >
          <RootNavigation />
        </main>
        <div></div>
        {stateView === "fourth" && !state.editMode && (
          <MicroDrawer
            handleDrawerOpen={handleDrawerOpen}
            classes={classes}
            stateView={stateView}
          />
        )}
        {state.bottomMenu.showBottomMenu !== null && <BottomTab />}
        {mailModal ? (
          <InsightSendMail
            onClose={() => {
              setMailModal(null);
            }}
            insight={mailModal}
          />
        ) : (
          <></>
        )}
        {state.dashboardType === "slate2.0" &&
          !state?.bottomMenu?.showChatPanel &&
          !isUserPCLButNotAdmin && (
            <div className="header__chatAIButtonContainer">
              <div
                className="header__chatAIButtonContainer__button"
                onClick={() => {
                  dispatch(setZIndexPriority("chatPanel"));
                  dispatch(
                    handleBottomMenus({
                      ...state.bottomMenu,
                      showChatPanel: !state.bottomMenu.showChatPanel,
                      showBottomMenu: false,
                    })
                  );
                }}
              >
                AI
              </div>
            </div>
          )}
        {state.dashboardType === "slate2.0" && !isUserPCLButNotAdmin && (
          <div
            className="header__slate2SideMenuButton"
            onClick={() => {
              dispatch(
                handleBottomMenus({
                  ...state.bottomMenu,
                  showSlate2SideMenu: !state.bottomMenu.showSlate2SideMenu,
                })
              );
            }}
          >
            {state.bottomMenu.showSlate2SideMenu ? (
              <ArrowLeftIcon htmlColor="#f7b047" />
            ) : (
              <ArrowRightIcon htmlColor="#f7b047" />
            )}
          </div>
        )}
        {showCube &&
          state.dashboardType === "slate2.0" &&
          !isUserPCLButNotAdmin && (
            <div className="header__cubeContainer">
              <div
                className={"header__wrap"}
                onClick={() => {
                  dispatch(setZIndexPriority("bottomMenu"));
                  dispatch(
                    handleBottomMenus({
                      ...state.bottomMenu,
                      showBottomMenu: true,
                    })
                  );
                }}
              >
                <div className={"header__cube"}>
                  <div className={"header__front"}></div>
                  <div className={"header__back"}></div>
                  <div className={"header__top"}></div>
                  <div className={"header__bottom"}></div>
                  <div className={"header__left"}></div>
                  <div className={"header__right1"}></div>
                </div>
              </div>
            </div>
          )}
      </div>
      <WelcomeScreenModal
        open={openWelcomeScreen}
        handleClose={() => setOpenWelcomeScreen(!openWelcomeScreen)}
      />
      {openProjectPhase && (
        <ProjectPhaseDialog
          open={openProjectPhase}
          onClose={handleCloseProjectPhase}
        />
      )}
      <About open={openAbout} onClose={handleCloseAbout} />
      {showAddTenant && <PasswordConfigure open={passwordConfigureModal} handleCloseModal={handleClosePassword} />}
      <Support
        open={openSupportModal}
        handleClose={() => setOpenSupportModal(!openSupportModal)}
      />
      <Prompt
        when={state.editMode ? true : false}
        message="You are navigating away from this page. Any unsaved changes will be lost."
      />
      <SwipeWrapper
        open={state.bottomMenu?.showNotificationPopup}
        placement={{ left: "0" }}
        height={"86%"}
        animationType={"leftToRight"}
        zIndexPriority={state?.zIndexPriority === "insightNotification"}
      >
        <InsightNotification
          open={state.bottomMenu?.showNotificationPopup}
          mailModal={mailModal}
          setMailModal={setMailModal}
          handleClose={() => {
            dispatch(
              handleBottomMenus({
                ...state.bottomMenu,
                showNotificationPopup: false,
                showBottomMenu: false,
              })
            );
          }}
        />
      </SwipeWrapper>
      <SwipeWrapper
        open={state.bottomMenu?.showChatPanel}
        placement={{ right: 0 }}
        height={"86%"}
        zIndexPriority={state?.zIndexPriority === "chatPanel"}
        isDraggable={true}
      >
        <Chat
          open={state.bottomMenu?.showChatPanel}
          handleClose={() => {
            dispatch(
              handleBottomMenus({
                ...state.bottomMenu,
                showChatPanel: false,
                showBottomMenu: false,
              })
            );
          }}
          selectedState={"chat"}
        />
      </SwipeWrapper>
      <SwipeWrapper
        open={state.bottomMenu?.showSlate2SideMenu}
        placement={{
          left: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
        animationType={"leftToRight"}
        zIndexPriority={true}
        width={"110px"}
        height={"auto"}
        transition={"all 1s ease"}
      >
        <Slate2SideMenu pathname={pathname} />
      </SwipeWrapper>
    </div>
  );
};

export default withStyles(styles, { withTheme: true })(Header);
