import {
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Tooltip,
} from '@material-ui/core';
import Checkbox from '@material-ui/core/Checkbox';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import CancelIcon from '@material-ui/icons/Cancel';
import { gantt } from 'dhtmlx-gantt';
import 'dhtmlx-gantt/codebase/api.js';
import moment from 'moment';
import 'moment-timezone';
import React, {
  ReactElement,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import OutsideClickHandler from 'react-outside-click-handler';
import { match, useHistory, useRouteMatch } from 'react-router-dom';
import useBeforeunload from 'src/customhooks/useUnload';
import ExportSuccessDialog from 'src/modules/baseService/formConsumption/components/ExportSuccessDialog/ExportSuccessDialog';
import BackNavigation from 'src/modules/shared/components/BackNavigation/BackNavigation';
import { postApiWithEchange } from 'src/services/api';
import { v4 as uuidv4 } from 'uuid';
import {
  decodeExchangeToken,
  decodeToken,
} from '../../../../services/authservice';
import {
  setEditMode,
  setIsLoading,
} from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import ConfirmDialog from '../../../shared/components/ConfirmDialog/ConfirmDialog';
import NoDataMessage from '../../../shared/components/NoDataMessage/NoDataMessage';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import ShowComponent from '../../../shared/utils/ShowComponent';
import CreateTask from '../../components/CreateTask/CreateTask';
import Gantt from '../../components/Gantt/Gantt';
import TextFieldCustom from '../../components/TextFieldCustom/TextFieldCustom';
import WarningMessage from '../../components/WarningMessage/WarningMessage';
import EditProjectPlanState from '../../context/editProjectPlan/editProjectPlanState';
import ProjectPlanContext from '../../context/projectPlan/projectPlanContext';
import {
  calculateTotalFloat,
  displayParentTask,
  endDateDecreaseByOneDay,
  endDateIncreaseByOneDay,
  getAllChildrens,
  getMaxExternalIdCount,
  setHasChildifProejectTask,
  setHasChildProperty,
  updateFilterIconValue,
  updateParents,
  updateParentTaskDates,
  updateParentTaskRollUp,
} from '../../utils/ganttConfig';
import {
  ganttToPayload,
  transformDate,
  transformDateToString,
} from '../../utils/ganttDataTransformer';
import {
  doSelectTasks,
  handleDeleteTasks,
  taskActionObj,
} from '../../utils/ganttKeyboardNavigation';
import SaveBaselineVersionPopup from '../ProjectPlan/components/SaveBaselineVersionPopup/SaveBaselineVersionPopup';
import WeeklyPlan from '../WeeklyPlan/WeeklyPlan';
import AddConstraint from './components/AddConstraint/AddConstraint';
import EditTaskDetails from './components/EditTaskDetails/EditTaskDetails';
import FloatingButton from './components/FloatingButton/FloatingButton';
import CopyPasteMenu from './components/MenuOperation/CopyPasteMenu';
import PublishedTaskMenu, {
  PublishedMenuDialog,
  PublishedMenuType,
} from './components/MenuOperation/PublishedTaskMenu';
import ProjectPlanHeader from './components/projectPlanHeader/ProjectPlanHeader';
import ProjectPlanPopover from './components/ProjectPlanPopover/ProjectPlanPopover';
import ProjectTaskPopup from './components/ProjectTaskPopup/ProjectTaskPopup';
import UpdateLink from './components/UpdateLink/UpdateLink';
import ViewVersionListPanel from './components/ViewVersionListPanel/ViewVersionListPanel';
import './ProjectPlan.scss';

let ganttEvents: any = {};
const noPermissionMessage =
  "You don't have permission to view the project plan";
moment.tz.setDefault(); // reset timezone
const userEmail = decodeToken().userEmail;

export interface Params {
  id: string;
  featureId: string;
}
export default function Main(): ReactElement {
  const projectPlanContext = useContext(ProjectPlanContext);
  const pathMatch: match<Params> = useRouteMatch();
  const {
    ganttAction,
    setGanttAction,
    setCurrentTask,
    currentTask,
    saveProjectPlan,
    projectPlan,
    getProjectPlan,
    deleteTasks,
    cpCalculation,
    setCpCalculation,
    xmlImport,
    setXmlImport,
    projectMetaData,
    getProjectMetaData,
    editProjectMetaData,
    lookAheadStatus,
    setCurrentLookaheadWeek,
    calendar,
    getProjectPlanCalendar,
    getProjectUsers,
    newTasksAssignee,
    setNewTasksAssignee,
    partialUpdateTasks,
    getPartialUpdatedTasks,
    bulkUpdateIsDeleteStatus,
    taskStatusUpdateApi,
    getProjectScheduleMetaData,
    addUpdatedTask,
    updatedTask,
    setNewTasks,
    deletedLinkIds,
    addDeletedLink,
    newTasks,
    newLinks,
    setNewLinks,
    setUpdatedLinks,
    updatedLinks,
    deletedTaskIds,
    getChildTask,
    getProjectPlanAllTask,
    getProjectPlanAllTaskAndParse,
    setTaskFromPublishMode,
    uploadFileToS3,
    projectScheduleMetadata,
    getRecipeTaskAndAddToNewTask,
    deleteNewTask,
    getProjectPlanByTaskId,
    clearUpdatedTask,
    deleteUpdatedTask,
    updateSerialNumber,
    currentView,
    setCurrentView,
    setLookAheadStatus,
    currentScale,
    getVersions,
    currentVersionList,
    projectUser,
    getVersionDataById,
    deleteVersion,
    getAllTaskForRecipeSelection,
    clearNewTask,
    tenantCompanyList,
    getTenantCompanies,
    cacheTasks,
    updateProjectMetaDataImportType,
    expandAllButtonFlag,
    setPartialUpdatesIds,
    partialUpdatesIds,
    savePlanSuccessCall,
    setSavePlanSuccessCall,
    getInsightDemoApi,
    productHistoryApiCall,
    getAllProjectPlanCalendar,
    calendarList,
  } = projectPlanContext;

  const history = useHistory();
  const [deleteConfirmation, setDeleteConfirmation] = useState(false);
  const [isUpdateLink, setIsUpdateLink] = useState(false);
  const [addConstaint, setAddConstaint] = useState(false);
  const [linkId, setLinkId] = useState<number | string>('');
  const [taskId, setTaskId] = useState<number | string>('');
  const [isMilestone, setIsMilestone] = useState(false);
  const [typeSelected, setTypeSelected] = useState('');
  const [xmlData, setXmlData] = useState<any>(null);
  const [editTaskDetail, setEditTaskDetail] = useState(false);
  const [showAddTaskButton, setShowAddTaskButton] = useState(false);
  const [projectTaskPopup, setProjectTaskPopup] = useState(false);
  const [projectPlanStatusFlag, setProjectPlanStatusFlag] = useState<any>(null); // flag to keep track of project plan status value 'import' | 'draft' | 'published' | 'intial' | 'discard'
  const [autoScheduleFlag, setAutoScheduleFlag] = useState(false); // false: default value, true autoSchdule Complete
  const [acceptChangesFlag, setAcceptChangesFlag] = useState(false);
  const [autoScheduleWaitPopup, setAutoScheduleWaitPopup] = useState(false);
  const [viewScheduleUpdate, setViewScheduleUpdate] = React.useState(false);
  const [viewVersion, setViewVersion] = useState<any>(false);
  const [viewVersionOutSideClickDisabled, setViewVersionOutSideClickDisabled] =
    useState<any>(false);
  const [confirmErrorMessage, setConfirmErrorMessage] = useState<any>({
    open: false,
    text: '',
    proceed: 'Ok',
  });
  const [discardConfirmDialog, setDiscardConfirmDialog] = useState(false);
  const [linkData, setLinkData] = useState<any>({
    linkId: '',
    predecessor: '',
    successor: '',
    type: '',
    lag: '',
  });

  const [currentGanttView, setCurrentGanttView] = useState('gantt'); // values - gantt (default) | baseline
  const [selectedVersion, setSelectedVersion] = useState<any>('current');
  const [lagData, setLagData] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    mouseX: null | number;
    mouseY: null | number;
    menu: null | string;
  }>({
    mouseX: null,
    mouseY: null,
    menu: null,
  });
  const [scale, setScale] = useState('default');
  const { state: authState, dispatch }: any = useContext(stateContext);
  const [laheadView, setLaheadView] = useState('');
  const [invalidXml, setinvalidXml] = useState(false);
  const [openImport, setOpenImport] = useState(false);
  const [canImport, setCanImport] = useState(true);
  const [loading, isLoading] = useState(false);
  const [openBaselinePopup, setOpenBaselinePopup] = useState(false);
  // const [savePlanSuccessCall, setSavePlanSuccessCall] = useState(false);
  const invalidXMLDetails = {
    header: 'Warning!',
    text: 'The file does not have project plan data. Please use a file with correct data.',
    // cancel: "Cancel",
    proceed: 'OK',
  };
  const [weeklyPlanStatus, setWeeklyPlanStatus] = useState(false);
  const [importWarningPopup, setImportWarningPopup] = useState<any>({
    type: '',
    open: false,
    message:
      'Your file is being uploaded, please do not refresh or close this window',
    okay: false,
  });

  const [popoverObject, setPopoverObject] = useState({
    taskId: '',
    direction: 'top-left',
    pointerX: 0,
    pointerY: 0,
    style: {
      display: 'none',
      top: '0px',
      left: '0px',
    },
  });

  const [todayMarkerId, setTodayMarkerId] = useState<any>(null);

  const [filterState, setFilterState] = useState<{
    type: any;
    criticalTask: boolean;
    assignee: any;
    plannedStart: any;
    plannedEnd: any;
    actualStart: any;
    actualEnd: any;
    responsibleCompany: any;
    text: any;
  }>({
    type: { milestone: false, wbs: false, work_package: false, task: false },
    criticalTask: false,
    assignee: {},
    plannedStart: null,
    plannedEnd: null,
    actualStart: null,
    actualEnd: null,
    responsibleCompany: {},
    text: '',
  });
  const popoverRef: any = useRef(null);
  const [isOpenAssigneeDialog, setOpenAssigneeDialog] =
    React.useState<keyof PublishedMenuType | null>(null);

  useEffect(() => {
    if (partialUpdatesIds.length > 0 && savePlanSuccessCall) {
      bulkUpdateIsDeleteStatus(
        partialUpdatesIds,
        true,
        Number(pathMatch.params.id)
      );
      productHistoryApiCall();
      setPartialUpdatesIds([]);
    }
    setSavePlanSuccessCall(false);
  }, [savePlanSuccessCall]);

  useEffect(() => {
    /**
     * Alert if clicked on outside of element
     */
    function handleClickOutside(event: any) {
      if (popoverRef?.current && !popoverRef?.current?.contains(event.target)) {
        closeTaskDetailsPopover();
      }
    }
    // Bind the event listener
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [popoverRef]);
  useEffect(() => {
    if (
      authState.selectedProjectToken &&
      authState.projectFeaturePermissons?.canviewMasterPlan
    ) {
      getProjectPlanCalendar();
      moment.tz.setDefault(); // reset timezone
      gantt.clearAll();
      getProjectMetaData(true);
      getProjectUsers();
      getAllProjectPlanCalendar();
      getProjectScheduleMetaData();
      setProjectPlanStatusFlag('intial');
      setWeeklyPlanStatus(false);
      getVersions();
      if (showAddTaskButton) setShowAddTaskButton(false);
      getPartialUpdatedTasks();
      if (showAddTaskButton) setShowAddTaskButton(false);
    }

    // detach and attach event for token update inside event
    ganttDetachEvent();
    ganttAttachEvent();
    getTenantCompanies();
  }, [authState.selectedProjectToken, authState.projectFeaturePermissons]);

  useEffect(() => {
    detachOnTaskDblClick();
    ganttEvents = {
      ...ganttEvents,
      onTaskDblClick: attachOnTaskDoubleClick(),
    };
  }, [currentGanttView]);

  useEffect(() => {
    if (authState.isAboutToLogout) {
      publishedOnClose();
    }
  }, [authState.isAboutToLogout]);

  useEffect(() => {
    detachOnAfterLinkDelete();
    detachOnAfterLinkUpdate();
    detachOnBeforeLinkAdd();
    detachOnAfterLinkAdd();
    ganttEvents = {
      ...ganttEvents,
      onAfterLinkDelete: attachOnAfterLinkDelete(),
      attachOnAfterLinkUpdate: attachOnAfterLinkUpdate(),
      onBeforeLinkAdd: attachOnBeforeLinkAdd(),
      onAfterLinkAdd: attachOnAfterLinkAdd(),
    };
  }, [newLinks]);

  useEffect(() => {
    // set work time in calendar
    if (calendar) {
      const days = new Map();
      days.set('Sunday', 0);
      days.set('Monday', 1);
      days.set('Tuesday', 2);
      days.set('Wednesday', 3);
      days.set('Thursday', 4);
      days.set('Friday', 5);
      days.set('Saturday', 6);

      gantt.deleteCalendar('global');

      days.forEach((value, key) => {
        if (calendar.calendar.workingDays.includes(key)) {
          gantt.setWorkTime({ day: days.get(key), hours: [8, 16] });
        } else {
          gantt.setWorkTime({ day: days.get(key), hours: false });
        }
      });
      calendar.calendar.holidayList?.forEach((holiday: any) => {
        gantt.setWorkTime({ date: new Date(holiday.date), hours: false });
      });

      // correct work time when calendar change
      gantt.getTaskByTime().forEach((task: any) => {
        gantt.correctTaskWorkTime(task);
      });
    }
  }, [calendar]);

  useEffect(() => {
    const tempAssigne: any = {};
    Array.from(Object.keys(projectUser)).forEach((userId: any) => {
      if (projectUser[userId]) {
        tempAssigne[userId] = false;
      }
    });
    Array.from(Object.keys(tenantCompanyList)).forEach((companyId: any) => {
      if (tenantCompanyList[companyId]) {
        tempAssigne[companyId] = false;
      }
    });

    setFilterState({ ...filterState, responsibleCompany: tempAssigne });
  }, [projectUser, tenantCompanyList]);

  useEffect(() => {
    // Hide Navbar with condition
    const search = window.location.search;
    const params = new URLSearchParams(search);
    if (params.get('hideNav')) {
      const hideNav: any = JSON.parse(params.get('hideNav') || '');
      if (hideNav) {
        const ele = document.getElementsByClassName('MuiPaper-root')[0];
        const sideNavEle = document.getElementsByClassName('MuiDrawer-root')[0];
        const toolbarEle = document.getElementsByClassName('jss11')[0];
        const backNavigation =
          document.getElementsByClassName('backNavigation')[0];
        ele.classList.add('hide');
        sideNavEle.classList.add('hide');
        toolbarEle.classList.add('hide');
        backNavigation.classList.add('hide');
      }
    }

    gantt.plugins({
      auto_scheduling: true,
      marker: true,
      export_api: true,
    });

    return () => {
      if (!gantt?.config?.readonly) publishedOnClose();
      dispatch(setEditMode(false));
      ganttDetachEvent();
      gantt.clearAll();
    };
  }, []);

  useEffect(() => {
    if (autoScheduleFlag && acceptChangesFlag) {
      savePlan(setAutoScheduleWaitPopup);
      setAcceptChangesFlag(false);
    }
    setAutoScheduleFlag(false);
  }, [autoScheduleFlag, partialUpdatesIds]);

  useEffect(() => {
    if (
      projectMetaData.status === 'draft' &&
      projectMetaData.is_Editable &&
      !importWarningPopup.open
    ) {
      getProjectPlanAllTask(false);
      setProjectPlanStatusFlag(null);
    } else {
      const params = new URLSearchParams(history.location.search);

      if (
        history.location.search.includes('versionId=') &&
        authState.selectedProjectToken
      ) {
        setCurrentGanttView('baseline');
        const versionId = params.get('versionId');
        const isBaseline = params.get('isBaseline');
        getVersionDataById(versionId);
        setSelectedVersion(versionId);
        return;
      }
      if (
        projectMetaData.status === 'published' &&
        ['intial', 'discard'].includes(projectPlanStatusFlag)
      ) {
        checkURLTaskAndLoad();
      }
      if (
        projectMetaData.status === 'published' &&
        ['import'].includes(projectPlanStatusFlag)
      ) {
        getProjectPlan(false);
        setProjectPlanStatusFlag(null);
      }
    }
    if (projectMetaData.status === 'draft' && !projectMetaData.is_Editable) {
      checkURLTaskAndLoad();
    }
  }, [projectMetaData, authState.selectedProjectToken]);

  useEffect(() => {
    ganttDetachEvent();
    ganttAttachEvent();
  }, [cpCalculation]);

  // useEffect(() => {
  // console.log('state.partialUpdatesIds: ', partialUpdatesIds);
  // bulkUpdateIsDeleteStatus(partialUpdatesIds, true);
  // }, [partialUpdatesIds]);

  useEffect(() => {
    if (!lookAheadStatus) {
      adjustStartAndEndDate();
    }
    ganttDetachEvent();
    ganttAttachEvent();
  }, [lookAheadStatus]);

  useEffect(() => {
    ganttDetachEvent();
    ganttAttachEvent();
    if (xmlImport && xmlData != null) {
      const sValue: unknown = undefined;
      gantt.config.start_date = sValue as Date;
      gantt.config.end_date = sValue as Date;
      sessionStorage.setItem('xmlImport', 'true');
      gantt.parse(xmlData);
      // updateGanttForAutoSchedule();
      if (
        projectScheduleMetadata.importType !== 'MSP' &&
        projectScheduleMetadata.importType != 'P6'
      ) {
        gantt.autoSchedule();
      }
      // changeTypeForXmlImport();
      setXmlData(null);
      calculateTotalFloat();
      gantt.render();
      sessionStorage.removeItem('xmlImport');
      // savePlan();
      setXmlImport(false);
      dispatch(setIsLoading(false));
      gantt.eachTask((task: any) => setNewTasks(task));
      gantt.getLinks().forEach((link: any) => setNewLinks(link));
      setHasChildProperty();
    }
  }, [xmlImport, xmlData]);

  useEffect(() => {
    if (
      authState.projectFeaturePermissons?.cancreateMasterPlan &&
      projectMetaData.status === 'draft' &&
      currentGanttView == 'gantt' &&
      projectMetaData.is_Editable
    ) {
      gantt.config.readonly = false;
      setShowAddTaskButton(true);
    } else {
      gantt.config.readonly = true;
      setShowAddTaskButton(false);
    }

    if (projectMetaData.status === 'import') {
      setProjectPlanStatusFlag('import');
      setXmlImport(true);
      setImportWarningPopup({
        type: 'import',
        open: true,
        message:
          'We are importing your project plan and will send you an email once done.',
        okay: true,
      });
    }

    if (authState.selectedProjectToken) getAllProjectPlanCalendar();
  }, [projectMetaData]);

  useEffect(() => {
    detachOnTaskClick();
    ganttEvents = {
      ...ganttEvents,
      onTaskClick: attachOnTaskClick(),
    };
  }, [currentTask]);

  useEffect(() => {
    if (projectPlan && projectPlan.data && projectPlan.data.length > 0) {
      if (projectPlan.data[0].status != 'To-Do') {
        setCanImport(false);
      } else {
        setCanImport(true);
      }

      if (
        JSON.stringify(filterState).includes('true') ||
        filterState.actualStart ||
        filterState.actualEnd ||
        filterState.plannedStart ||
        filterState.plannedEnd ||
        filterState.criticalTask ||
        filterState.text
      ) {
        filter(filterState);
      }
    }

    // gantt.batchUpdate(function () {
    //   gantt.eachTask(function (task) {
    //     if (gantt.hasChild(task.id)) {
    //       return (task.row_height = 60);
    //     }
    //   });
    // });
  }, [projectPlan]);

  useBeforeunload((event: any) => {
    if (authState.editMode) {
      event.preventDefault();
      window.addEventListener('unload', publishedOnClose);
    }
  });

  const publishedOnClose = () => {
    editProjectMetaData('published', decodeToken().userId);
  };
  useEffect(() => {
    if (projectMetaData.status == 'import') {
      setProjectPlanStatusFlag('import');
      setXmlImport(true);
      setTimeout(() => {
        getProjectScheduleMetaData();
        getProjectMetaData();
      }, 10000);
      if (
        !projectMetaData.is_Editable &&
        projectMetaData.status === 'draft' &&
        projectMetaData.message
      ) {
        setImportWarningPopup({
          type: '',
          open: true,
          message: projectMetaData.message,
          okay: false,
        });
      } else if (projectMetaData.status === 'import') {
        setImportWarningPopup({
          type: 'import',
          open: true,
          message:
            'We are importing your project plan and will send you an email once done.',
          okay: true,
        });
      }
    } else {
      if (importWarningPopup.open) {
        setImportWarningPopup({
          type: '',
          open: false,
          message: '',
          okay: false,
        });
      }

      if (xmlImport) {
        setXmlImport(false);
        getProjectMetaData();
      }
    }
  }, [projectMetaData]);

  useEffect(() => {
    detachOnDataRender();
    ganttEvents = {
      ...ganttEvents,
      onDataRender: attachOnDataRender(),
    };
    filter(filterState);
    updateFilterIconValue(filterState);
  }, [filterState]);

  useEffect(() => {
    for (let i = 0; i < calendarList.length; i++) {
      if (!calendarList[i].isDefault) {
        gantt.addCalendar({
          id: calendarList[i].calendarId,
          worktime: calendarList[i].calendar.externalCalendar,
        });
      }
    }
  }, [calendarList]);

  const updateGanttForAutoSchedule = () => {
    gantt.eachTask((task: any) => {
      task.progress = 0;
      switch (true) {
        case gantt.hasChild(task.id) && task.$level == 0:
          const projectTask = gantt.getTask(task.id);
          projectTask.type = 'project';
          gantt.updateTask(task.id, projectTask);
          break;
        case gantt.hasChild(task.id) && task.$level != 0:
          const wbsTask = gantt.getTask(task.id);
          wbsTask.type = 'project';
          gantt.updateTask(task.id, wbsTask);
          break;
        case task.type == 'milestone':
          break;
        default:
          const normalTask = gantt.getTask(task.id);
          normalTask.type = 'task';
          gantt.updateTask(task.id, normalTask);
          break;
      }
    });
  };

  const changeTypeForXmlImport = () => {
    gantt.eachTask((task: any) => {
      switch (true) {
        case gantt.hasChild(task.id) && task.$level === 0:
          const projectTask = gantt.getTask(task.id);
          projectTask.type = 'project';
          gantt.updateTask(task.id, projectTask);
          break;
        case gantt.hasChild(task.id) && task.$level !== 0:
          const wbsTask = gantt.getTask(task.id);
          wbsTask.type = 'wbs';
          gantt.updateTask(task.id, wbsTask);
          break;
        case task.type == 'milestone':
          break;
        default:
          const normalTask = gantt.getTask(task.id);
          normalTask.type = 'task';
          gantt.updateTask(task.id, normalTask);
          break;
      }
    });
  };

  const handleInvalidXmlClose = () => {
    setinvalidXml(false);
  };

  const handleInvalidXml = () => {
    setinvalidXml(false);
    setOpenImport(true);
  };
  const SaveOpenTaskView = async () => {
    let tempTask = gantt.getTaskByTime();

    tempTask = tempTask.filter((task: any) => task.$open);
    const open_task: any = {};
    tempTask.forEach((task: any) => {
      open_task[task.id] = task;
    });
    isLoading(true);
    show_cover();
    // await getProjectPlanAllTaskAndParse(open_task);  // commenting to display proper duration backend is sending wrong duration for imported project
    isLoading(false);
    gantt.hideCover();
  };

  const navigateToTask = () => {
    if (gantt.getTaskByTime().length) {
      setTimeout(() => {
        if (history.location.search.includes('task-id=')) {
          const targetTaskId = history.location.search?.split('task-id=')[1];
          if (!targetTaskId) return;
          if (
            !gantt.getTaskByTime().filter((tsk) => tsk.id === targetTaskId)
              .length
          )
            return;
          const targetTask = gantt.getTask(targetTaskId);
          gantt.selectTask(targetTaskId);
          gantt.showTask(targetTaskId);
          if (
            targetTask.type == 'task' ||
            targetTask.type == 'work_package' ||
            targetTask.type == 'wbs'
          ) {
            if (gantt.config.readonly) {
              setCurrentTask(targetTask);
              setEditTaskDetail(true);
            }
          }

          const queryParams = new URLSearchParams(location.search);

          if (queryParams.has('task-id')) {
            queryParams.delete('task-id');
            history.replace({
              search: queryParams.toString(),
            });
          }
        }
      }, 2000);
    }
  };

  const showSheduleTask = (taskId: any) => {
    if (gantt.getTask(taskId)) {
      dispatch(setIsLoading(true));
      let targetTask = gantt.getTask(taskId);
      while (targetTask.parent) {
        if (targetTask.parent) {
          const target = gantt.getTask(targetTask.parent);
          if (target) {
            target.$open = true;
            targetTask = target;
          }
        }
      }
      if (partialUpdateTasks) {
        setViewScheduleUpdate(true);
      }
      dispatch(setIsLoading(false));
      gantt.showTask(taskId);
      gantt.selectTask(taskId);
      gantt.render();
    } else {
      getProjectPlanByTaskId(taskId);
    }
  };

  const openTaskDetailsPopover = (taskId: string, event: any) => {
    // Below check differentiates click of activity panel and Gantt chart
    const isChartTimelineClick = gantt.utils.dom.closest(
      event.target,
      '.gantt_task_line'
    );
    if (isChartTimelineClick) {
      event.stopPropagation && event.stopPropagation();
      let xPos = event.clientX;
      let yPos = event.clientY;
      let direction = '';
      const modalWidth = 300;
      const modalHeight = 80;
      const screenWidth = window.innerWidth;
      if (xPos + modalWidth > screenWidth) {
        xPos = xPos + 20 - modalWidth + 'px';
        direction = 'right';
      } else {
        xPos = xPos - 20 + 'px';
        direction = 'left';
      }

      if (yPos - modalHeight - 60 < 0) {
        yPos = yPos + 10 + 'px';
        direction += '-bottom';
      } else {
        yPos = yPos - 10 - modalHeight + 'px';
        direction += '-top';
      }
      setPopoverObject({
        taskId: taskId,
        direction: direction,
        pointerX: event.clientX,
        pointerY: event.clientY,
        style: {
          display: 'block',
          top: yPos,
          left: xPos,
        },
      });
    }
  };

  const closeTaskDetailsPopover = () => {
    setPopoverObject({
      taskId: '',
      direction: 'top-left',
      pointerX: 0,
      pointerY: 0,
      style: {
        display: 'none',
        top: '0px',
        left: '0px',
      },
    });
  };

  const onPopoverMounted = (box: any) => {
    let xPos = popoverObject.pointerX;
    let yPos = popoverObject.pointerY;
    let direction = '';
    const modalWidth = box.width;
    const modalHeight = box.height;
    const screenWidth = window.innerWidth;
    if (xPos + modalWidth > screenWidth) {
      xPos = xPos + 20 - modalWidth;
      direction = 'right';
    } else {
      xPos = xPos - 20;
      direction = 'left';
    }

    if (yPos - modalHeight - 60 < 0) {
      yPos = yPos + 10;
      direction += '-bottom';
    } else {
      yPos = yPos - 10 - modalHeight;
      direction += '-top';
    }
    setPopoverObject({
      taskId: popoverObject.taskId,
      direction: direction,
      pointerX: popoverObject.pointerX,
      pointerY: popoverObject.pointerY,
      style: {
        display: 'block',
        top: yPos + 'px',
        left: xPos + 'px',
      },
    });
    if (direction.includes('top')) {
      const top = popoverObject.pointerY - box.height - 40;
      const popoverObjectClone = JSON.parse(JSON.stringify(popoverObject));
      popoverObjectClone.style.top = top + 'px';
      setPopoverObject(popoverObjectClone);
    }
  };

  const openMoreDetailTask = (id: string) => {
    if (gantt.getTask(id).parent.toString() === '0') {
      setProjectTaskPopup(true);
      setCurrentTask(gantt.getTask(id));
    }

    if (
      (gantt.getTask(id).type === gantt.config.types.work_package ||
        gantt.getTask(id).type === gantt.config.types.task ||
        gantt.getTask(id).type === gantt.config.types.wbs) &&
      gantt.config.readonly
    ) {
      setCurrentTask(gantt.getTask(id));
      setEditTaskDetail(true);
    }
    closeTaskDetailsPopover();
  };

  // *************************** Attach Gantt Event Start ******************************

  const ganttAttachEvent = () => {
    // attachOnBeforeTaskAdd();
    onBeforeEditStartInlineEditor();
    ganttEvents = {
      ...ganttEvents,
      onTaskCreated: attachOnTaskCreated(),
      onAfterTaskAdd: attachOnAfterTaskAdd(),
      onTaskDrag: attachOnTaskDrag(),
      onAfterTaskDrag: attachOnAfterTaskDrag(),
      onBeforeLightBox: attachOnBeforeLightBox(),
      onAfterLinkAdd: attachOnAfterLinkAdd(),
      onBeforeLinkAdd: attachOnBeforeLinkAdd(),
      onTaskDblClick: attachOnTaskDoubleClick(),
      onLinkDblClick: attachOnLinkDoubleClick(),
      onContextMenu: attachOnContextMenu(),
      onParse: attachOnParse(),
      onLinkCreated: attachOnLinkCreated(),
      onTaskClick: attachOnTaskClick(),
      onAfterTaskDelete: attachOnAfterTaskDelete(),
      onAfterAutoSchedule: attachOnAfterAutoSchedule(),
      onGanttReady: attachOnGanttReady(),
      onAfterTaskUpdate: attachOnAfterTaskUpdate(),
      // onBeforeDataRender: attachOnBeforeDataRender(),
      // onBeforeTaskChanged: attachOnBeforeTaskChanged(),
      onAfterLinkDelete: attachOnAfterLinkDelete(),
      attachOnAfterLinkUpdate: attachOnAfterLinkUpdate(),
      onDataRender: attachOnDataRender(),
      onTaskOpened: attachOnTaskOpened(),
      onCloseTask: attachOnTaskClosed(),
      onLoadEnd: attachOnLoadEnd(),
      // onGanttRender: attachOnGanttRender(),
      onBeforeTaskAutoSchedule: attachOnBeforeTaskAutoSchedule(),
      onAfterTaskAutoSchedule: attachOnAfterTaskAutoSchedule(),
      onGanttScroll: attachOnScroll(),
      onBeforeTaskDelete: attachOnBeforeTaskDelete(),
      onBeforeTaskDisplay: attachOnBeforeTaskDisplay(),
    };
  };

  const attachOnScroll = () => {
    return gantt.attachEvent(
      'onGanttScroll',
      () => {
        closeTaskDetailsPopover();
      },
      {}
    );
  };

  const attachOnBeforeLinkAdd = () => {
    return gantt.attachEvent(
      'onBeforeLinkAdd',
      (id: string | number, link: any) => {
        //Removed milestone restriction on linking

        if (
          gantt.getTask(link.source).parent.toString() === '0' ||
          gantt.getTask(link.target).parent.toString() === '0'
        ) {
          return false;
        }

        if (gantt.isCircularLink(link)) {
          setConfirmErrorMessage({
            open: true,
            header: 'Warning',
            text: 'The relationship you are trying to create is causing circular relationships. Please check the existing relationships',
            proceed: 'Ok',
          });

          return false;
        }
        const source = gantt.getTask(link.source);
        const target = gantt.getTask(link.target);

        const temp = source.$source.filter(
          (e: any) => target.$target.indexOf(e) !== -1
        );
        link.createdBy = decodeToken().userId;
        link.color = 'black';
        return !temp.length;
      },
      {}
    );
  };

  const attachOnAfterLinkAdd = () => {
    return gantt.attachEvent(
      'onAfterLinkAdd',
      (id: string | number, link: any) => {
        try {
          const newLinkId = uuidv4();
          gantt.changeLinkId(id, newLinkId);
          setNewLinks(link);
        } catch (e) {}
        return true;
      },
      {}
    );
  };

  const attachOnTaskCreated = () => {
    return gantt.attachEvent(
      'onTaskCreated',
      (task: any) => {
        if (cpCalculation) {
          setCpCalculation(false);
        }
        if (!task.type) {
          task.type = 'task';
        }
        task.text = '';
        task.status = 'To-Do';
        task.createdBy = decodeToken().userId;
        task.id = uuidv4();
        task.duration = 1;
        task.plannedDuration = 1;
        setGanttAction('create');
        return true;
      },
      {}
    );
  };

  const attachOnBeforeLightBox = () => {
    return gantt.attachEvent(
      'onBeforeLightbox',
      (id: any) => {
        const task = gantt.getTask(id);
        if (task.$new) {
          const parentTask = gantt.getTask(task.parent);
          const childTasks = gantt.getChildren(task.parent);
          if (!task.isFloated) {
            switch (parentTask.type) {
              case 'project_phase':
                task.type = 'wbs';
                break;

              case 'wbs':
                task.type = 'work_package';
                break;

              case 'work_package':
              case 'task':
                task.type = 'task';
                break;

              default:
                task.type = 'project_phase';
                break;
            }
          }
          //  task.type = 'project_phase';
          task.duration = null;
          task.end_date = null;

          if (childTasks.length > 1) {
            let d;

            if (sessionStorage.getItem('project-plan-action') === 'add-above') {
              d = gantt.getTask(childTasks[childTasks.length - 1]).end_date;
              sessionStorage.removeItem('project-plan-action');
            } else {
              d = gantt.getTask(childTasks[childTasks.length - 2]).end_date;
            }

            // const d1 = moment.utc(d).add(1, 'd').format('YYYY/MM/DD');
            task.start_date = new Date(d.valueOf() - 1);
            task.start_date.setHours(0);
            task.start_date.setMinutes(0);
            task.start_date.setSeconds(0);
          } else {
            task.start_date = parentTask.start_date;
          }

          setCurrentTask(task);

          return false;
        }
        return true;
      },
      {}
    );
  };

  const attachOnBeforeTaskAdd = () => {
    return gantt.attachEvent(
      'onBeforeTaskAdd',
      (id: string | number, task: any) => {
        return true;
      },
      {}
    );
  };

  const attachOnAfterTaskAdd = () => {
    return gantt.attachEvent(
      'onAfterTaskAdd',
      (id: string | number, task: any) => {
        task.floatValue = gantt.getTotalSlack(task?.id);
        task.show = true;

        const endDate = gantt.calculateEndDate({
          start_date: task.start_date,
          duration: task.duration,
          task,
        });
        task.plannedStartDate = transformDateToString(task.start_date);
        task.plannedDuration = task.duration;

        if (task.type == 'milestone') {
          task.plannedEndDate = transformDateToString(task.end_date);
        } else {
          task.plannedEndDate = transformDateToString(
            endDateDecreaseByOneDay(task.end_date)
          );
        }
        const parent = gantt.getTask(task.parent);
        parent.$has_child = true;

        if (!projectScheduleMetadata.importType) {
          const externalId = getMaxExternalIdCount(gantt);
          task.externalId = (externalId + 1).toString();
        }
        // let startTime = performance.now();
        addUpdatedTask(parent);
        // updateParentsTemp(gantt.getTask(task?.id));
        // updateTaskAfterDrag(gantt.getTask(id));
        updateParentTaskRollUp(gantt.getTask(id));

        // changed to updatePArentsTemp
        // updateParents(task?.id);
        // let endTime = performance.now();
        // console.log(
        //   `Call to doSomething took  1 ${endTime - startTime} milliseconds`
        // );
        const sValue: unknown = undefined;
        gantt.config.start_date = sValue as Date;
        gantt.config.end_date = sValue as Date;
        if (task?.type == 'milestone') {
          setIsMilestone(true);
        } else {
          setTypeSelected(task?.type);
          setIsMilestone(false);
          // changed to updatePArentsTemp
          // updateParentTaskStatusAndActualDates(
          //   gantt.getTask(id).parent,
          //   gantt.getTask(id)
          // );
        }
        setNewTasks(task);
        if (!gantt.config.readonly) dispatch(setEditMode(true));
        if (task.$local_index >= 0) {
          gantt.moveTask(task.id, task.$local_index, task.parent);
        }

        return true;
      },
      {}
    );
  };

  const attachOnTaskDrag = () => {
    return gantt.attachEvent(
      'onTaskDrag',
      function (id: string | number, mode: any, task: any, original: any) {
        //any custom logic here

        // if (task.duration == 0 && task.type != 'milestone') {
        //   return false;
        // }

        if (task.duration == 0 && task.type != 'milestone') {
          task.duration = 1;
          if (original.start_date == task.start_date) {
            task.end_date.setDate(task.start_date.getDate() + 1);
          } else {
            task.start_date.setDate(task.start_date.getDate() - 1);
          }
        }

        if (cpCalculation) {
          setCpCalculation(false);
        }
        // updateParents(id);
        // updateParentTaskRollUp(gantt.getTask(id));
        return true;
      },
      {}
    );
  };

  const attachOnAfterTaskDrag = () => {
    return gantt.attachEvent(
      'onAfterTaskDrag',
      (id: string | number, mode: any, e: any, original: any) => {
        const task = gantt.getTask(id);
        //any custom logic here
        if (task.type == 'milestone') {
          task.plannedStartDate = transformDateToString(task.start_date);
          task.plannedEndDate = transformDateToString(task.end_date);
        } else if (task.status == 'To-Do') {
          task.plannedStartDate = transformDateToString(task.start_date);
          task.plannedEndDate = transformDateToString(
            endDateDecreaseByOneDay(task.end_date)
          );
          task.plannedDuration = task.duration;
        } else if (task.status == 'In-Progress') {
          task.actualStartDate = transformDateToString(task.start_date);
          task.estimatedEndDate = transformDateToString(
            endDateDecreaseByOneDay(task.end_date)
          );
          task.estimatedDuration = task.duration;
        } else {
          task.actualStartDate = transformDateToString(task.start_date);
          task.actualEndDate = transformDateToString(
            endDateDecreaseByOneDay(task.end_date)
          );
          task.actualDuration = task.duration;
        }
        // updateTaskAfterDrag(gantt.getTask(id));
        updateParentTaskRollUp(gantt.getTask(id));
        gantt.render();

        if (!gantt.config.readonly) dispatch(setEditMode(true));
        return true;
      },
      {}
    );
  };

  const attachOnAfterTaskUpdate = () => {
    return gantt.attachEvent(
      'onAfterTaskUpdate',
      (id: string | number, mode: any, task: any, original: any) => {
        if (!gantt.config.readonly) dispatch(setEditMode(true));
        addUpdatedTask(gantt.getTask(id));
        addUpdatedTask(gantt.getTaskByIndex(0));

        //any custom logic here
        // updateTaskAfterDrag(gantt.getTask(id));
        // updateParentTaskRollUp(gantt.getTask(id));

        let tempId = id;

        while (tempId) {
          const taskTemp = gantt.getTask(tempId);
          addUpdatedTask(taskTemp);
          tempId = taskTemp.parent;
        }
        return true;
      },
      {}
    );
  };

  const attachOnTaskDoubleClick = () => {
    return gantt.attachEvent(
      'onTaskDblClick',
      (id: string | number, event: any) => {
        closeTaskDetailsPopover();
        if (currentGanttView == 'baseline') {
          return;
        }
        if (gantt.getTask(id).parent.toString() === '0') {
          setProjectTaskPopup(true);
          setCurrentTask(gantt.getTask(id));
        }

        if (
          (event.target.classList.value == 'gantt_task_content' ||
            event.target.parentNode.classList.value == 'gantt_task_content') &&
          (gantt.getTask(id).type === gantt.config.types.work_package ||
            gantt.getTask(id).type === gantt.config.types.task ||
            gantt.getTask(id).type === gantt.config.types.wbs) &&
          gantt.config.readonly
        ) {
          setCurrentTask(gantt.getTask(id));
          setEditTaskDetail(true);
        }
        if (cpCalculation) {
          setCpCalculation(false);
        }
        return false;
      },
      {}
    );
  };

  const attachOnLinkDoubleClick = () => {
    return gantt.attachEvent(
      'onLinkDblClick',
      (id: string | number, event: any) => {
        if (cpCalculation) {
          setCpCalculation(false);
        }
        return false;
      },
      {}
    );
  };

  const attachOnContextMenu = () => {
    return gantt.attachEvent(
      'onContextMenu',
      (taskId: string, linkId: string, event: any) => {
        if (taskId && lookAheadStatus) {
          if (
            authState?.projectFeaturePermissons?.cancreateMasterPlan &&
            (gantt.getTask(taskId)?.type == 'task' ||
              gantt.getTask(taskId)?.type == 'work_package')
            // && gantt.getTask(taskId)?.status == 'To-Do'
          ) {
            setContextMenu({
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
              menu: 'constraint',
            });
            setTaskId(taskId);
            setLinkId('');
            return false;
          } else if (
            gantt.getTask(taskId)?.assignedTo == decodeToken().userId &&
            (gantt.getTask(taskId)?.type == 'task' ||
              gantt.getTask(taskId)?.type == 'work_package')
            // gantt.getTask(taskId)?.status == 'To-Do'
          ) {
            setContextMenu({
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
              menu: 'constraint',
            });
            setTaskId(taskId);
            setLinkId('');
            return false;
          }
        }
        if (gantt.config.readonly) {
          if (
            taskId &&
            !gantt.utils.dom.closest(event.target, '.gantt_task_line') &&
            !(
              gantt.getTask(taskId).parent.toString() === '0' ||
              gantt.getSelectedTasks().includes(gantt.getTaskByTime()[0].id)
            )
          ) {
            setContextMenu({
              mouseX: event.clientX - 2,
              mouseY: event.clientY - 4,
              menu: 'published_task',
            });
          } else {
            return true;
          }
          return false;
        }
        if (cpCalculation) {
          setCpCalculation(false);
        }
        if (linkId) {
          setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            menu: 'link',
          });

          // const hasLag = gantt
          //   .getLinks()
          //   .filter((item) => item.id == gantt.getLink(linkId).id);

          // let lag = 0;

          // const targetStartDate = gantt.getTask(
          //   gantt.getLink(linkId).target
          // ).start_date;
          // const targetEndDate = gantt.getTask(
          //   gantt.getLink(linkId).target
          // ).end_date;
          // const sourceStartDate = gantt.getTask(
          //   gantt.getLink(linkId).source
          // ).start_date;
          // const sourceEndDate = gantt.getTask(
          //   gantt.getLink(linkId).source
          // ).end_date;

          // switch (gantt.getLink(linkId).type) {
          //   case '0':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceEndDate),
          //       end_date: new Date(targetStartDate),
          //       /*,task: task*/
          //     });
          //     // (targetStartDate.getTime() - sourceEndDate.getTime()) /
          //     //  (1000 * 3600 * 24);
          //     break;
          //   case '1':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceStartDate),
          //       end_date: new Date(targetStartDate),
          //       /*,task: task*/
          //     });
          //     // (targetStartDate.getTime() - sourceStartDate.getTime()) /
          //     // (1000 * 3600 * 24);
          //     break;
          //   case '2':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceEndDate),
          //       end_date: new Date(targetEndDate),
          //       /*,task: task*/
          //     });
          //     // (targetEndDate.getTime() - sourceEndDate.getTime()) /
          //     // (1000 * 3600 * 24);
          //     break;
          //   case '3':
          //     lag = gantt.calculateDuration({
          //       start_date: new Date(sourceStartDate),
          //       end_date: new Date(targetEndDate),
          //       /*,task: task*/
          //     });
          //     // (targetEndDate.getTime() - sourceStartDate.getTime()) /
          //     // (1000 * 3600 * 24);
          //     break;
          // }

          // setLagData(lag);
          setLinkData({
            linkId: linkId,
            predecessor: gantt.getTask(gantt.getLink(linkId).source).text,
            successor: gantt.getTask(gantt.getLink(linkId).target).text,
            type: gantt.getLink(linkId).type,
            lag: gantt.getLink(linkId).lag,
          });
          setLinkId(linkId);
          setTaskId('');
          return false;
        }

        if (taskId) {
          if (
            gantt.getTask(taskId).parent.toString() === '0' ||
            gantt.getSelectedTasks().includes(gantt.getTaskByTime()[0].id)
          ) {
            return true;
          }
          setContextMenu({
            mouseX: event.clientX - 2,
            mouseY: event.clientY - 4,
            menu: 'task',
          });
          setTaskId(taskId);
          return false;
        }
        return true;
      },
      {}
    );
  };

  const attachOnLinkCreated = () => {
    return gantt.attachEvent(
      'onLinkCreated',
      (link) => {
        if (cpCalculation) {
          setCpCalculation(false);
        }
        if (!gantt.config.readonly) dispatch(setEditMode(true));
        return true;
      },
      {}
    );
  };

  const attachOnTaskClick = () => {
    return gantt.attachEvent(
      'onTaskClick',
      (id, e) => {
        const typInfo = id != null ? gantt.getTask(id) : null;
        if (typInfo?.type !== 'milestone') {
          openTaskDetailsPopover(id, e);
        }
        // id && gantt.selectTask(id); // Commented for doubleClick edit option
        // if (Object.keys(currentTask).length && currentTask.id === id) {
        //   setEditTaskDetail(true);
        // } else {
        //   setCurrentTask(gantt.getTask(id));
        //   setEditTaskDetail(false);
        // }
        if (typInfo?.type == 'milestone') {
          setIsMilestone(true);
        } else {
          setTypeSelected(typInfo?.type);
          setIsMilestone(false);
        }
        if (cpCalculation) {
          setCpCalculation(false);
        }
        const button = e.target.closest('[data-action]');
        if (button) {
          const action = button.getAttribute('data-action');
          switch (action) {
            case 'add':
              gantt.createTask(null, id);
              break;
          }
          return false;
        }
        return true;
      },
      {}
    );
  };

  const attachOnAfterTaskDelete = () => {
    return gantt.attachEvent(
      'onAfterTaskDelete',
      (id: string | number, item: any) => {
        try {
          addDeletedLink([...item.$source, ...item.$target]);

          if (gantt.getChildren(item.parent).length > 0) {
            updateParents(gantt.getChildren(item.parent)[0], addUpdatedTask);

            updateParentTaskDates(item, 'planned Start', addUpdatedTask);
            updateParentTaskDates(item, 'planned End', addUpdatedTask);
            // updateParentTaskDates(item, 'actual', addUpdatedTask);
          } else {
            const t = gantt.getTask(item.parent);
            t.$has_child = false;

            if (t.parent == 0) {
              t.duration = 1;
              t.plannedDuration = 1;
              t.end_date = gantt.calculateEndDate({
                start_date: new Date(t.start_date),
                duration: 1,
                t,
              });
              t.plannedEndDate = transformDateToString(
                endDateDecreaseByOneDay(t.end_date)
              );
            }
          }
          // updateParentTaskStatusAndActualDates(item.parent, item);
          updateParentTaskRollUp(item);

          if (gantt.getTaskByTime().length == 1) {
            const task = gantt.getTaskByIndex(0);
            task.end_date = gantt.calculateEndDate({
              start_date: new Date(task.plannedStartDate),
              duration: 1,
              task,
            });

            task.plannedEndDate = transformDateToString(
              endDateDecreaseByOneDay(task.end_date)
            );
            task.start_date = new Date(task.plannedStartDate);
            task.start_date.setHours(0);
            task.start_date.setMinutes(0);
            task.start_date.setSeconds(0);
            task.actualEndDate = null;
            task.actualStartDate = null;
            task.estimatedEndDate = null;
            task.estimatedDuration = null;
            task.status = 'To-Do';
          }
          if (gantt.getTaskByIndex(0)) {
            if (!gantt.getChildren(gantt.getTaskByIndex(0).id).length) {
              gantt.config.start_date = gantt.date.week_start(
                gantt.getTaskByIndex(0).start_date
              );
              gantt.config.end_date = gantt.date.add(
                gantt.getTaskByIndex(0).end_date,
                7,
                'day'
              );
            }
          }
          deleteUpdatedTask(id);
          if (!gantt.config.readonly) dispatch(setEditMode(true));
          setHasChildifProejectTask();
        } catch (e) {}

        return true;
      },
      {}
    );
  };

  const attachOnBeforeGanttRender = () => {
    gantt.attachEvent(
      'onBeforeGanttRender',
      () => {
        if (gantt.getTaskByTime().length === 1) {
          const tempProjectTask = gantt.getTaskByIndex(0);
          gantt.config.start_date = moment(new Date(tempProjectTask.start_date))
            .subtract(1, 'days')
            .startOf('day')
            .toDate();
          gantt.config.end_date = moment(new Date(tempProjectTask.end_date))
            .add(1, 'days')
            .startOf('day')
            .toDate();
        } else {
          // gantt.config.start_date = null;
          // gantt.config.end_date = null;
          gantt.config.fit_tasks = true;
        }
      },
      {}
    );
  };

  const attachOnAfterAutoSchedule = () => {
    return gantt.attachEvent(
      'onAfterAutoSchedule',
      () => {
        setAutoScheduleFlag(true);
        // setAutoScheduleWaitPopup(false);

        if (xmlImport && xmlData !== null) {
          const xml = sessionStorage.getItem('xmlImport');
          gantt.eachTask((task: any) => {
            if (xml && xml == 'true') {
              switch (true) {
                case gantt.hasChild(task.id) && task.$level === 0:
                  task.type = 'project';
                  task.typeName = 'Project';
                  break;
                case gantt.hasChild(task.id) && task.$level !== 0:
                  task.type = 'wbs';
                  task.typeName = 'Wbs';
                  if (task.duration === 0) {
                    task.duration = 1;
                    task.end_date = gantt.calculateEndDate({
                      start_date: task.start_date,
                      duration: task.duration,
                      task,
                    });
                  }
                  break;
                case task.duration == 0:
                  task.type = 'milestone';
                  task.typeName = 'Milestone';
                  break;
                default:
                  task.type = 'task';
                  task.typeName = 'Task';
              }
            }
          });
        }
      },
      {}
    );
  };

  const attachOnParse = () => {
    return gantt.attachEvent(
      'onParse',
      () => {
        adjustStartAndEndDate();
        if (xmlImport && xmlData !== null) {
          const xml = sessionStorage.getItem('xmlImport');
          gantt.eachTask((task: any) => {
            if (xml && xml == 'true') {
              gantt.config.static_background = false;
              task.progress = 0;
              task.status = 'To-Do';
              switch (true) {
                case gantt.hasChild(task.id) && task.$level === 0:
                  task.type = 'project';
                  task.typeName = 'Project';
                  break;
                case gantt.hasChild(task.id) && task.$level !== 0:
                  task.type = 'project';
                  task.typeName = 'Project';
                  break;
                case task.duration == 0:
                  task.type = 'milestone';
                  task.typeName = 'Milestone';
                  break;
                default:
                  task.type = 'task';
                  task.typeName = 'Task';
              }
            }
          });
        }
        navigateToTask();
        const dateToStr = gantt.date.date_to_str(gantt.config.task_date);

        const markerType = 'gantt__today__marker__default';
        // if (!scale.includes('week')) {
        //   markerType = 'gantt__today__marker__month__year';
        // }
        const today = moment(new Date(new Date())).startOf('day').toDate();
        const markerId = gantt.addMarker({
          start_date: today,
          end_date: gantt.date.add(today, 1, 'day'),
          css: markerType,
          title: dateToStr(new Date()),
        });

        setTodayMarkerId(markerId);
      },
      {}
    );
  };

  useEffect(() => {
    try {
      const dateToStr = gantt.date.date_to_str(gantt.config.task_date);
      if (todayMarkerId) {
        const marker = gantt.getMarker(todayMarkerId);

        let markerType = 'gantt__today__marker__default';

        if (currentView.includes('gantt')) {
          if (scale.includes('week')) {
            markerType = 'gantt__today__marker__default';
          } else {
            markerType = 'gantt__today__marker__month__year';
          }
        }

        if (currentView.includes('lookahead')) {
          if (scale.includes('default')) {
            markerType = 'gantt__today__marker__default';
          }
          if (scale.includes('week')) {
            markerType = 'gantt__today__marker__lookahed__week';
          }
        }

        if (currentView.includes('weekly')) {
          if (!scale.includes('week')) {
            markerType = 'gantt__today__marker__month__year';
          }
        }

        marker.css = markerType;
        gantt.updateMarker(todayMarkerId);
      }
    } catch (err: any) {}
  }, [scale, currentView, todayMarkerId]);

  const attachOnGanttReady = () => {
    return gantt.attachEvent(
      'onGanttReady',
      () => {
        // gantt.ext.tooltips.tooltipFor({
        //   selector: '.gantt_row',
        //   html: function (event: any, domElement: any) {
        //     return '';
        //   },
        // });
      },
      {}
    );
  };

  const attachOnBeforeTaskChanged = () => {
    return gantt.attachEvent(
      'onBeforeTaskChanged',
      (id: any, mode: any, task: any) => {
        if (task.duration === 0) {
          return false;
        }

        return true;
      },
      {}
    );
  };
  // const attachOnBeforeDataRender = () => {
  //   const addedMarkers = [];
  //   gantt.config.timeline_highlight = true;
  //   gantt.templates.timeline_column_class = function (date: any) {
  //     if (!gantt.isWorkTime(date)) {
  //       return 'weekend';
  //     }
  //     return '';
  //   };
  //   return gantt.attachEvent(
  //     'onBeforeDataRender',
  //     () => {
  //       const state = gantt.getState();

  //       const unit = 'day',
  //         step = 1;

  //       let from = gantt.date.day_start(new Date(state.min_date)),
  //         next;
  //       const to = new Date(state.max_date);

  //       let marker: any;
  //       while (+from < +to) {
  //         const css = gantt.templates.timeline_column_class(from);
  //         console.log('css: ', css);
  //         next = gantt.date.add(from, step, unit);

  //         if (css) {
  //           if (marker) {
  //             if (+marker.end_date == +from && marker.css == css) {
  //               marker.end_date = next;
  //             } else {
  //               addMarker();
  //               createMarker(from, next, css);
  //             }
  //           } else {
  //             createMarker(from, next, css);
  //           }
  //         } else {
  //           if (marker) {
  //             addMarker();
  //           }
  //         }
  //         from = next;
  //       }
  //       addMarker();

  //       function addMarker() {
  //         if (marker) {
  //           addedMarkers.push(gantt.addMarker(marker));
  //         }
  //         marker = null;
  //       }
  //       function createMarker(from: any, to: any, css: any) {
  //         marker = {
  //           start_date: new Date(from),
  //           end_date: new Date(to),
  //           css: css,
  //         };
  //       }
  //     },
  //     {}
  //   );
  // };

  const attachOnAfterLinkDelete = () => {
    return gantt.attachEvent(
      'onAfterLinkDelete',
      (id, item) => {
        addDeletedLink([id]);
        if (!gantt.config.readonly) dispatch(setEditMode(true));
      },
      {}
    );
  };

  const attachOnTaskOpened = () => {
    return gantt.attachEvent(
      'onTaskOpened',
      (id, item) => {
        try {
          // gantt.selectTask(id);
          if (gantt.getChildren(id).length == 0) {
            getChildTask(id);
          }
        } catch (error: any) {
          console.log('error: ', error);
        }
      },
      {}
    );
  };
  const attachOnDataRender = () => {
    return gantt.attachEvent(
      'onDataRender',
      () => {
        updateFilterIconValue(filterState);

        // attach onchange with planned start date
        const plannedStart = document.getElementById(
          'planned-start-filtered'
        ) as HTMLInputElement;

        if (plannedStart) {
          plannedStart.value = filterState.plannedStart;
          plannedStart.onchange = (e: any) => {
            setFilterState({ ...filterState, plannedStart: e.target.value });
          };
        }
        // attach onchange with planned end date
        const plannedEnd = document.getElementById(
          'planned-end-filtered'
        ) as HTMLInputElement;

        if (plannedEnd) {
          plannedEnd.value = filterState.plannedEnd;

          plannedEnd.onchange = (e: any) => {
            setFilterState({ ...filterState, plannedEnd: e.target.value });
          };
        }

        // attach onchange with actual start date
        const actualStart = document.getElementById(
          'actual-start-filtered'
        ) as HTMLInputElement;

        if (actualStart) {
          actualStart.value = filterState.actualStart;

          actualStart.onchange = (e: any) => {
            setFilterState({ ...filterState, actualStart: e.target.value });
          };
        }

        // attach onchange with actual end date
        const actualEnd = document.getElementById(
          'actual-end-filtered'
        ) as HTMLInputElement;

        if (actualEnd) {
          actualEnd.value = filterState.actualEnd;

          actualEnd.onchange = (e: any) => {
            setFilterState({ ...filterState, actualEnd: e.target.value });
          };
        }

        // get type filter button and add on change method
        const typeFilterElement = document.getElementById('gantt-type-filter');

        if (typeFilterElement) {
          typeFilterElement.onclick = (e: any) => {
            setContextMenu({
              mouseX: e.clientX - 53,
              mouseY: 178,
              menu: 'filterType',
            });
          };
        }

        // get total filter button and add on change method
        const totalFloatFilterElement = document.getElementById(
          'gantt-total-float-filter'
        );

        if (totalFloatFilterElement) {
          totalFloatFilterElement.onclick = (e: any) => {
            setContextMenu({
              mouseX: e.clientX - 95,
              mouseY: 178,
              menu: 'filterTotalFloat',
            });
          };
        }

        const ganttAssigneeFilterElement = document.getElementById(
          'gantt-assignee-filter'
        );

        if (ganttAssigneeFilterElement) {
          ganttAssigneeFilterElement.onclick = (e: any) => {
            setContextMenu({
              mouseX: e.clientX - 95,
              mouseY: 178,
              menu: 'filterAssignee',
            });
          };
        }

        const ganttResponsibleCompanyFilterElement = document.getElementById(
          'gantt-responsible-company-filter'
        );

        if (ganttResponsibleCompanyFilterElement) {
          ganttResponsibleCompanyFilterElement.onclick = (e: any) => {
            setContextMenu({
              mouseX: e.clientX - 95,
              mouseY: 178,
              menu: 'filterResponsibleCompany',
            });
          };
        }
        const ganttActivityNameFilterElement = document.getElementById(
          'gantt-activity-name-filter'
        );

        if (ganttActivityNameFilterElement) {
          ganttActivityNameFilterElement.onclick = (e: any) => {
            if (gantt.config.readonly) {
              setContextMenu({
                mouseX: e.clientX - 95,
                mouseY: 184,
                menu: 'filterActivityName',
              });
            } else {
              setContextMenu({
                mouseX: e.clientX - 95,
                mouseY: 162,
                menu: 'filterActivityName',
              });
            }
          };
        }

        const projectTask = gantt.getTaskByIndex(0);
        if (projectTask && !projectTask.$has_child) {
          setHasChildProperty(addUpdatedTask);
        }

        // if (
        //   acceptChangesFlag &&
        //   projectPlan &&
        //   projectPlan.data.lenth === gantt.getTaskByTime().length
        // ) {
        //   console.log('changes accept data render -------------------->');
        //   acceptChanges();
        // }
        const start_date_element = document.getElementsByClassName(
          'gantt_grid_head_start_date'
        );
        if (start_date_element && start_date_element.length > 0) {
          if (start_date_element[0].children.length === 0) {
            const div_element = document.createElement('div');
            div_element.classList.add('gantt_sort');
            div_element.classList.add('gantt_sort_icon');
            start_date_element[0].appendChild(div_element);
          }
        }

        const end_date_element = document.getElementsByClassName(
          'gantt_grid_head_end_date'
        );
        if (end_date_element && end_date_element.length > 0) {
          if (end_date_element[0].children.length === 0) {
            const div_element = document.createElement('div');
            div_element.classList.add('gantt_sort');
            div_element.classList.add('gantt_sort_icon');
            end_date_element[0].appendChild(div_element);
          }
        }

        // const first_task = gantt.getTaskByIndex(0);
        // if (first_task) {
        //   gantt.hideCover();
        //   // gantt.message('The data has been parsed');
        //   dispatch(setIsLoading(false));
        //   console.log('end');
        // }
      },
      {}
    );
  };
  const attachOnTaskClosed = () => {
    return gantt.attachEvent(
      'onTaskClosed',
      (id, item) => {
        //console.log('closeTask');
      },
      {}
    );
  };

  const attachOnLoadEnd = () => {
    return gantt.attachEvent(
      'onLoadEnd',
      (url: any, type: any) => {
        console.log('onLoadEnd', url, type);
      },
      {}
    );
  };

  const attachOnAfterLinkUpdate = () => {
    return gantt.attachEvent(
      'onAfterLinkUpdate',
      (id, item) => {
        // setUpdatedLinks(item);
        if (!gantt.config.readonly) dispatch(setEditMode(true));
      },
      {}
    );
  };

  const attachOnGanttRender = () => {
    return gantt.attachEvent(
      'onGanttRender',
      (url: any, type: any) => {
        // if (
        //   acceptChangesFlag &&
        //   projectPlan &&
        //   projectPlan.data.lenth === gantt.getTaskByTime().length
        // ) {
        //   console.log('changes accept data render -------------------->');
        //   acceptChangesFlag = false;
        //   acceptChanges();
        // }
      },
      {}
    );
  };

  const attachOnBeforeTaskAutoSchedule = () => {
    return gantt.attachEvent(
      'onBeforeTaskAutoSchedule',
      (task: any, start: any, link: any, predecessor: any) => {
        if (task.status == 'Complete' || task.status == 'In-Progress') {
          return false;
        }

        return true;
      },
      {}
    );
  };

  const attachOnBeforeTaskDisplay = () => {
    return gantt.attachEvent(
      'onBeforeTaskDisplay',
      (id: any, task: any) => {
        if (task.parent == 0) {
          // if milestone is having highest planned end date than assign to project task planmed end date
          if (gantt.getTaskByIndex(0)) {
            const t = gantt.getTaskBy(
              'plannedEndDate',
              transformDate(gantt.getTaskByIndex(0).end_date)
            );
            if (t.length == 1 && t[0].type === 'milestone') {
              task.plannedEndDate = t[0].plannedEndDate;
            }
          }
          return true;
        }
        if (task.calendar_id) {
          if (task.status == 'In-Progress') {
            task.estimatedDuration = task.duration;
          } else if (task.status == 'Completed') {
            task.actualDuration = task.duration;
          } else {
            task.plannedDuration = task.duration;
          }
        }

        return task.show;
      },
      {}
    );
  };

  const onBeforeEditStartInlineEditor = () => {
    gantt.ext.inlineEditors.attachEvent('onBeforeEditStart', (state: any) => {
      const task = gantt.getTask(state.id);
      const columnName = state.columnName;
      const columns = [
        'plannedStartDate',
        'plannedDuration',
        'plannedEndDate',
        'actualStartDate',
        'actualEndDate',
        'actualDuration',
        'estimatedEndDate',
        'estimatedDuration',
      ];
      if (gantt.hasChild(task.id) && columns.includes(columnName)) {
        return false;
      }
      if (task.type == 'project') {
        return false;
      }

      if (!task[state.columnName]) {
        return false;
      }

      return true;
    });
  };

  const attachOnAfterTaskAutoSchedule = () => {
    return gantt.attachEvent(
      'onAfterTaskAutoSchedule',
      (task: any, start: any, link: any, predecessor: any) => {
        if (task.status == 'To-Do') {
          task.plannedStartDate = transformDateToString(task.start_date);
          if (task.type == 'milestone') {
            task.plannedEndDate = transformDateToString(task.end_date);
            // updateTaskAfterDrag(task);
            // updateParentTaskRollUp(task);
          } else {
            task.plannedEndDate = transformDateToString(
              endDateDecreaseByOneDay(task.end_date)
            );
          }
        }
        updateParentTaskRollUp(task);

        return false;
      },
      {}
    );
  };

  const attachOnBeforeTaskDelete = () =>
    gantt.attachEvent(
      'onBeforeTaskDelete',
      (id: string) => {
        const tempDeletedTaskIds = [...getAllChildrens(id), id];
        deleteTasks(tempDeletedTaskIds);
        const tempLinkId: any = [];
        tempDeletedTaskIds.forEach((tempId: string) => {
          tempLinkId.push(
            ...gantt.getTask(tempId).$source,
            ...gantt.getTask(tempId).$target
          );
        });
        addDeletedLink(Array.from(new Set(tempLinkId)));
      },
      {}
    );

  // *************************** Attach Gantt Event End *******************************

  // ************************** Detach Gantt Event Start *****************************
  const ganttDetachEvent = () => {
    detachOnAfterTaskAdd();
    detachOnTaskDrag();
    detachOnAfterTaskDrag();
    detachOnBeforeLightBox();
    detachOnBeforeLinkAdd();
    detachOnAfterLinkAdd();
    detachOnTaskCreated();
    detachOnTaskDblClick();
    detachOnLinkDblClick();
    detachOnContextMenu();
    detachOnParse();
    detachOnLinkCreated();
    detachOnTaskClick();
    detachOnAfterTaskDelete();
    detachOnAfterAutoSchedule();
    detachOnGanttReady();
    detachOnAfterTaskUpdate();
    detachOnAfterLinkDelete();
    detachOnAfterLinkUpdate();
    // detachOnBeforeTaskChanged();
    detachOnTaskOpened();
    detachOnTaskClosed();
    detachOnLoadEnd();
    detachOnDataRender();
    // detachOnGanttRender();
    detachOnBeforeTaskAutoSchedule();
    detachOnAfterTaskAutoSchedule();
    detachOnScroll();
    detachOnBeforeTaskDelete();
    detachOnBeforeTaskDisplay();
  };

  const detachOnScroll = () => {
    if (ganttEvents.onGanttScroll) {
      gantt.detachEvent(ganttEvents.onGanttScroll);
    }
  };

  const detachOnLinkDblClick = () => {
    if (ganttEvents.onLinkDblClick) {
      gantt.detachEvent(ganttEvents.onLinkDblClick);
    }
  };

  const detachOnTaskDblClick = () => {
    if (ganttEvents.onTaskDblClick) {
      gantt.detachEvent(ganttEvents.onTaskDblClick);
    }
  };

  const detachOnTaskCreated = () => {
    if (ganttEvents.onTaskCreated) {
      gantt.detachEvent(ganttEvents.onTaskCreated);
    }
  };

  const detachOnAfterTaskAdd = () => {
    if (ganttEvents.onAfterTaskAdd) {
      gantt.detachEvent(ganttEvents.onAfterTaskAdd);
    }
  };

  const detachOnTaskDrag = () => {
    if (ganttEvents.onTaskDrag) {
      gantt.detachEvent(ganttEvents.onAfterTaskAdd);
    }
  };

  const detachOnAfterTaskDrag = () => {
    if (ganttEvents.onAfterTaskDrag) {
      gantt.detachEvent(ganttEvents.onAfterTaskDrag);
    }
  };

  const detachOnBeforeLightBox = () => {
    if (ganttEvents.onBeforeLightBox) {
      gantt.detachEvent(ganttEvents.onBeforeLightBox);
    }
  };

  const detachOnBeforeLinkAdd = () => {
    if (ganttEvents.onBeforeLinkAdd) {
      gantt.detachEvent(ganttEvents.onBeforeLinkAdd);
    }
  };

  const detachOnAfterLinkAdd = () => {
    if (ganttEvents.onAfterLinkAdd) {
      gantt.detachEvent(ganttEvents.onAfterLinkAdd);
    }
  };

  const detachOnContextMenu = () => {
    if (ganttEvents.onContextMenu) {
      gantt.detachEvent(ganttEvents.onContextMenu);
    }
  };

  const detachOnParse = () => {
    if (ganttEvents.onParse) {
      gantt.detachEvent(ganttEvents.onParse);
    }
  };
  const detachOnLinkCreated = () => {
    if (ganttEvents.onLinkCreated) {
      gantt.detachEvent(ganttEvents.onLinkCreated);
    }
  };

  const detachOnTaskClick = () => {
    if (ganttEvents.onTaskClick) {
      gantt.detachEvent(ganttEvents.onTaskClick);
    }
  };

  const detachOnAfterTaskDelete = () => {
    if (ganttEvents.onAfterTaskDelete) {
      gantt.detachEvent(ganttEvents.onAfterTaskDelete);
    }
  };

  const detachOnAfterAutoSchedule = () => {
    if (ganttEvents.onAfterAutoSchedule) {
      gantt.detachEvent(ganttEvents.onAfterAutoSchedule);
    }
  };

  const detachOnGanttReady = () => {
    if (ganttEvents.onGanttReady) {
      gantt.detachEvent(ganttEvents.onGanttReady);
    }
  };

  const detachOnAfterTaskUpdate = () => {
    if (ganttEvents.onAttachOnAfterTaskUpdate) {
      gantt.detachEvent(ganttEvents.onAttachOnAfterTaskUpdate);
    }
  };

  const detachOnBeforeTaskChanged = () => {
    if (ganttEvents.onBeforeTaskChanged) {
      gantt.detachEvent(ganttEvents.onBeforeTaskChanged);
    }
  };

  const detachOnAfterLinkDelete = () => {
    if (ganttEvents.onAfterLinkDelete) {
      gantt.detachEvent(ganttEvents.onAfterLinkDelete);
    }
  };
  const detachOnAfterLinkUpdate = () => {
    if (ganttEvents.onAfterLinkUpdate) {
      gantt.detachEvent(ganttEvents.onAfterLinkUpdate);
    }
  };

  const detachOnTaskOpened = () => {
    if (ganttEvents.onTaskOpened) {
      gantt.detachEvent(ganttEvents.onTaskOpened);
    }
  };
  const detachOnTaskClosed = () => {
    if (ganttEvents.onTaskClosed) {
      gantt.detachEvent(ganttEvents.onTaskClosed);
    }
  };
  const detachOnLoadEnd = () => {
    if (ganttEvents.onLoadEnd) {
      gantt.detachEvent(ganttEvents.onLoadEnd);
    }
  };

  const detachOnDataRender = () => {
    if (ganttEvents.onDataRender) {
      gantt.detachEvent(ganttEvents.onDataRender);
    }
  };

  const detachOnGanttRender = () => {
    if (ganttEvents.onGanttRender) {
      gantt.detachEvent(ganttEvents.onGanttRender);
    }
  };

  const detachOnBeforeTaskAutoSchedule = () => {
    if (ganttEvents.onBeforeTaskAutoSchedule) {
      gantt.detachEvent(ganttEvents.onBeforeTaskAutoSchedule);
    }
  };

  const detachOnAfterTaskAutoSchedule = () => {
    if (ganttEvents.onAfterTaskAutoSchedule) {
      gantt.detachEvent(ganttEvents.onAfterTaskAutoSchedule);
    }
  };
  const detachOnBeforeTaskDelete = () => {
    if (ganttEvents.onBeforeTaskDelete) {
      gantt.detachEvent(ganttEvents.onBeforeTaskDelete);
    }
  };

  const detachOnBeforeTaskDisplay = () => {
    if (ganttEvents.onBeforeTaskDisplay) {
      gantt.detachEvent(ganttEvents.onBeforeTaskDisplay);
    }
  };

  // ************************** Detach Gantt Event End *****************************

  const onChangeHandler = (event: any) => {
    let end_date = currentTask.end_date;

    if (
      (currentTask.type === 'work_package' || currentTask.type === 'task') &&
      event.target.name === 'duration' &&
      currentTask.start_date &&
      event.target.value !== ''
    ) {
      end_date = gantt.calculateEndDate({
        start_date: new Date(
          `${currentTask.start_date.getFullYear()}, ${
            currentTask.start_date.getMonth() + 1
          }, ${currentTask.start_date.getDate()}`
        ),
        duration: event.target.value,
        currentTask,
      });
    }

    setCurrentTask({
      ...currentTask,
      [event.target.name]: event.target.value,
      end_date,
    });

    // } else {
    //   setCurrentTask({
    //     ...currentTask,
    //     [event.target.name]: event.target.value,
    //     end_date,
    //   });
    // }
  };

  const onChangeWPRecipeHandler = (keyValue: any) => {
    let end_date = currentTask.end_date;
    if (keyValue?.duration) {
      end_date = gantt.calculateEndDate({
        start_date: currentTask.start_date,
        duration: keyValue.duration,
        currentTask,
      });
      setCurrentTask({
        ...currentTask,
        duration: keyValue?.duration,
        text: keyValue?.text,
        end_date,
      });
    } else {
      setCurrentTask({
        ...currentTask,
        text: keyValue?.text,
        end_date,
      });
    }
  };

  const onDateChangeHandler = (
    date: any,
    date_type: string,
    task_type: string
  ) => {
    if (!date || isNaN(date.getTime())) {
      return;
    }

    let end_date: any = currentTask.end_date;
    let duration = currentTask.duration ? currentTask.duration : 1;

    if (
      date_type === 'start_date' &&
      (task_type === 'wbs' || task_type === 'project_phase')
    ) {
      end_date = gantt.calculateEndDate({
        start_date: new Date(
          `${date.getFullYear()}, ${date.getMonth() + 1}, ${date.getDate()}`
        ),
        duration: duration,
        currentTask,
      });
    }

    end_date = date_type === 'end_date' ? date : end_date;

    if (
      (task_type === 'project_phase' || task_type === 'wbs') &&
      date_type === 'end_date' &&
      currentTask.start_date &&
      date !== ''
    ) {
      duration = gantt.calculateDuration({
        start_date: currentTask.start_date,
        end_date: date,
        currentTask,
      });
    }

    if (
      (task_type === 'work_package' || task_type === 'task') &&
      date_type === 'start_date' &&
      duration &&
      date !== ''
    ) {
      end_date = gantt.calculateEndDate({
        start_date: date,
        duration: currentTask.duration,
        currentTask,
      });
    }
    if (
      (task_type === 'work_package' || task_type === 'task') &&
      date_type === 'start_date' &&
      !currentTask.duration
    ) {
      end_date = gantt.calculateEndDate({
        start_date: date,
        duration: 1,
        currentTask,
      });
    }
    setCurrentTask({
      ...currentTask,
      [date_type]: date,
      duration,
      end_date,
      type: task_type,
    });
  };

  const onCloseLightBox = (
    action: string,
    assignee: any = '',
    selectedWP: any = null
  ) => {
    const task = { ...currentTask };
    // gantt.unselectTask();

    if (action === 'add') {
      //..apply values
      delete task.$new;
      task.assignedTo = assignee?.id || null;
      task.assigneeName = assignee?.name || '-';
      assignee?.id
        ? setNewTasksAssignee([
            ...newTasksAssignee,
            { taskId: task.id, assigneeId: assignee?.id },
          ])
        : null;
      // if (task.type.indexOf('_') != -1) {
      //   const type =
      //     task.type.split('_')[0].charAt(0).toUpperCase() +
      //     task.type.split('_')[0].slice(1) +
      //     ' ' +
      //     task.type.split('_')[1].charAt(0).toUpperCase() +
      //     task.type.split('_')[1].slice(1);
      //   task.typeName = type.charAt(0).toUpperCase() + type.slice(1);
      // } else {
      //   const type = task.type.replace(/[&\/\\#,+_()$~%.'":*?<>{}]/g, ' ');

      //   task.typeName = type.charAt(0).toUpperCase() + type.slice(1);
      // }
      selectedWP ? getRecipeTaskAndAddToNewTask(selectedWP, task) : null;

      task.plannedStartDate = transformDateToString(task.start_date);
      task.plannedEndDate = transformDateToString(
        endDateDecreaseByOneDay(task.end_date)
      );
      task.plannedDuration = task.duration;

      const tempIndex = task.index;
      delete task.index;
      gantt.addTask(task, task.parent, tempIndex);
      gantt.showTask(task.id);
    } else {
      gantt.deleteTask(task.id);
      setIsMilestone(false);
      setTypeSelected('');
      setHasChildifProejectTask();
    }
    setCurrentTask({});
  };

  const savePlan = async (
    autoScheduleCallBack: any = null,
    version: any = null
  ) => {
    // detachOnAfterTaskUpdate();
    if (gantt.getTaskByIndex(0).duration === 0) {
      Notification.sendNotification(
        'The project duration has become zero. Please add at least one more activity to save this plan',
        AlertTypes.error
      );
      return;
    }
    if (cpCalculation) {
      setCpCalculation(false);
    }
    window.onbeforeunload = null;
    const projectTask = gantt.getTaskByIndex(0);
    const tasksOpenState: Array<string> = [];
    // gantt.eachTask((task: any) => {
    //   if (!task.$open && task.$has_child) {
    //     tasksOpenState.push(task.id);
    //     gantt.open(task.id);
    //   }
    // });

    // gantt.render();

    const SN: any = [];

    // gantt.eachTask((task: any) => {
    //   if (task.serialNumber != task.$index) {
    //     task.serialNumber = task.$index;
    //     if (newTasks[task.id]) {
    //       setNewTasks(task);
    //     } else {
    //       addUpdatedTask(task);
    //     }
    //   }

    //   gantt.updateTask(task.id, task);
    //   SN.push({
    //     id: task.id,
    //     serialNumber: task.$index,
    //   });
    // });

    const tempTasks = gantt.serialize().data;

    tempTasks.forEach((tempTask: any, index: any) => {
      const task = gantt.getTask(tempTask.id);
      if (task.serialNumber != index) {
        task.serialNumber = index;
        if (newTasks[task.id]) {
          setNewTasks(task);
        } else {
          addUpdatedTask(task);
          // gantt.updateTask(task.id, task);
        }
      }
      SN.push({
        id: task.id,
        serialNumber: index,
      });
      // tasksOpenState.forEach((taskId: string | number) => {
      //   gantt.close(taskId);
      // });
    });

    let createUpdateTask: any = null;

    if (updatedTask[projectTask.id] || newTasks[projectTask.id]) {
      createUpdateTask = ganttToPayload(
        Object.values({ ...newTasks, ...updatedTask }),
        Object.values({ ...newLinks, ...updatedLinks })
      );
    } else {
      createUpdateTask = ganttToPayload(
        Object.values({ projectTask, ...newTasks, ...updatedTask }),
        Object.values({ ...newLinks, ...updatedLinks })
      );
    }
    if (!autoScheduleCallBack) {
      getInsightDemoApi(
        Number(decodeExchangeToken().tenantId),
        Number(pathMatch.params.id)
      );
    }
    const result = await saveProjectPlan(
      { ...version, ...createUpdateTask },
      Object.values(updatedTask).unshift(projectTask),
      autoScheduleCallBack
    );
    updateSerialNumber(SN);
    dispatch(setEditMode(false));
    // ganttEvents = {
    //   ...ganttEvents,
    //   onAfterTaskUpdate: attachOnAfterTaskUpdate(),
    // };
  };

  const handleExports = async (operation: string) => {
    switch (operation) {
      case 'msp':
        await getProjectPlanAllTask(false);
        gantt?.exportToMSProject({
          skip_circular_links: false,
          server: process.env.REACT_APP_GANTT_STANDALONE_SERVER,
          name: `${projectPlan.data[0].text}.xml`,
          project: {
            Name: `${projectPlan.data[0].text}`,
            UID: `${projectPlan.data[0].text.substring(0, 3)}`,
          },
          tasks: {
            taskType: function (task: any) {
              if (task.type == 'work_package') {
                return 'work_package';
              } else if (task.type == 'project') {
                return 'project';
              } else if (task.type == 'project_phase') {
                return 'project_phase';
              } else if (task.type == 'milestone') {
                return 'milestone';
              } else if (task.type == 'wbs') {
                return 'wbs';
              } else if (task.type == 'task') {
                return 'task';
              } else {
                return null;
              }
            },
            ActualStart: function (task: any) {
              if (task.status == 'To-Do') {
                return null;
              } else if (task.status == 'In-Progress') {
                if (task.actualStartDate) {
                  return task.actualStartDate + 'T08:00:00';
                }
                return null;
              }
            },
            ActualFinish: function (task: any) {
              if (task.status == 'In-Progress' || task.status == 'To-Do') {
                return null;
              } else {
                return task.actualEndDate + 'T08:00:00';
              }
            },
          },
        });
        break;
      case 'p6':
        await getProjectPlanAllTask(false);
        gantt?.exportToPrimaveraP6({
          skip_circular_links: false,
          server: process.env.REACT_APP_GANTT_STANDALONE_SERVER,
          name: `${projectPlan.data[0].text}.xml`,
          project: {
            Name: `${projectPlan.data[0].text}-SLATE`,
          },
          tasks: {
            taskType: function (task: any) {
              if (task.type == 'work_package') {
                return 'work_package';
              } else if (task.type == 'project') {
                return 'project';
              } else if (task.type == 'project_phase') {
                return 'project_phase';
              } else if (task.type == 'milestone') {
                return 'milestone';
              } else if (task.type == 'wbs') {
                return 'wbs';
              } else if (task.type == 'task') {
                return 'task';
              } else {
                return null;
              }
            },
            ActualStart: function (task: any) {
              if (task.status == 'To-Do') {
                return null;
              } else if (task.status == 'In-Progress') {
                if (task.actualStartDate) {
                  return task.actualStartDate + 'T08:00:00';
                }
                return null;
              }
            },
            ActualFinish: function (task: any) {
              if (task.status == 'In-Progress' || task.status == 'To-Do') {
                return null;
              } else {
                return task.actualEndDate + 'T08:00:00';
              }
            },
            PlannedStartDate: function (task: any) {
              return task.plannedStartDate;
            },
            PlannedFinishDate: function (task: any) {
              return task.plannedEndDate;
            },
            TotalFloat: function (task: any) {
              return task.floatValue;
            },
          },
        });
        break;
      default:
        console.log('Invalid operation');
    }
  };

  const updateGanttWithImportedData = (project: any) => {
    let importedParents: any = [];
    const objectOfUuidsWithIds: any = {};
    setinvalidXml(false);
    setXmlImport(true);
    const projectTask = projectPlan.data[0];
    gantt.eachTask((task: any) => {
      if (task.parent != null && task.parent != 0 && task.parent != '0') {
        deleteTasks([task.id]);
      }
    });

    addDeletedLink(gantt.getLinks().map((link: any) => link.id));
    gantt.clearAll();
    const userId = decodeToken().userId;
    project.data.data.map((task: any) => {
      if (task.parent === '0') {
        importedParents.push(task);
      }
      objectOfUuidsWithIds[task.id] = uuidv4();
      task.start_date =
        task.start_date != null
          ? new Date(new Date(task.start_date).setHours(0, 0, 0, 0))
          : new Date(new Date(projectTask.start_date).setHours(0, 0, 0, 0));
      task.createdBy = userId;
      task.assigneeName = '-';
      if (task.duration == 0) {
        task.type = 'milestone';
      }

      if (project.config.duration_unit == 'minute') {
        task.duration = task.duration / 480;
      }
      // setNewTasks(task);
    });
    const keysData = Object.keys(objectOfUuidsWithIds);
    for (let i = 0; i < keysData.length; i++) {
      project.data.data.map((task: any) => {
        if (+task.id === +keysData[i]) {
          task.id = objectOfUuidsWithIds[keysData[i]];
        }
        if (+task.parent === +keysData[i]) {
          task.parent = objectOfUuidsWithIds[keysData[i]];
        }
      });
      project.data.links.map((link: any) => {
        link.id = uuidv4();
        link.createdBy = userId;
        link.lag = parseInt(link.lag);
        if (+link.source === +keysData[i]) {
          link.source = objectOfUuidsWithIds[keysData[i]];
        }
        if (+link.target === +keysData[i]) {
          link.target = objectOfUuidsWithIds[keysData[i]];
        }
        // setNewLinks(link);
      });
    }
    gantt.getCalendar('global').worktime = project.worktime;

    if (importedParents.length > 0) {
      project.data.data.forEach((task: any) => {
        if (task.parent === '0') {
          task.parent =
            projectTask != null || projectTask != undefined
              ? projectTask.id
              : null;
        }
      });
    } else {
      const parent = project.data.data[0].id;
      project.data.data.forEach((task: any) => {
        if (parent === task.parent) {
          task.parent = projectTask;
        }
      });
      project.data.data.splice(0, 1);
    }
    project.data.data.unshift(projectTask);
    importedParents = [];
    setXmlData(project.data);
  };

  const handleImports = async (file: any, operation: string) => {
    switch (operation) {
      case 'MSP':
      case 'P6':
        // dispatch(setIsLoading(true));
        await updateProjectMetaDataImportType(operation);
        uploadFile(file);
        // setinvalidXml(true);
        // gantt?.importFromMSProject({
        //   data: file,
        //   callback: function (project: any) {
        //     if (project) {
        //       updateGanttWithImportedData(project);
        //     } else {
        //       dispatch(setIsLoading(false));
        //       setinvalidXml(true);
        //     }
        //   },
        // });
        break;
      case 'xer':
        dispatch(setIsLoading(true));
        gantt?.importFromPrimaveraP6({
          data: file,
          callback: function (project: any) {
            if (project) {
              updateGanttWithImportedData(project);
            } else {
              dispatch(setIsLoading(false));
              setinvalidXml(true);
            }
          },
        });
        break;
      default:
        console.log('Invalid operation');
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const onContextMenuClose = () => {
    setContextMenu({
      mouseX: null,
      mouseY: null,
      menu: null,
    });
  };

  const onContextMenuLinkClick = (action: string) => {
    switch (action) {
      case 'delete':
        gantt.getSelectedTasks().forEach((id: any) => {
          gantt.unselectTask(id);
        });
        setDeleteConfirmation(true);
    }
  };

  const getMessage = (action: string) => {
    if (action === 'delete') {
      if (linkId) {
        try {
          const link = gantt.getLink(linkId);
          const sourceTaskName = gantt.getTask(link.source).text;
          const targetTaskName = gantt.getTask(link.target).text;

          return `Would you like to delete dependency from ${sourceTaskName} to ${targetTaskName} ?`;
        } catch (e) {}
      }

      if (taskId) {
        try {
          // const taskName = gantt.getTask(taskId).text;

          return `All information about this activity will be lost. Are you sure you want to delete the selected item?`;
        } catch (e) {}
      }
    }
  };

  const cancelDelete = () => {
    if (contextMenu.menu === 'link') {
      setLinkId('');
      onContextMenuClose();
    }

    if (contextMenu.menu === 'task') {
      setTaskId('');
      onContextMenuClose();
    }
    setDeleteConfirmation(false);
  };

  const deleteLink = () => {
    gantt.deleteLink(linkId);
    cancelDelete();
  };

  const deleteTask = () => {
    const task = gantt.getTask(taskId);
    // if (task.status == 'To-Do') {
    const tempDeletedTaskIds = [...getAllChildrens(taskId), taskId];
    deleteTasks(tempDeletedTaskIds);
    const tempLinkId: any = [];
    tempDeletedTaskIds.forEach((id: any) => {
      tempLinkId.push(
        ...gantt.getTask(id).$source,
        ...gantt.getTask(id).$target
      );
    });

    addDeletedLink(Array.from(new Set(tempLinkId)));

    gantt.deleteTask(taskId);

    if (updatedTask[taskId]) {
      deleteUpdatedTask(taskId);
    }
    setIsMilestone(false);
    cancelDelete();
    //remove entries from task assignee list
    if (newTasksAssignee.length) {
      const targetksAssigneeList: Array<any> = [];
      newTasksAssignee.forEach((nTassignee: any) => {
        if (nTassignee.taskId !== taskId) {
          targetksAssigneeList.push(nTassignee);
        }
      });
      setNewTasksAssignee(targetksAssigneeList);
    }
    Notification.sendNotification(
      `Activity deleted successfully`,
      AlertTypes.success
    );
    // } else {
    //   Notification.sendNotification(
    //     `This activity can't be deleted as it(or a child activity) has started already`,
    //     AlertTypes.warn
    //   );
    //   cancelDelete();
    // }
  };

  const onContextMenuTaskClick = (action: string) => {
    switch (action) {
      case 'delete': {
        setDeleteConfirmation(true);
        return;
      }
      case 'link': {
        setIsUpdateLink(true);
        return;
      }
      case 'constraint': {
        setAddConstaint(true);
        onContextMenuClose();
        return;
      }
    }
    // onContextMenuClose();
  };

  const cancelUpdateLink = () => {
    setIsUpdateLink(false);
    cancelDelete();
  };

  const updateLink = (event: any) => {
    const link = gantt.getLink(event.linkId);
    link.lag = +event.lag;
    link.type = event.type;
    // gantt.refreshLink(event.linkId);
    gantt.updateLink(event.linkId);
    setUpdatedLinks(link);
    // if (event.lag < 0) {
    //   let targetStartDate = gantt.getTask(
    //     gantt.getLink(linkId).target
    //   ).start_date;
    //   let targetEndDate = gantt.getTask(gantt.getLink(linkId).target).end_date;
    //   const totalLead = link.lag - lagData;

    //   targetEndDate = gantt.calculateEndDate({
    //     start_date: new Date(targetStartDate),
    //     duration:
    //       totalLead + gantt.getTask(gantt.getLink(linkId).target).duration,
    //   });

    //   targetStartDate = gantt.calculateEndDate({
    //     start_date: new Date(targetEndDate),
    //     duration: -gantt.getTask(gantt.getLink(linkId).target).duration,
    //   });

    //   //   targetEndDate.setDate(targetEndDate.getDate() + totalLead);
    //   //   targetStartDate.setDate(targetStartDate.getDate() + totalLead);

    //   gantt.getTask(gantt.getLink(linkId).target).end_date = targetEndDate;
    //   gantt.getTask(gantt.getLink(linkId).target).start_date = targetStartDate;
    // }
    //  else {
    //   let targetStartDate = gantt.getTask(
    //     gantt.getLink(linkId).target
    //   ).start_date;
    //   let targetEndDate = gantt.getTask(gantt.getLink(linkId).target).end_date;

    //   const totalLag =
    //     link.lag > lagData ? link.lag - lagData : link.lag - lagData;

    //   targetEndDate = gantt.calculateEndDate({
    //     start_date: new Date(targetStartDate),
    //     duration:
    //       totalLag + gantt.getTask(gantt.getLink(linkId).target).duration,
    //   });

    //   targetStartDate = gantt.calculateEndDate({
    //     start_date: new Date(targetEndDate),
    //     duration: -gantt.getTask(gantt.getLink(linkId).target).duration,
    //   });

    //   // targetStartDate.setDate(targetStartDate.getDate() + totalLag);
    //   //  targetEndDate.setDate(targetEndDate.getDate() + totalLag);

    //   gantt.getTask(gantt.getLink(linkId).target).start_date = targetStartDate;
    //   gantt.getTask(gantt.getLink(linkId).target).end_date = targetEndDate;
    // }
    // gantt.updateTask(
    //   gantt.getLink(linkId).target,
    //   gantt.getTask(gantt.getLink(linkId).target)
    // );
    setIsUpdateLink(false);
    cancelDelete();
    // gantt.getTask(taskId).text = "Task #13"; //changes task's data
  };

  const editProjectPlan = async () => {
    if (cpCalculation) {
      setCpCalculation(false);
    }
    const data = await getProjectMetaData(true);

    if (data?.is_Editable) {
      editProjectMetaData('draft', decodeToken().userId);
    }
    // window.location.reload();
  };

  const adjustStartAndEndDate = () => {
    if (gantt && gantt.getTaskByIndex(0)) {
      if (!gantt.getChildren(gantt.getTaskByIndex(0).id).length) {
        gantt.config.start_date = gantt.date.week_start(
          gantt.getTaskByIndex(0).start_date
        );
        gantt.config.end_date = gantt.date.add(
          gantt.getTaskByIndex(0).end_date,
          7,
          'day'
        );
      }
    } else {
      const sValue: unknown = undefined;
      gantt.config.start_date = sValue as Date;
      gantt.config.end_date = sValue as Date;
    }
  };

  const setCLookAheadWeek = (value: number) => {
    setCurrentLookaheadWeek(value);
  };

  const setLookAheadView = (value: string) => {
    setLaheadView(value);
  };

  const closeEditTaskDetailsPage = (flag: boolean) => {
    clearUpdatedTask();
    setEditTaskDetail(flag);
  };

  const acceptChanges = (selectedTaskUpdates: Array<any>) => {
    setAcceptChangesFlag(true);
    const tempPartialUpdatesIds: any = [];
    const taskupdatePromises: any = [];

    const updatedTasks = partialUpdateTasks.filter((pTask: any) => {
      return selectedTaskUpdates.indexOf(pTask.id) > -1;
    });

    updatedTasks.forEach((task: any) => {
      const tempTask = gantt.getTask(task.taskId);
      tempPartialUpdatesIds.push(task.id);

      if (task.taskStatus == 'In-Progress') {
        if (task.actualStartDate) {
          tempTask.actualStartDate = task.actualStartDate;
        }

        // if (task.estimatedDuration) {
        //   tempTask.estimatedDuration = task.estimatedDuration;
        // }

        if (task.estimatedEndDate) {
          tempTask.estimatedEndDate = task.estimatedEndDate;

          if (task.estimatedDuration) {
            tempTask.estimatedDuration = task.estimatedDuration;
          } else {
            tempTask.estimatedDuration = gantt.calculateDuration({
              start_date: moment(new Date(tempTask.actualStartDate))
                .startOf('day')
                .toDate(),
              end_date: endDateIncreaseByOneDay(tempTask.estimatedEndDate),
              tempTask,
            });
          }
        } else {
          tempTask.estimatedEndDate = gantt.calculateEndDate({
            start_date: new Date(tempTask.actualStartDate.replace(/-/g, '/')),
            duration: tempTask.duration,
            tempTask,
          });

          tempTask.estimatedDuration = tempTask.duration;
          tempTask.estimatedEndDate = moment(tempTask.estimatedEndDate)
            .startOf('date')
            .toDate();
          tempTask.estimatedEndDate = moment
            .utc(tempTask.estimatedEndDate)
            .add(-1, 'd')
            .toDate();
          tempTask.estimatedEndDate = transformDate(tempTask.estimatedEndDate);
        }
      } else if (task.taskStatus == 'Complete') {
        if (task.actualStartDate) {
          tempTask.actualStartDate = task.actualStartDate;
        }

        if (task.actualEndDate) {
          tempTask.actualEndDate = task.actualEndDate;
          // updateParentTaskActualEndDate(task.taskId);

          // tempTask.start_date = new Date(
          //   tempTask.actualStartDate.replace(/-/g, '/')
          // );

          // tempTask.end_date = moment(task.actualEndDate)
          //   .startOf('date')
          //   .toDate();
          // tempTask.end_date.setHours(0, 0, 0, 0);
          // tempTask.end_date = moment
          //   .utc(tempTask.end_date)
          //   .add(1, 'd')
          //   .toDate();

          if (task.actualDuration) {
            tempTask.actualDuration = task.actualDuration;
          } else {
            tempTask.actualDuration = gantt.calculateDuration({
              start_date: new Date(tempTask.actualStartDate),
              end_date: new Date(
                endDateIncreaseByOneDay(tempTask.actualEndDate)
              ),
              tempTask,
            });
          }
        }
      }

      if (task.estimatedStartDate) {
        tempTask.estimatedStartDate = task.estimatedStartDate;
      }
      if (task.plannedDuration) {
        tempTask.duration = task.plannedDuration;
        tempTask.plannedDuration = task.plannedDuration;
      }

      if (task.plannedEndDate) {
        tempTask.end_date = moment(task.plannedEndDate)
          .startOf('date')
          .toDate();
        // tempTask.end_date.setHours(0, 0, 0, 0);
        tempTask.end_date = moment.utc(tempTask.end_date).add(1, 'd').toDate();
        tempTask.plannedEndDate = task.plannedEndDate;
      }

      if (task.plannedStartDate) {
        tempTask.start_date = moment(task.plannedStartDate)
          .startOf('date')
          .toDate();
        // tempTask.start_date = task.plannedStartDate;
        // tempTask.start_date.setHours(0, 0, 0, 0);
        // tempTask.end_date.startOf('date');
        tempTask.plannedStartDate = task.plannedStartDate;
      }

      if (task.taskLpsStatus) {
        tempTask.lpsStatus = task.taskLpsStatus;
      }

      if (task.taskStatus) {
        if (task.taskStatus === 'In-Progress') {
          // tempTask.lpsStatus = null;
          tempTask.actualEndDate = null;
          tempTask.actualDuration = null;
        }

        if (task.taskStatus === 'To-Do') {
          tempTask.actualEndDate = null;
          tempTask.actualStartDate = null;
          tempTask.actualDuration = null;
          tempTask.estimatedEndDate = null;
          tempTask.estimatedDuration = null;
          tempTask.lpsStatus = task.taskLpsStatus;
        }

        if (task.taskStatus === 'Complete') {
          tempTask.estimatedEndDate = null;
          tempTask.estimatedDuration = null;
        }

        // if (
        //   task.taskStatus === 'In-Progress' ||
        //   task.taskStatus === 'Complete' ||
        //   (task.taskStatus === 'To-Do' && tempTask.status != 'To-Do')
        // ) {
        //   taskupdatePromises.push(
        //     taskStatusUpdateApi({
        //       taskId: tempTask.id,
        //       status: task.taskStatus,
        //       startDate: tempTask.actualStartDate,
        //       endDate:
        //         task.taskStatus === 'In-Progress'
        //           ? null
        //           : tempTask.actualEndDate,
        //     })
        //   );
        // }
        tempTask.status = task.taskStatus;
      }

      if (tempTask.status == 'To-Do') {
        tempTask.start_date = moment(new Date(tempTask.plannedStartDate))
          .startOf('day')
          .toDate();

        tempTask.end_date = endDateIncreaseByOneDay(tempTask.plannedEndDate);
      } else if (tempTask.status == 'In-Progress') {
        tempTask.start_date = moment(new Date(tempTask.actualStartDate))
          .startOf('day')
          .toDate();

        tempTask.end_date = endDateIncreaseByOneDay(tempTask.estimatedEndDate);
      } else {
        tempTask.start_date = moment(new Date(tempTask.actualStartDate))
          .startOf('day')
          .toDate();

        tempTask.end_date = endDateIncreaseByOneDay(tempTask.actualEndDate);
      }

      gantt.updateTask(task.taskId, tempTask);
      // updateParentTaskStatusAndActualDates(
      //   gantt.getTask(task.taskId).parent,
      //   gantt.getTask(task.taskId)
      // );
      updateParentTaskRollUp(tempTask);
    });

    if (
      projectScheduleMetadata.importType !== 'MSP' &&
      projectScheduleMetadata.importType != 'P6'
    ) {
      gantt.autoSchedule();
    } else {
      setAutoScheduleFlag(true);
    }
    // localStorage.setItem('partialUpdateCount', partialUpdatesIds.length);
    setPartialUpdatesIds(tempPartialUpdatesIds);

    // Promise.all(taskupdatePromises).then((values: any) => {
    //   // const startTime = performance.now();

    //   gantt.autoSchedule();

    //   // const endTime = performance.now();

    //   // savePlan();
    //   bulkUpdateIsDeleteStatus(taskIds, true);
    // });
  };

  const recjectedChanges = (selectedTaskUpdates: Array<any>) => {
    const updatedTasks = partialUpdateTasks.filter((pTask: any) => {
      return selectedTaskUpdates.indexOf(pTask.id) > -1;
    });
    const ids = updatedTasks.map((uTask: any) => uTask.id);
    bulkUpdateIsDeleteStatus(ids, false, Number(pathMatch.params.id));
    // getInsightDemoApi(
    //   Number(decodeExchangeToken().tenantId),
    //   Number(pathMatch.params.id)
    // );
  };

  const handleWeeklyPlanChange = (argStatus: boolean) => {
    setWeeklyPlanStatus(!argStatus);
    if (argStatus) {
      getProjectPlanCalendar();
      gantt.clearAll();
      getProjectPlan();
      getProjectMetaData(true);
    }
  };

  const getTaskBeforeAcceptChanges = () => {
    getProjectPlanAllTask(false);
  };

  const show_cover = () => {
    gantt.showCover();
    // const overlay = document.createElement('div');
    // overlay.style.position = 'absolute';
    // overlay.style.zIndex = '2';
    // overlay.style.top = '10%';
    // overlay.style.width = '200';
    // overlay.style.backgroundColor = 'orange';
    // overlay.innerHTML = 'Loading';
    // document.getElementsByClassName('gantt_cal_cover')[0].appendChild(overlay);
    // const image = document.createElement('img');
    // image.src = 'https://i.imgur.com/T3Ht7S3.gif';
    // overlay.appendChild(image);
  };
  const uploadFile = async (file: any) => {
    setImportWarningPopup({
      type: 'upload',
      open: true,
      message:
        'Your file is being uploaded. Please do not refresh or close this window',
      okay: false,
    });
    let fileData: any = {};
    const payload: any = [];
    try {
      // dispatch(setIsLoading(true));
      fileData = {
        fileName: file?.name,
        projectId: Number(pathMatch.params.id),
        featureId: 4,
      };
      payload.push(fileData);
      // dispatch(setIsLoading(true));
      const projectTokenResponse = await postApiWithEchange(
        'V1/S3/uploadFilesInfo',
        payload
      );

      if (projectTokenResponse?.success.length > 0) {
        // await projectTokenResponse?.success.forEach(
        //   (item: any, index: number) => {

        //   }
        // );

        await uploadFileToS3(projectTokenResponse?.success[0], file);
        editProjectMetaData('import', decodeToken().userId);
      }
      // editProjectMetaData('draft', decodeToken().userId);
      setImportWarningPopup({ type: '', open: false, okay: false });

      // dispatch(setIsLoading(false));
      return true;
    } catch (error) {
      // editProjectMetaData('draft', decodeToken().userId);
      Notification.sendNotification(error, AlertTypes.warn);
      setImportWarningPopup({ type: '', open: false, okay: false });

      // dispatch(setIsLoading(false));
    }
  };

  const redirectToHomePage = () => {
    history.push('/');
    setImportWarningPopup({
      type: '',
      open: false,
      message:
        'Your file is being uploaded, please do not refresh or close this window',
      okay: false,
    });
  };

  const onConfirmationDiscard = () => {
    setDiscardConfirmDialog(false);
    editProjectMetaData('published', decodeToken().userId);
    // const undoStack = gantt.getUndoStack()?.length || 0;
    // for (let i = 0; i < undoStack; i += 1) {
    //   gantt.undo();
    // }
    clearNewTask();
    setProjectPlanStatusFlag('discard');
    dispatch(setEditMode(false));
  };

  const checkURLTaskAndLoad = () => {
    if (history.location.search.includes('task-id=')) {
      const targetTaskId = history.location.search?.split('task-id=')[1];
      if (targetTaskId) {
        getProjectPlanByTaskId(targetTaskId);
        setProjectPlanStatusFlag(null);
        return;
      } else {
        getProjectPlan();
        setProjectPlanStatusFlag(null);
      }
    } else {
      if (localStorage.getItem('redirect_recipe'))
        getAllTaskForRecipeSelection();
      else getProjectPlan();
      setProjectPlanStatusFlag(null);
    }
  };

  const saveVersionBaseLine = (version: any) => {
    savePlan(null, version);
  };

  const onVersionChange = (e: any) => {
    if (e?.target?.value) {
      setCurrentGanttView('baseline');
      getVersionDataById(e.target.value);
    } else {
      if (
        history.location.search.includes('versionId=') &&
        authState.selectedProjectToken
      ) {
        history.push(`/scheduling/project-plan/${Number(pathMatch.params.id)}`);
      }
      getProjectPlan();
      setCurrentGanttView('gantt');
    }
  };

  const expandAll = () => {
    // if (gantt.config.readonly && currentGanttView == 'gantt') {
    //   getProjectPlanAllTask(true);
    // } else {
    gantt.eachTask((task: any) => {
      task.$open = true;
    });
    gantt.render();
    // }
  };

  const collapseAll = () => {
    gantt.getTaskByTime().forEach((task: any) => {
      task.$open = false;
    });
    gantt.render();
  };

  React.useEffect(() => {
    detachOnBeforeTaskDelete();
    ganttEvents = {
      ...ganttEvents,
      onBeforeTaskDelete: attachOnBeforeTaskDelete(),
    };
  }, [cacheTasks]);
  const filter = (filterState: any) => {
    const tasks = gantt.getTaskByTime();
    const appliedFilteresKeys = [
      ...Array.from(Object.keys(filterState)).filter(
        (key) => filterState[key] === true
      ),
    ];
    // ...Array.from(Object.keys(filterState.type)).filter(
    //     (key) => filterState.type[key] === true
    //   ),

    const tempResponsibleCompany = Array.from(
      Object.keys(filterState.responsibleCompany)
    ).filter((key) => filterState.responsibleCompany[key]);

    if (tempResponsibleCompany.length > 0) {
      appliedFilteresKeys.push('responsibleCompany');
    }

    const tempAssignee = Array.from(Object.keys(filterState.assignee)).filter(
      (key) => filterState.assignee[key]
    );

    if (tempAssignee.length > 0) {
      appliedFilteresKeys.push('assignee');
    }

    if (filterState.text.length > 0) {
      appliedFilteresKeys.push('text');
    }
    const tempType = Array.from(Object.keys(filterState.type)).filter(
      (key) => filterState.type[key]
    );

    if (tempType.length > 0) {
      appliedFilteresKeys.push('type');
    }

    if (filterState.plannedStart) {
      appliedFilteresKeys.push('plannedStart');
    }
    if (filterState.plannedEnd) {
      appliedFilteresKeys.push('plannedEnd');
    }
    if (filterState.actualStart) {
      appliedFilteresKeys.push('actualStart');
    }
    if (filterState.actualEnd) {
      appliedFilteresKeys.push('actualEnd');
    }

    const filterMapping: any = {
      type: false,
      criticalTask: false,
      assignee: false,
      plannedStart: false,
      plannedEnd: false,
      actualStart: false,
      actualEnd: false,
      text: false,
      responsibleCompany: false,
    };

    for (let i = 0; i < tasks.length; i++) {
      const task = tasks[i];

      // if (
      //   filterState.type.milestone &&
      //   task.type === gantt.config.types.milestone
      // ) {
      //   filterMapping.milestone = true;
      // } else {
      //   filterMapping.milestone = false;
      // }
      // if (filterState.type.wbs && task.type === gantt.config.types.wbs) {
      //   filterMapping.wbs = true;
      // } else {
      //   filterMapping.wbs = false;
      // }
      // if (
      //   filterState.type.work_package &&
      //   task.type === gantt.config.types.work_package
      // ) {
      //   filterMapping.work_package = true;
      // } else {
      //   filterMapping.work_package = false;
      // }
      // if (filterState.type.task && task.type === gantt.config.types.task) {
      //   filterMapping.task = true;
      // } else {
      //   filterMapping.task = false;
      // }

      //  type filter
      if (tempType.includes(task.type)) {
        filterMapping.type = true;
      } else {
        filterMapping.type = false;
      }
      // Total Float Filter
      if (filterState.criticalTask && task.floatValue == 0) {
        filterMapping.criticalTask = true;
      } else {
        filterMapping.criticalTask = false;
      }
      //Responsible company Filter
      if (
        tempResponsibleCompany.includes(
          task.responsibleContractor?.toString()
        ) ||
        tempResponsibleCompany.includes(
          task.tenantCompanyAssociation?.id?.toString()
        )
      ) {
        filterMapping.responsibleCompany = true;
      } else {
        filterMapping.responsibleCompany = false;
      }

      // Assignee Filter
      if (
        tempAssignee.includes(task.assignedTo) ||
        tempAssignee.includes(task.tenantCompanyAssociation?.id?.toString())
      ) {
        filterMapping.assignee = true;
      } else {
        filterMapping.assignee = false;
      }
      // Planned Start Filter
      if (
        filterState.plannedStart &&
        new Date(task.plannedStartDate).valueOf() >=
          new Date(filterState.plannedStart).valueOf()
      ) {
        filterMapping.plannedStart = true;
      } else {
        filterMapping.plannedStart = false;
      }
      // Planned End Filter
      if (
        filterState.plannedEnd &&
        new Date(task.plannedEndDate).valueOf() <=
          new Date(filterState.plannedEnd).valueOf()
      ) {
        filterMapping.plannedEnd = true;
      } else {
        filterMapping.plannedEnd = false;
      }

      // Actual Start Filter
      if (
        filterState.actualStart &&
        task.actualStartDate &&
        new Date(task.actualStartDate).valueOf() >=
          new Date(filterState.actualStart).valueOf()
      ) {
        filterMapping.actualStart = true;
      } else {
        filterMapping.actualStart = false;
      }

      // Actual End Filter
      if (
        filterState.actualEnd &&
        task.actualEndDate &&
        new Date(task.actualEndDate).valueOf() <=
          new Date(filterState.actualEnd).valueOf()
      ) {
        filterMapping.actualEnd = true;
      } else {
        filterMapping.actualEnd = false;
      }

      if (
        filterState.text.length > 0 &&
        task.text.toLowerCase().includes(filterState.text.toLowerCase())
      ) {
        filterMapping.text = true;
      } else {
        filterMapping.text = false;
      }

      const result = appliedFilteresKeys.every((key) => filterMapping[key]);
      if (result) {
        task.show = true;
        displayParentTask(task.parent);
      } else {
        task.show = false;
      }
    }
    gantt.render();
  };

  return (
    <React.Fragment>
      {authState.projectFeaturePermissons?.canviewMasterPlan ? (
        <div className="projectPlan">
          <ProjectPlanHeader
            setAutoScheduleWaitPopup={setAutoScheduleWaitPopup}
            saveProjectPlan={savePlan}
            cpCalculation={cpCalculation}
            setCpCalculation={setCpCalculation}
            exportOperation={(operation: string) => handleExports(operation)}
            importOperation={(file: any, operation: string) =>
              handleImports(file, operation)
            }
            projectMetaData={projectMetaData}
            editProjectPlan={editProjectPlan}
            lookAheadStatus={lookAheadStatus}
            setLookAheadView={setLookAheadView}
            openImport={openImport}
            setOpenImport={setOpenImport}
            setWeeklyPlan={() => handleWeeklyPlanChange(weeklyPlanStatus)}
            weeklyPlanStatus={weeklyPlanStatus}
            partialUpdateTasks={partialUpdateTasks}
            SaveOpenTaskView={SaveOpenTaskView}
            acceptChanges={(selectedTaskUpdates: Array<any>) => {
              acceptChanges(selectedTaskUpdates);
            }}
            recjectedChanges={(selectedTaskUpdates: Array<any>) => {
              recjectedChanges(selectedTaskUpdates);
            }}
            discardChanges={() => {
              if (cpCalculation) {
                setCpCalculation(false);
              }
              if (authState.editMode) {
                setDiscardConfirmDialog(true);
              } else {
                editProjectMetaData('published', decodeToken().userId);
                // getProjectPlan();
              }
            }}
            canImport={canImport}
            getProjectPlanAllTaskAndParse={getProjectPlanAllTaskAndParse}
            autoSchedule={() => {
              gantt.autoSchedule();
              calculateTotalFloat(addUpdatedTask);
              setCpCalculation(false);

              gantt.render();
            }}
            projectScheduleMetadata={projectScheduleMetadata}
            setOpenBaselinePopup={setOpenBaselinePopup}
            setViewVersion={setViewVersion}
            currentGanttView={currentGanttView}
            viewScheduleUpdate={viewScheduleUpdate}
            setViewScheduleUpdate={setViewScheduleUpdate}
            onVersionChange={onVersionChange}
            setSelectedVersion={setSelectedVersion}
            selectedVersion={selectedVersion}
            setScale={setScale}
            scale={scale}
            expandAll={expandAll}
            collapseAll={collapseAll}
            setCurrentGanttView={setCurrentGanttView}
            showSheduleTask={showSheduleTask}
            expandAllButtonFlag={expandAllButtonFlag}
          />
          {ganttAction === 'create' ? (
            <CreateTask
              open={ganttAction === 'create'}
              task={currentTask}
              onChangeHandler={onChangeHandler}
              onDateChangeHandler={onDateChangeHandler}
              onCloseLightBox={onCloseLightBox}
              setCurrentTask={setCurrentTask}
              onChangeWPRecipeHandler={onChangeWPRecipeHandler}
              setGanttAction={setGanttAction}
            />
          ) : null}
          {/* {!weeklyPlanStatus ? (
            <Gantt
              showCover={show_cover}
              tasks={projectPlan}
              cpCalculation={cpCalculation}
              lookAheadStatus={lookAheadStatus}
              setCLookAheadWeek={setCLookAheadWeek}
              lookAheadView={laheadView}
              isRecepiePlan={false}
              showAddTaskButton={showAddTaskButton}
              isEditingRecipe={false}
            />
          ) : (
            <WeeklyPlan weeklyPlanStatus={weeklyPlanStatus}></WeeklyPlan>
          )} */}

          {(currentView === 'gantt' || currentView === 'lookahead') && (
            <Gantt
              showCover={show_cover}
              tasks={projectPlan}
              cpCalculation={cpCalculation}
              lookAheadStatus={lookAheadStatus}
              setCLookAheadWeek={setCLookAheadWeek}
              lookAheadView={currentScale}
              isRecepiePlan={false}
              showAddTaskButton={showAddTaskButton}
              isEditingRecipe={false}
              addUpdatedTask={addUpdatedTask}
              projectScheduleMetadata={projectScheduleMetadata}
            />
          )}

          {currentView === 'weekly' && (
            <WeeklyPlan weeklyPlanStatus={weeklyPlanStatus}></WeeklyPlan>
          )}

          {currentGanttView == 'gantt' && (
            <FloatingButton
              projectMetaData={projectMetaData}
              isMilestone={isMilestone}
              typeSelected={typeSelected}
            ></FloatingButton>
          )}
          {contextMenu.mouseY !== null ? (
            <Menu
              open={contextMenu.mouseY !== null}
              onClose={onContextMenuClose}
              anchorReference="anchorPosition"
              anchorPosition={
                contextMenu.mouseY !== null && contextMenu.mouseX !== null
                  ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                  : undefined
              }
            >
              {contextMenu.menu === 'link' ? (
                <div>
                  <MenuItem
                    data-testid="deletelink"
                    onClick={() => {
                      onContextMenuLinkClick('delete');
                    }}
                  >
                    {' '}
                    <span style={{ color: '#B72D2D' }}>Delete</span>
                  </MenuItem>
                  <MenuItem
                    data-testid="editlink"
                    onClick={() => {
                      onContextMenuTaskClick('link');
                    }}
                  >
                    {' '}
                    <span style={{ color: '#B72D2D' }}>Edit</span>
                  </MenuItem>
                </div>
              ) : contextMenu.menu === 'task' ? (
                <div>
                  <MenuItem
                    data-testid="addAbove"
                    onClick={() => {
                      onContextMenuClose();
                      const task = gantt.getTask(taskId);
                      sessionStorage.setItem(
                        'project-plan-action',
                        'add-above'
                      );
                      gantt.createTask(
                        { index: task.$local_index },
                        task.parent,
                        task.$local_index
                      );
                    }}
                  >
                    {' '}
                    <span style={{ color: '#B72D2D' }}>Add above</span>
                  </MenuItem>
                  <CopyPasteMenu handleClose={onContextMenuClose} />
                  <MenuItem
                    data-testid="deletetask"
                    onClick={() => {
                      onContextMenuTaskClick('delete');
                    }}
                  >
                    {' '}
                    <span style={{ color: '#B72D2D' }}>Delete</span>
                  </MenuItem>
                </div>
              ) : null}

              {contextMenu.menu == 'constraint' ? (
                <MenuItem
                  data-testid="addConstraint"
                  onClick={() => {
                    onContextMenuTaskClick('constraint');
                  }}
                >
                  {' '}
                  <span style={{ color: '#B72D2D' }}>Add Constraint</span>
                </MenuItem>
              ) : null}
              <ShowComponent showState={contextMenu.menu === 'published_task'}>
                <PublishedTaskMenu
                  handleClose={(menuType: keyof PublishedMenuType) => {
                    onContextMenuClose();
                    setOpenAssigneeDialog(menuType);
                  }}
                />
              </ShowComponent>

              {contextMenu.menu == 'filterType' ? (
                <div>
                  <MenuItem
                    disableRipple
                    data-testid="filter-type-milestone"
                    className="projectPlan__filter__type-milestone"
                  >
                    <Checkbox
                      data-testid="filter-type-milestone-checkbox"
                      onChange={(event) => {
                        setFilterState({
                          ...filterState,
                          type: {
                            ...filterState.type,
                            milestone: event.target.checked,
                          },
                        });
                      }}
                      checked={filterState.type.milestone}
                      inputProps={{
                        'aria-labelledby': 'filter-type-milestone',
                      }}
                      color="default"
                    />
                    <span> Milestone</span>
                  </MenuItem>

                  <MenuItem
                    disableRipple
                    data-testid="filter-type-wbs"
                    className="projectPlan__filter__type-wbs"
                  >
                    <Checkbox
                      data-testid="filter-type-wbs-checkbox"
                      onChange={(event) => {
                        setFilterState({
                          ...filterState,
                          type: {
                            ...filterState.type,
                            wbs: event.target.checked,
                          },
                        });
                      }}
                      checked={filterState.type.wbs}
                      inputProps={{
                        'aria-labelledby': 'filter-type-wbs',
                      }}
                      color="default"
                    />
                    <span> WBS</span>
                  </MenuItem>
                  <MenuItem
                    disableRipple
                    data-testid="filter-type-workpackage"
                    className="projectPlan__filter__type-workpackage"
                  >
                    <Checkbox
                      data-testid="filter-type-workpackage-checkbox"
                      onChange={(event) => {
                        setFilterState({
                          ...filterState,
                          type: {
                            ...filterState.type,
                            work_package: event.target.checked,
                          },
                        });
                      }}
                      checked={filterState.type.work_package}
                      inputProps={{
                        'aria-labelledby': 'filter-type-work_package',
                      }}
                      color="default"
                    />
                    <span> Work Package</span>
                  </MenuItem>
                  <MenuItem
                    disableRipple
                    data-testid="filter-type-task"
                    className="projectPlan__filter__type-task"
                  >
                    <Checkbox
                      data-testid="filter-type-task-checkbox"
                      onChange={(event) => {
                        setFilterState({
                          ...filterState,
                          type: {
                            ...filterState.type,
                            task: event.target.checked,
                          },
                        });
                      }}
                      checked={filterState.type.task}
                      inputProps={{
                        'aria-labelledby': 'filter-type-task',
                      }}
                      color="default"
                    />
                    <span> Task</span>
                  </MenuItem>
                </div>
              ) : null}

              {contextMenu.menu == 'filterTotalFloat' ? (
                <MenuItem
                  disableRipple
                  data-testid="filter-total-float-critical-task"
                >
                  <Checkbox
                    data-testid="filter-total-float-critical-task-checkbox"
                    onChange={(event) => {
                      setFilterState({
                        ...filterState,
                        criticalTask: event.target.checked,
                      });
                    }}
                    checked={filterState.criticalTask}
                    inputProps={{
                      'aria-labelledby': 'filter-total-float-task',
                    }}
                    color="default"
                  />
                  <span>Critical Activities</span>
                </MenuItem>
              ) : null}
              {contextMenu.menu == 'filterResponsibleCompany' ? (
                <MenuItem
                  disableRipple
                  data-testid="filter-assignee-list"
                  className="projectPlan__filter__menuItem"
                >
                  <li
                    data-testid="filter-assignee-list-company"
                    className="projectPlan__filter__assigne-company"
                  >
                    <div className="projectPlan__filter__assigne-header">
                      <span>Responsible Company</span>
                    </div>
                    <ul className="projectPlan__filter__assigne__company-container">
                      {Array.from(Object.values(tenantCompanyList)).map(
                        (company: any) => (
                          <li
                            data-testid={`filter-assignee-list-company-${company.id}`}
                            className="projectPlan__filter__assigne-option"
                            key={company.id}
                          >
                            <div>
                              <hr className="projectPlan__filter__assigne-option-line"></hr>
                              <Checkbox
                                onChange={(event) => {
                                  setFilterState({
                                    ...filterState,
                                    responsibleCompany: {
                                      ...filterState.responsibleCompany,
                                      [company?.id]: event.target.checked,
                                    },
                                  });
                                }}
                                checked={
                                  filterState.responsibleCompany[company?.id]
                                }
                                inputProps={{
                                  'aria-labelledby': 'filter-total-float-task',
                                }}
                                color="default"
                              />
                              <Tooltip title={company.name}>
                                <span>{company.name}</span>
                              </Tooltip>
                            </div>
                          </li>
                        )
                      )}
                    </ul>
                  </li>
                </MenuItem>
              ) : null}

              {contextMenu.menu == 'filterActivityName' ? (
                <MenuItem
                  disableRipple
                  className="projectPlan__filter__activity-name"
                  data-testid="filter-activity-name"
                >
                  <div className="projectPlan__filter__activity-name__container">
                    <TextFieldCustom
                      data-testid="activity-name-search"
                      placeholder="Search activity by name"
                      name="text"
                      value={filterState.text}
                      onChange={(e: any) => {
                        setFilterState({
                          ...filterState,
                          text: e.target.value,
                        });
                      }}
                      autoFocus
                    ></TextFieldCustom>
                    <div>
                      <IconButton
                        data-testid="clear-activity-name-search"
                        className="projectPlan__filter__activity-name__container__close"
                        onClick={(e: any) =>
                          setFilterState({
                            ...filterState,
                            text: '',
                          })
                        }
                      >
                        <CancelIcon className="projectPlan__filter__activity-name__container__close-icon" />
                      </IconButton>
                    </div>
                  </div>
                </MenuItem>
              ) : null}

              {contextMenu.menu == 'filterAssignee' ? (
                <MenuItem
                  disableRipple
                  data-testid="filter-assignee-list"
                  className="projectPlan__filter__menuItem"
                >
                  <div className="projectPlan__filter__menuItem-container">
                    <ul>
                      <li
                        data-testid="filter-assignee-list-user"
                        className="projectPlan__filter__assigne-users"
                      >
                        <div className="projectPlan__filter__assigne-header">
                          <span>Users</span>
                        </div>
                        <ul className="projectPlan__filter__assigne__user-container">
                          {Array.from(Object.values(projectUser)).map(
                            (user: any) => {
                              return (
                                <li
                                  data-testid={`filter-assignee-list-user-${user.id}`}
                                  className="projectPlan__filter__assigne-option"
                                  key={user.id}
                                >
                                  <div>
                                    <hr className="projectPlan__filter__assigne-option-line"></hr>
                                    <Checkbox
                                      onChange={(event) => {
                                        setFilterState({
                                          ...filterState,
                                          assignee: {
                                            ...filterState.assignee,
                                            [user?.id]: event.target.checked,
                                          },
                                        });
                                      }}
                                      checked={filterState.assignee[user?.id]}
                                      inputProps={{
                                        'aria-labelledby':
                                          'filter-total-float-task',
                                      }}
                                      color="default"
                                    />

                                    <Tooltip
                                      title={`${user.firstName}  ${user.lastName}`}
                                    >
                                      <span>{`${user.firstName}  ${user.lastName}`}</span>
                                    </Tooltip>
                                  </div>
                                </li>
                              );
                            }
                          )}
                          {/* <li className="projectPlan__filter__assigne-option">
                            <Checkbox
                              onChange={(event) => {
                                console.log(
                                  'event.target.checked: ',
                                  event.target.checked
                                );
                              }}
                              checked={false}
                              inputProps={{
                                'aria-labelledby': 'filter-total-float-task',
                              }}
                              color="default"
                            />
                            <span>Green tea</span>
                          </li> */}
                        </ul>
                      </li>
                      <li
                        data-testid="filter-assignee-list-company"
                        className="projectPlan__filter__assigne-company"
                      >
                        {/* <div className="projectPlan__filter__assigne-header">
                          <span>Responsible Company</span>
                        </div> */}
                        {/* <ul className="projectPlan__filter__assigne__company-container"> */}
                        {/* {Array.from(Object.values(tenantCompanyList)).map(
                            (company: any) => (
                              <li
                                data-testid={`filter-assignee-list-company-${company.id}`}
                                className="projectPlan__filter__assigne-option"
                                key={company.id}
                              >
                                <div>
                                  <hr className="projectPlan__filter__assigne-option-line"></hr>
                                  <Checkbox
                                    onChange={(event) => {
                                      setFilterState({
                                        ...filterState,
                                        assignee: {
                                          ...filterState.assignee,
                                          [company.id]: event.target.checked,
                                        },
                                      });
                                    }}
                                    checked={filterState.assignee[company.id]}
                                    inputProps={{
                                      'aria-labelledby':
                                        'filter-total-float-task',
                                    }}
                                    color="default"
                                  />
                                  <Tooltip title={company.name}>
                                    <span>{company.name}</span>
                                  </Tooltip>
                                </div>
                              </li>
                            )
                          )} */}
                        {/* <li className="projectPlan__filter__assigne-option">
                            <Checkbox
                              onChange={(event) => {
                                console.log(
                                  'event.target.checked: ',
                                  event.target.checked
                                );
                              }}
                              checked={false}
                              inputProps={{
                                'aria-labelledby': 'filter-total-float-task',
                              }}
                              color="default"
                            />
                            <span>Green tea</span>
                          </li> */}
                        {/* </ul> */}
                      </li>
                    </ul>
                  </div>
                </MenuItem>
              ) : null}
            </Menu>
          ) : null}
          <ConfirmDialog
            data-testid="delete-confirm"
            open={deleteConfirmation}
            message={{
              text: getMessage('delete'),
              cancel: 'Cancel',
              proceed: 'Delete',
            }}
            close={cancelDelete}
            proceed={() => {
              if (linkId) {
                deleteLink();
              }
              if (taskId) {
                deleteTask();
              }
              doSelectTasks(taskActionObj, 'delete', handleDeleteTasks);
            }}
          />
          {confirmErrorMessage.open && (
            <ConfirmDialog
              data-testid="confirmErrorMessage"
              open={confirmErrorMessage.open}
              message={{
                header: confirmErrorMessage.header,
                text: confirmErrorMessage.text,
                proceed: confirmErrorMessage.proceed,
              }}
              proceed={() => {
                setConfirmErrorMessage({
                  open: false,
                  text: '',
                  header: '',
                  proceed: 'Ok',
                });
              }}
            />
          )}

          {addConstaint && (
            <AddConstraint
              taskId={taskId}
              open={addConstaint}
              close={() => setAddConstaint(false)}
            />
          )}

          {isUpdateLink && (
            <UpdateLink
              data-testid="updateLinkPopUp"
              open={isUpdateLink}
              linkData={linkData}
              close={cancelUpdateLink}
              proceed={updateLink}
            />
          )}

          {invalidXml ? (
            <ConfirmDialog
              open={invalidXml}
              message={invalidXMLDetails}
              close={handleInvalidXmlClose}
              proceed={handleInvalidXml}
            />
          ) : (
            ''
          )}

          <EditProjectPlanState>
            {editTaskDetail && (
              <EditTaskDetails
                open={editTaskDetail}
                onClose={closeEditTaskDetailsPage}
              />
            )}
          </EditProjectPlanState>
        </div>
      ) : (
        authState.projectFeaturePermissons &&
        (!authState.projectFeaturePermissons?.canviewMasterPlan ? (
          <div className="noCreatePermission">
            <BackNavigation navBack={'/'} />
            <span className="pj-header">Project Plan</span>
            <div className="no-permission">
              <NoDataMessage message={noPermissionMessage} />
            </div>
          </div>
        ) : (
          ''
        ))
      )}
      {discardConfirmDialog && (
        <ConfirmDialog
          open={discardConfirmDialog}
          message={{
            text: 'You have unsaved changes on the plan. Are you sure you want to discard?',
            cancel: 'Cancel',
            proceed: 'Ok',
          }}
          close={() => {
            setDiscardConfirmDialog(false);
          }}
          proceed={() => {
            onConfirmationDiscard();
          }}
        />
      )}

      {projectTaskPopup && (
        <ProjectTaskPopup
          isOpen={projectTaskPopup}
          close={() => setProjectTaskPopup(false)}
          task={{}}
        ></ProjectTaskPopup>
      )}

      {autoScheduleWaitPopup && (
        <Dialog
          onClose={() => {
            setAutoScheduleWaitPopup(false);
          }}
          open={autoScheduleWaitPopup}
          maxWidth={'sm'}
          disableBackdropClick={true}
        >
          <DialogContent className="projectPlan_autoschedule_wait_popup">
            {/* <img
              src={WaitPopupLoader}
              alt="loader"
              className="projectPlan_autoschedule_wait_popup_loader_temp"
            /> */}
            <div className="projectPlan_autoschedule_wait_popup_loader"></div>
            <h3 className="projectPlan_autoschedule_wait_popup_heading">
              Please do not close this
            </h3>
            <p className="projectPlan_autoschedule_wait_popup_text">
              Updates are being processed and the project plan is being saved.
              Kindly wait as this can take a few minutes
            </p>
          </DialogContent>
        </Dialog>
      )}
      {importWarningPopup.open && importWarningPopup.type === 'upload' && (
        <WarningMessage
          open={importWarningPopup.open}
          okay={importWarningPopup.okay}
          onClose={() => console.log(close)}
          onOkayClick={redirectToHomePage}
          message={importWarningPopup.message}
        ></WarningMessage>
      )}

      {importWarningPopup.open && projectMetaData.status === 'import' && (
        <ExportSuccessDialog
          isOpen={importWarningPopup.open}
          footer={
            projectMetaData?.message
              ? ''
              : 'Kindly note that it can sometimes take a while before it reaches your inbox.'
          }
          heading={
            projectMetaData?.message
              ? `${projectMetaData.message}`
              : `We are importing your project plan and will send you an email once done.`
          }
          listOfData={projectMetaData?.message ? [] : [userEmail]}
          handleOnOkClick={redirectToHomePage}
        />
      )}
      {loading && (
        <div className="backdrop">
          <CircularProgress color="inherit" />
        </div>
      )}
      <SaveBaselineVersionPopup
        open={openBaselinePopup}
        close={setOpenBaselinePopup}
        currentVersionList={currentVersionList}
        saveVersionBaseLine={saveVersionBaseLine}
        curren
      ></SaveBaselineVersionPopup>

      {viewVersion && (
        <OutsideClickHandler
          onOutsideClick={() => setViewVersion(false)}
          useCapture={true}
          disabled={viewVersionOutSideClickDisabled}
        >
          <ViewVersionListPanel
            currentVersionList={currentVersionList}
            projectUser={projectUser}
            deleteVersion={deleteVersion}
            setViewVersionOutSideClickDisabled={
              setViewVersionOutSideClickDisabled
            }
            setSelectedVersion={setSelectedVersion}
            onVersionChange={onVersionChange}
          ></ViewVersionListPanel>
        </OutsideClickHandler>
      )}
      {!projectTaskPopup && (
        <div
          ref={popoverRef}
          className={'projectPlan__popover ' + popoverObject.direction}
          style={popoverObject.style}
        >
          <ProjectPlanPopover
            OnMoreDetail={openMoreDetailTask}
            OnMounted={onPopoverMounted}
            taskId={popoverObject.taskId}
            taskDetail={
              popoverObject.taskId ? gantt.getTask(popoverObject.taskId) : null
            }
            type={
              popoverObject.taskId
                ? gantt.getTask(popoverObject.taskId).type
                : ''
            }
            showMoreButton={
              gantt.config.readonly && currentGanttView === 'gantt'
            }
          />
        </div>
      )}
      <EditProjectPlanState>
        <PublishedMenuDialog
          openState={[!!isOpenAssigneeDialog, setOpenAssigneeDialog]}
          menuType={isOpenAssigneeDialog}
        />
      </EditProjectPlanState>
    </React.Fragment>
  );
}
