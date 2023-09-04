import './SideMenu.scss';

import {
  Collapse,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import {
  ArrowDropDown as ArrowDropDownIcon,
  ArrowDropUp as ArrowDropUpIcon,
  Ballot as Ballot,
  BorderColorOutlined as DailyLogIcon,
  Business as BusinessIcon,
  CalendarToday as CalendarToday,
  CollectionsBookmarkOutlined as BookMark,
  Dashboard as DashboardIcon,
  EmojiPeople as EmojiPeople,
  Equalizer as EqualizerIcon,
  FolderOpen as FolderOpenIcon,
  Home as HomeIcon,
  Input as InputIcon,
  LibraryBooks as IconLibraryBooks,
  ListAlt as ListAltIcon,
  LocationOn as LocationOnIcon,
  LowPriority as LowPriority,
  People as People,
  Receipt as Recipes,
  Settings as SettingsIcon,
  UsbTwoTone as UsbIcon,
} from '@material-ui/icons';
import { PhotoLibraryOutlined as DocumentLibraryIcon } from '@mui/icons-material';
import ThunderstormOutlinedIcon from '@mui/icons-material/ThunderstormOutlined';
import classNames from 'classnames';
import { ReactElement, useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { client } from 'src/services/graphql';

import {
  decodeExchangeToken,
  decodeProjectFormExchangeToken,
  decodeToken,
} from '../../../../services/authservice';
import {
  setCurrentLevel,
  setCurrentProject,
  setEditMode,
} from '../../context/authentication/action';
import { stateContext } from '../../context/authentication/authContext';
import { LOAD_PROJECT_ROLES } from '../graphql/queries';
import {
  CompaniesIcon,
  DrawingsIcon,
  FormTemplateIcon,
  InsightsIcon,
  ListIcon,
  MaterialIcon,
  ProductivityIcon,
  projectSettingIcon,
  ProjectsIcon,
  TimelineIcon,
} from './IconList';
import {
  canViewBimModel,
  canViewCompanies,
  canViewCustomList,
  canViewDrawings,
  canViewForm,
  canViewFormTemplates,
  canViewProjects,
  canViewProjectSchedule,
  canViewRoles,
  canViewSpecifications,
  canViewTenantCalendar,
  canViewTenantMaterialMaster,
  canViewTenantTask,
  canViewTenantUsers,
  canViewUploads,
  canViewWorkflowTemplate,
} from './permission';
import SideMenuItem from './SideMenuItem';
import { useCanViewVisualize } from './useCanViewVisualize';

interface SideMenuProps {
  handleListItem: (item: any, parent: any) => void;
  getProjects: () => void;
  getPortfolios: () => void;
  openDrawer: boolean;
  selectedMenu: string;
  productionCenterEnabled: boolean;
}

let timer: any = null;

const SideMenu = (props: SideMenuProps): ReactElement => {
  const { handleListItem, openDrawer, selectedMenu } = props;
  const { dispatch, state }: any = useContext(stateContext);
  const [open, setOpen] = useState(true);
  const history = useHistory();
  const [appMenuItems, setAppMenuItems] = useState([]);
  const [hideProjectSettingIcon, setHideProjectSettingIcon] = useState(false);
  const canViewVisualize = useCanViewVisualize();
  const { adminUser } = decodeToken();
  let menuItems: any;

  useEffect(() => canViewProjectSettings(), [state.selectedProjectToken]);

  useEffect(() => {
    let hideTenantLevel = true;
    let hideProjectLevel = true;
    if (state.currentLevel === 'portfolio') {
      hideTenantLevel = true;
      hideProjectLevel = true;
    } else if (state.currentLevel === 'tenant') {
      hideTenantLevel = false;
      hideProjectLevel = true;
    } else if (state.currentLevel === 'project') {
      hideTenantLevel = true;
      hideProjectLevel = false;
    }
    menuItems = [
      {
        name: 'Home',
        level: 1,
        Icon: DashboardIcon,
        link: '/',
        items: [],
        parent: 'Home',
      },
      {
        name: 'Production Center',
        level: 1,
        Icon: HomeIcon,
        link: '/productionCenter',
        items: [],
        show: !hideTenantLevel || !props.productionCenterEnabled,
        parent: 'Production Center',
      },
      {
        name: 'Data',
        level: 1,
        Icon: TimelineIcon,
        items: [
          {
            name: 'Schedule',
            childIcon: EqualizerIcon,
            link: `/scheduling/project-plan/${state.currentProject?.projectId}`,
            level: 2,
            items: [],
            parent: 'Data,Schedule',
            show: hideProjectLevel || !canViewProjectSchedule(),
          },
          {
            name: 'Model',
            childIcon: BusinessIcon,
            level: 2,
            link: `/bim/${state.currentProject?.projectId}/list`,
            show: hideProjectLevel || !canViewBimModel(),
            items: [],
            parent: 'Data,Model',
          },
          {
            name: 'Insights',
            level: 2,
            childIcon: InsightsIcon,
            link: `/insights/projects/${state.currentProject?.projectId}/scheduleImpact`,
            items: [],
            parent: 'Data,Insights',
            show: hideProjectLevel || !canViewProjectSchedule(),
          },
          {
            name: 'Productivity',
            level: 2,
            childIcon: ProductivityIcon,
            link: `/productivityMetrics/${state.currentProject?.projectId}`,
            items: [],
            parent: 'Data,Productivity',
            show: hideProjectLevel || !canViewProjectSchedule(),
          },
          {
            name: 'Visualize',
            level: 2,
            childIcon: LocationOnIcon,
            link: `/visualize/${state.currentProject?.projectId}`,
            items: [],
            parent: 'Data,Visualize',
            show: hideProjectLevel || !canViewVisualize,
          },
        ],
        parent: 'Data',
        show:
          hideProjectLevel || (!canViewProjectSchedule() && !canViewBimModel()),
      },
      {
        name: 'Input',
        level: 1,
        Icon: InputIcon,
        items: [
          {
            name: 'Forms',
            level: 2,
            childIcon: ListAltIcon,
            link: `/base/projects/${state.currentProject?.projectId}/form/2`,
            items: [],
            parent: 'Input,Forms',
            show: hideProjectLevel || !canViewForm(),
          },
          {
            name: 'Daily Logs',
            level: 2,
            childIcon: DailyLogIcon,
            link: `/dailyLogs/projects/${state.currentProject?.projectId}`,
            items: [],
            parent: 'Input,Daily Logs',
            show: hideProjectLevel || !canViewProjectSchedule(),
          },
          {
            name: 'Quality Control',
            level: 2,
            childIcon: ListAltIcon,
            link: `/base/qualityControl/projects/${state.currentProject?.projectId}/building`,
            items: [],
            parent: 'Input,Quality Control',
            show: hideProjectLevel || !canViewForm() || true,
          },
        ],
        parent: 'Input',
        show: hideProjectLevel || (!canViewProjectSchedule() && !canViewForm()),
      },
      {
        name: 'Documents',
        Icon: FolderOpenIcon,
        level: 1,
        show:
          hideProjectLevel || (!canViewDrawings() && !canViewSpecifications()),
        items: [
          {
            name: 'Document Library',
            level: 2,
            childIcon: DocumentLibraryIcon,
            link: `/documentlibrary/projects/${state.currentProject?.projectId}`,
            parent: 'Documents,Document Library',
            show: hideProjectLevel || !canViewUploads(),
          },
          {
            name: 'Drawings',
            level: 2,
            childIcon: DrawingsIcon,
            link: `/drawings/projects/${state.currentProject?.projectId}/lists`,
            parent: 'Documents,Drawings',
            disable: !canViewDrawings(),
          },
          {
            name: 'Specification',
            level: 2,
            childIcon: BookMark,
            link: `/specifications/projects/${state.currentProject?.projectId}/lists`,
            parent: 'Documents,Specification',
            disable: !canViewSpecifications(),
          },
        ],
      },
      {
        name: 'Project Settings',
        level: 1,
        Icon: projectSettingIcon,
        link: `/base/project-lists/${state.currentProject?.projectId}/details`,
        items: [],
        parent: 'Project Settings',
        show: hideProjectLevel || !hideProjectSettingIcon,
      },
      {
        name: 'Getting Started',
        level: 1,
        Icon: SettingsIcon,
        show:
          hideTenantLevel ||
          (!canViewProjects() && !canViewTenantUsers() && !canViewCompanies()),
        items: [
          {
            name: 'Projects',
            link: '/base/project-lists',
            childIcon: ProjectsIcon,
            level: 2,
            parent: 'Getting Started,Projects',
            disable: !canViewProjects(),
          },
          {
            name: 'Teammates',
            link: '/base/teammates/lists',
            childIcon: People,
            level: 2,
            parent: 'Getting Started,Teammates',
            disable: !canViewTenantUsers(),
          },
          {
            name: 'Companies',
            link: '/base/companies',
            childIcon: CompaniesIcon,
            level: 2,
            parent: 'Getting Started,Companies',
            disable: !canViewCompanies(),
          },
        ],
      },
      {
        name: 'Templates',
        level: 1,
        Icon: ListAltIcon,
        show:
          hideTenantLevel ||
          (!canViewRoles() &&
            !canViewFormTemplates() &&
            !canViewWorkflowTemplate() &&
            !canViewTenantCalendar() &&
            !canViewCustomList()),
        items: [
          {
            name: 'Roles',
            link: '/base/roles',
            childIcon: EmojiPeople,
            level: 2,
            parent: 'Templates,Roles',
            disable: !canViewRoles(),
          },
          {
            name: 'Form Templates',
            link: '/base/forms',
            childIcon: FormTemplateIcon,
            level: 2,
            parent: 'Templates,Form Templates',
            disable: !canViewFormTemplates(),
          },
          {
            name: 'Workflow',
            link: '/workflow',
            childIcon: LowPriority,
            level: 2,
            parent: 'Templates,Workflow',
            disable: !canViewWorkflowTemplate(),
          },
          {
            name: 'Calendar Templates',
            link: '/scheduling/library/calendar',
            childIcon: CalendarToday,
            level: 2,
            parent: 'Templates,Calendar Templates',
            disable: !canViewTenantCalendar(),
          },
          {
            name: 'Custom Lists',
            link: '/base/customList',
            childIcon: ListIcon,
            level: 2,
            parent: 'Templates,Custom Lists',
            disable: !canViewCustomList(),
          },
          {
            name: 'Weather Template',
            link: '/base/weatherTemplate',
            childIcon: ThunderstormOutlinedIcon,
            level: 2,
            parent: 'Templates,Weather Template',
            disable: !canViewCustomList(),
          },
        ],
      },
      {
        name: 'Data Sets',
        level: 1,
        Icon: EqualizerIcon,
        show:
          hideTenantLevel ||
          (!canViewTenantTask() && !canViewTenantMaterialMaster()),
        items: [
          {
            name: 'Recipes',
            link: '/scheduling/library/recipes',
            childIcon: Recipes,
            level: 2,
            parent: 'Data Sets,Recipes',
            disable: !canViewTenantTask(),
          },
          {
            name: 'Material Master',
            link: '/scheduling/library/material-master',
            childIcon: MaterialIcon,
            level: 2,
            parent: 'Data Sets,Material Master',
            disable: !canViewTenantMaterialMaster(),
          },
          {
            name: 'Equipment Master',
            link: '/scheduling/library/equipment-master',
            childIcon: Ballot,
            level: 2,
            parent: 'Data Sets,Equipment Master',
            disable: !canViewTenantMaterialMaster(),
          },
        ],
      },
      {
        name: 'Connectors',
        level: 1,
        Icon: UsbIcon,
        show: !(!hideTenantLevel && adminUser),
        link: '/connectors',
        items: [],
        parent: 'Connectors',
      },
    ];
    setAppMenuItems(menuItems);
  }, [
    state.currentProject,
    state.currentLevel,
    state.selectedProjectToken,
    props.productionCenterEnabled,
    hideProjectSettingIcon,
    canViewVisualize,
  ]);

  const handleTenantLevel = () => {
    history.push('/');
    if (state.editMode) {
      const payload = {
        type: 'TENANT',
      };
      sessionStorage.setItem('promptResponse', 'INPROGRESS');
      handlePromptResponse(payload);
    } else {
      handleChangeInTenantLevel();
    }
  };

  const handleChangeInTenantLevel = () => {
    sessionStorage.setItem('level', 'tenant');
    sessionStorage.setItem('selectedMenu', JSON.stringify(null));
    dispatch(setCurrentLevel('tenant'));
    handleListItem('', 'Home');
    history.push('/');
  };

  const handlePortfolioLevel = () => {
    history.push('/');
    if (state.editMode) {
      const payload = {
        type: 'PORTFOLIO',
      };
      sessionStorage.setItem('promptResponse', 'INPROGRESS');
      handlePromptResponse(payload);
    } else {
      handleChangeInPortFolioLevel();
    }
  };

  const handleChangeInPortFolioLevel = () => {
    sessionStorage.setItem('level', 'portfolio');
    sessionStorage.setItem('selectedProject', JSON.stringify(null));
    sessionStorage.setItem('selectedMenu', JSON.stringify(null));
    dispatch(setCurrentProject(state.projectList[0]));
    dispatch(setCurrentLevel('portfolio'));
    handleListItem('', 'Home');
    history.push('/');
  };

  const handleProjectLevel = () => {
    history.push('/');
    if (state.editMode) {
      const payload = {
        type: 'PROJECT',
      };
      sessionStorage.setItem('promptResponse', 'INPROGRESS');
      handlePromptResponse(payload);
    } else {
      handleProjectLevelChange();
    }
  };

  const handleProjectLevelChange = () => {
    if (state.projectList?.length === 1) return;
    sessionStorage.setItem('level', 'project');
    sessionStorage.setItem('selectedMenu', JSON.stringify(null));
    const selectedProject: any = sessionStorage.getItem('selectedProject');
    if (JSON.parse(selectedProject) === null) {
      sessionStorage.setItem(
        'selectedProject',
        JSON.stringify(state.projectList[1])
      );
      dispatch(setCurrentProject(state.projectList[1]));
    }
    dispatch(setCurrentLevel('project'));
    handleListItem('', 'Home');
    props.getProjects();
    history.push('/');
  };

  const handlePromptResponse = (argValue: any) => {
    const response = sessionStorage.getItem('promptResponse');
    if (response) {
      if (response === 'PROCEED') {
        sessionStorage.setItem('promptResponse', 'COMPLETED');
        actOnActionToBeTaken(argValue);
        dispatch(setEditMode(false));
      }
    }
    if (response === 'COMPLTETD') {
      clearTimeout(timer);
    }
    if (response === 'INPROGRESS' || response === null) {
      timer = setTimeout(() => {
        handlePromptResponse(argValue);
      }, 1000);
    }
  };

  const actOnActionToBeTaken = (argValue: any) => {
    if (argValue) {
      switch (argValue.type) {
        case 'TENANT': {
          handleChangeInTenantLevel();
          return;
        }
        case 'PROJECT': {
          handleProjectLevelChange();
          return;
        }
        case 'PORTFOLIO': {
          handleChangeInPortFolioLevel();
          return;
        }
      }
    }
  };

  function canViewProjectSettings() {
    if (decodeExchangeToken().allowedRoles.includes('viewTenantProjects')) {
      setHideProjectSettingIcon(true);
    } else {
      checkProjectRoles();
    }
  }

  const checkProjectRoles = async () => {
    if (decodeProjectFormExchangeToken()?.projectRoleIds) {
      try {
        const projectsResponse = await client.query({
          query: LOAD_PROJECT_ROLES,
          variables: {
            limit: 1,
            roleId: decodeProjectFormExchangeToken()?.projectRoleIds,
          },
          fetchPolicy: 'network-only',
          context: { role: 'viewMyProjects' },
        });
        if (
          projectsResponse &&
          projectsResponse?.data &&
          projectsResponse.data?.projectPermission.length
        ) {
          setHideProjectSettingIcon(true);
        } else {
          setHideProjectSettingIcon(false);
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  return (
    <div
      className={classNames({
        'sidemenu-container': true,
        'menu-expand': openDrawer && open,
        'list-menu-scroll': open,
      })}
    >
      <List component="nav" disablePadding>
        {appMenuItems &&
          appMenuItems.map((item: any, index: number) => (
            <SideMenuItem
              {...item}
              key={index}
              handleListItem={handleListItem}
              openDrawer={openDrawer}
              selectedMenu={selectedMenu}
            />
          ))}
      </List>
      <div
        className={classNames({
          'bottom-menu': true,
          'margin-bottom': openDrawer,
        })}
      >
        <List component="nav" disablePadding>
          <Collapse
            in={open}
            timeout="auto"
            component="div"
            unmountOnExit
            className={!openDrawer ? 'icon-name' : ''}
          >
            <div
              className={state.projectList?.length > 1 ? 'project-level' : ''}
              data-testid="Project"
            >
              <ListItem
                onClick={() => handleProjectLevel()}
                disabled={state.projectList?.length === 1}
                className={
                  state.projectList?.length === 1 ? 'disabled-icon' : ''
                }
              >
                <ListItemIcon
                  className={classNames({
                    'unselected-menu': state.currentLevel !== 'project',
                    'selected-menu': state.currentLevel === 'project',
                    'min-width-40': openDrawer,
                    'icon-color': true,
                  })}
                >
                  <BusinessIcon className={'icon-style'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      className={classNames({
                        icon: true,
                        'unselected-menu': state.currentLevel !== 'project',
                        'selected-menu': state.currentLevel === 'project',
                      })}
                    >
                      {'Project'}
                    </Typography>
                  }
                ></ListItemText>
              </ListItem>
              {!openDrawer && (
                <div
                  className={classNames({
                    'menu-name': true,
                    'selected-menu': state.currentLevel === 'project',
                    'disabled-icon': state.projectList?.length === 1,
                  })}
                  onClick={() => handleProjectLevel()}
                >
                  Project
                </div>
              )}
            </div>
            <div className={'portfolio-level'} data-testid="Portfolio">
              <ListItem onClick={() => handlePortfolioLevel()}>
                <ListItemIcon
                  className={classNames({
                    'unselected-menu': state.currentLevel !== 'portfolio',
                    'selected-menu': state.currentLevel === 'portfolio',
                    'min-width-40': openDrawer,
                    'icon-color': true,
                  })}
                >
                  <IconLibraryBooks className={'icon-style'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      className={classNames({
                        'unselected-menu': state.currentLevel !== 'portfolio',
                        'selected-menu': state.currentLevel === 'portfolio',
                        icon: true,
                      })}
                    >
                      {'Portfolio'}
                    </Typography>
                  }
                ></ListItemText>
              </ListItem>
              {!openDrawer && (
                <div
                  className={classNames({
                    'menu-name': true,
                    'selected-menu': state.currentLevel === 'portfolio',
                  })}
                  onClick={() => handlePortfolioLevel()}
                >
                  Portfolio
                </div>
              )}
            </div>
            <div className={'tenant-level'} data-testid="Account">
              <ListItem onClick={() => handleTenantLevel()}>
                <ListItemIcon
                  className={classNames({
                    'unselected-menu': state.currentLevel !== 'tenant',
                    'selected-menu': state.currentLevel === 'tenant',
                    'min-width-40': openDrawer,
                    'icon-color': true,
                  })}
                >
                  <SettingsIcon className={'icon-style'} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography
                      className={classNames({
                        icon: true,
                        'unselected-menu': state.currentLevel !== 'tenant',
                        'selected-menu': state.currentLevel === 'tenant',
                      })}
                    >
                      {'Tenant'}
                    </Typography>
                  }
                ></ListItemText>
              </ListItem>
              {!openDrawer && (
                <div
                  className={classNames({
                    'menu-name': true,
                    'selected-menu': state.currentLevel === 'tenant',
                  })}
                  onClick={() => handleTenantLevel()}
                >
                  Account
                </div>
              )}
            </div>
          </Collapse>
        </List>
        <div className={'menu-container'}>
          {open ? (
            <IconButton
              className={'collapse-menu'}
              aria-label="Open drawer-t1"
              onClick={() => setOpen(!open)}
              size="small"
            >
              <ArrowDropDownIcon />
            </IconButton>
          ) : (
            <IconButton
              className={'collapse-menu'}
              aria-label="Open drawer-t2"
              onClick={() => setOpen(!open)}
              size="small"
            >
              <ArrowDropUpIcon />
            </IconButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideMenu;
