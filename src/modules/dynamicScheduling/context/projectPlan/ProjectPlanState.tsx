import axios from 'axios';
import { gantt } from 'dhtmlx-gantt';
import React, { useContext, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  axiosApiInstance,
  deleteApiSchedulerWithPayload,
  getApiSchedulerWithExchange,
  multiPartPost,
  patchApiSchedulerWithEchange,
  postSchedulerApiWithProjectExchange,
  putApiScheduler,
} from '../../../../services/api';
import {
  decodeExchangeToken,
  decodeToken,
  getExchangeToken,
  getProjectExchangeToken,
} from '../../../../services/authservice';
import { client } from '../../../../services/graphql';
import {
  projectFeatureAllowedRoles,
  tenantCompanyRole,
} from '../../../../utils/role';
import {
  GET_ALL_PROJECT_ASSOCIATED_CALENDAR,
  GET_PROJECT_PLAN_CALENDAR,
} from '../../../baseService/projectSettings/graphql/queries/calendarAssociation';
import { setIsLoading } from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import { ProductivityInputType } from '../../features/ProjectPlan/components/EditTaskDetailsViewProductivity/EditTaskDetailsViewProductivity';
import {
  CREW_MASTER_ASSIGNEE_FROM_TASK_DETAILS,
  UPDATE_TASK_ASSIGNEE,
} from '../../graphql/queries/editTaskDetails';
import {
  GET_PARTIAL_UPDATED_TASKS,
  IS_DELETE_STATUS_PARTIAL_BULK_UPDATE,
} from '../../graphql/queries/partialUpdate';
import {
  DELETE_VERSION_BY_ID,
  EDIT_PROJECT_METADATA_EDITED_BY,
  EDIT_PROJECT_METADATA_IMPORT_TYPE,
  EDIT_PROJECT_METADATA_PUBLISHED_BY,
  EDIT_PROJECT_METADATA_PUBLISHED_BY_WITHOUT_DATE,
  GET_ALL_PROJECT_USERS_QUERY,
  GET_CHILD_TASK,
  GET_PROJECT_PLAN,
  GET_PROJECT_PLAN_ALL_TASK,
  GET_PROJECT_SCHEDULE_METADATA,
  GET_TENANT_COMPANIES,
  GET_VERSIONS_QUERY,
  SAVE_PROJECT_PLAN,
  UPDATE_PROJECT_CONTRACTUAL_DATES,
} from '../../graphql/queries/projectPlan';
import { UPDATE_PROJECT_PRODUCTIVITY } from '../../graphql/queries/projectProductivity';
import { GET_RECIPE_PLAN } from '../../graphql/queries/recipePlan';
import { priorityPermissions } from '../../permission/scheduling';
import { getTaskTypeName } from '../../utils/ganttConfig';
import {
  responseToGantt,
  transformDate,
  transformDateToString,
} from '../../utils/ganttDataTransformer';
import ProjectPlanContext from './projectPlanContext';
import projectPlanReducer from './projectPlanReducer';
import {
  ADD_MULTIPLE_NEW_LINK,
  ADD_NEW_LINK,
  ADD_UPDATED_LINK,
  ADD_UPDATED_TASK,
  CACHE_TASKS,
  CLEAR_DELETED_LINK_ID,
  CLEAR_DELETED_TASK,
  CLEAR_NEW_LINK,
  CLEAR_NEW_TASK,
  CLEAR_TASK_FROM_PUBLISH_MODE,
  CLEAR_UPDATED_LINK,
  CLEAR_UPDATED_TASK,
  DELETE_NEW_TASK,
  DELETE_TASK_FROM_UPDATED_TASK,
  GET_ALL_PROJECT_USERS,
  GET_CHILD_TASKS,
  GET_PARTIAL_UPDATED_TASK,
  GET_PROJECT_SCHEDULE_META_DATA,
  GET_TENANT_COMPANIES_LIST,
  GET_VERSIONS,
  REFRESH_PROJECT_PLAN,
  SET_CP_CALCULATION,
  SET_CURRENT_LOOKAHEAD_WEEK,
  SET_CURRENT_SCALE,
  SET_CURRENT_TASK,
  SET_CURRENT_VIEW,
  SET_DELETED_LINK_ID,
  SET_DELETE_TASK_ID,
  SET_EXPAND_ALL_BUTTON_FLAG,
  SET_GANTT_ACTION,
  SET_LOOKAHEAD_ACTION,
  SET_LOOK_AHEAD_STATUS,
  SET_METADATA,
  SET_NEW_TASK,
  SET_NEW_TASK_ASSIGNEE,
  SET_PARTIAL_UPDATES_IDS,
  SET_PROJECT_PLAN,
  SET_PROJECT_PLAN_CALENDAR,
  SET_PROJECT_PLAN_CALENDAR_LIST,
  SET_SAVE_PLAN_SUCCESS_FLAG,
  SET_TASK_FROM_PUBLISH_MODE,
  SET_XML_IMPORT,
  UPDATE_PROJECT_SCHEDULE_META_DATA,
} from './types';
const ProjectPlanState = (props: any) => {
  const initialState = {
    projectPlan: { data: {} },
    cacheTasks: {},
    newTasks: {},
    ganttAction: '', // values create, update delete
    parentId: '', // values create, update delete
    newLinks: {},
    currentTask: {},
    updatedLinks: {},
    deletedTaskIds: [],
    cpCalculation: false,
    xmlImport: false,
    projectMetaData: {},
    lookAheadStatus: false,
    currentLookaheadWeek: 0,
    lookAheadAction: null,
    calendar: null,
    projectUser: {},
    newTasksAssignee: [],
    partialUpdateTasks: [],
    projectScheduleMetadata: {},
    updatedTask: {},
    deletedLinkIds: [],
    taskFromPublishMode: {},
    tenantCompanyList: {},
    currentView: 'gantt', // gantt(default) | lookahead | weekly
    currentScale: 'week', // week, month, year, default
    currentVersionList: [],
    expandAllButtonFlag: false,
    partialUpdatesIds: [],
    savePlanSuccessCall: false,
    calendarList: [],
  };
  const DASHBOARD_URL: any = process.env['REACT_APP_ENVIRONMENT'];
  const [state, dispatch] = useReducer(projectPlanReducer, initialState);
  const authContext: any = useContext(stateContext);

  const saveProjectPlan = async (
    saveProjectPlanPayload: any,
    ganttTask: any,
    autoScheduleCallBack: any = null
  ) => {
    try {
      let version: any = null;

      if (saveProjectPlanPayload.versionName) {
        version = {
          versionName: saveProjectPlanPayload.versionName,
          isBaseline: saveProjectPlanPayload.isBaseline,
          description: saveProjectPlanPayload.description
            ? saveProjectPlanPayload.description
            : null,
        };
      }

      delete saveProjectPlanPayload.versionName,
        delete saveProjectPlanPayload.isBaseline,
        delete saveProjectPlanPayload.description;

      if (!autoScheduleCallBack) {
        authContext.dispatch(setIsLoading(true));
      }
      let deleteResponse: any;
      let res: any;

      if (!version || version.isBaseline) {
        if (
          state.deletedTaskIds.length > 0 ||
          state.deletedLinkIds.length > 0
        ) {
          deleteResponse = await deleteTaskApiCall({
            deleteTasksIds: [], // Array.from(new Set(state.deletedTaskIds))
            deleteLinkIds: Array.from(new Set(state.deletedLinkIds)),
          });
        }

        if (
          saveProjectPlanPayload.tasks.length > 0 ||
          saveProjectPlanPayload.links.length > 0
        ) {
          res = await client.mutate({
            mutation: SAVE_PROJECT_PLAN,
            variables: {
              tasks: saveProjectPlanPayload.tasks,
              links: saveProjectPlanPayload.links,
              deleteTasksIds: Array.from(new Set(state.deletedTaskIds)),
              deleteLinkIds: [],
            },
            context: {
              role: projectFeatureAllowedRoles.createMasterPlan,
              token: authContext.state.selectedProjectToken,
            },
          });
          setSavePlanSuccessCall(true);
          let assigneId = saveProjectPlanPayload.tasks.filter(
            (task: any) => task.assignedTo
          );
          assigneId = assigneId.map((task: any) => task.assignedTo);

          const tempSet = new Set(assigneId);
          const tempAssignee = Array.from(tempSet);
          crewMasterAssignee(tempAssignee);
        }
      }
      if (version) {
        if (version.isBaseline) {
          saveVersion(version);
        } else {
          saveVersion({
            ...version,
            ...saveProjectPlanPayload,
            deleteTasksIds: state.deletedTaskIds,
            deleteLinkIds: state.deletedLinkIds,
          });
          return;
        }
      }
      gantt.ext.inlineEditors.hide();
      createUpdateProjectProgress();
      //console.log('saved!!!', res);

      //  refresh project plan after save
      // const tempData = res.data.insertProjectTask_relationship_mutation;
      // const targetGanttObject = responseToGantt({ data: tempData });
      // targetGanttObject.data.forEach((task: any) => {
      //   const newlycreatedTaskAssignee = ganttTask.filter(
      //     (gtask: any) => gtask.id === task.id
      //   );
      //   newlycreatedTaskAssignee.length
      //     ? (task.assigneeName = newlycreatedTaskAssignee[0].assigneeName)
      //     : null;
      // });
      // dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });

      // //  refresh cacheTaska after save
      // const taskMap = new Map();
      // tempData.tasks.forEach((task: any) => {
      //   taskMap.set(task.id, task);
      // });

      // dispatch({ type: CACHE_TASKS, payload: taskMap });
      const tempProjectTask = gantt.getTaskByIndex(0);
      // getProjectPlan();
      if (!autoScheduleCallBack) {
        authContext.dispatch(setIsLoading(false));
      } else {
        autoScheduleCallBack(false);
      }

      Notification.sendNotification(
        'Saved project plan successfully',
        AlertTypes.success
      );

      clearAddUpdateDeleteState();

      await triggerAssigneeTasks();

      await editProjectMetaData(
        'published',
        decodeToken().userId,
        transformDateToString(tempProjectTask.start_date),
        transformDateToString(tempProjectTask.end_date)
      );

      await scheduleProgressUpdate();

      await dashBoardScheduleChange();
      return true;
    } catch (err) {
      dispatch({ type: SET_PARTIAL_UPDATES_IDS, payload: [] });
      getProjectPlan();
      if (!autoScheduleCallBack) {
        authContext.dispatch(setIsLoading(false));
      } else {
        autoScheduleCallBack(false);
      }
      if (
        err.errors &&
        err.errors[0].extensions.internal.response.body.error.includes(
          'check_start_end_date_value'
        )
      ) {
        Notification.sendNotification(
          'Please check the start/end date values of activities as they are causing the duration to be zero.',
          AlertTypes.error
        );
      } else {
        Notification.sendNotification(
          'Something went wrong. Please check the schedule again before saving',
          AlertTypes.error
        );
      }
      return false;
    }
  };

  const getProjectPlan = async (loader = true) => {
    try {
      dispatch({ type: SET_PROJECT_PLAN, payload: { data: [] } });

      if (loader) {
        authContext.dispatch(setIsLoading(true));
      }

      const res = await client.query({
        query: GET_PROJECT_PLAN,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      const targetGanttObject = responseToGantt(res);
      const taskMap = new Map();

      res.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      dispatch({ type: CACHE_TASKS, payload: taskMap });
      //  setProjectPlanData(targetGanttObject);
      dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
      authContext.dispatch(setIsLoading(false));

      client
        .query({
          query: GET_PROJECT_PLAN_ALL_TASK,
          variables: {},
          fetchPolicy: 'network-only',
          context: {
            role: projectFeatureAllowedRoles.viewMasterPlan,
            token: authContext.state.selectedProjectToken,
          },
        })
        .then((res: any) => {
          const targetGanttObject = responseToGantt(res);
          gantt.parse(targetGanttObject);
          const taskMap = new Map();
          setExpandAllButtonFlag(true);
          res.data.tasks.forEach((task: any) => {
            taskMap.set(task.id, task);
          });

          dispatch({ type: CACHE_TASKS, payload: taskMap });
          dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
        });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const getProjectPlanByTaskId = async (taskId: string, loader = true) => {
    try {
      dispatch({ type: SET_PROJECT_PLAN, payload: { data: [] } });

      if (loader) {
        authContext.dispatch(setIsLoading(true));
      }

      const response = await getApiSchedulerWithExchange(
        `V1/tasks/hierarchy/${taskId}`
      );
      const targetGanttObject = responseToGantt(response);
      let targetTask = targetGanttObject.data.filter(
        (tsk) => tsk.id == taskId
      )[0];
      let isParent = true;
      while (isParent) {
        if (targetTask.parent) {
          const parentTask = targetGanttObject.data.filter(
            (tsk) => tsk.id == targetTask.parent
          )[0];
          parentTask.open = true;
          targetTask = parentTask;
        } else {
          isParent = false;
        }
      }
      const taskMap = new Map();

      response.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      dispatch({ type: CACHE_TASKS, payload: taskMap });

      dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
      authContext.dispatch(setIsLoading(false));
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const getProjectPlanAllTask = async (expandAll: any = false) => {
    try {
      dispatch({ type: SET_PROJECT_PLAN, payload: { data: [] } });
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_PROJECT_PLAN_ALL_TASK,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      const targetGanttObject = responseToGantt(res);
      const taskMap = new Map();

      if (expandAll) {
        targetGanttObject.data.forEach((task: any) => {
          task.$open = true;
        });
        gantt.parse(targetGanttObject);
      } else {
        if (Object.keys(state.taskFromPublishMode).length > 0) {
          targetGanttObject.data.forEach((task: any) => {
            if (state.taskFromPublishMode[task.id])
              task.$open = state.taskFromPublishMode[task.id].$open;
          });
          clearTaskFromPublishMode();
        }
      }
      setExpandAllButtonFlag(true);
      res.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      dispatch({ type: CACHE_TASKS, payload: taskMap });
      //  setProjectPlanData(targetGanttObject);
      dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
      authContext.dispatch(setIsLoading(false));
    } catch (err) {
      console.log('err: ', err);
      authContext.dispatch(setIsLoading(false));
    }
  };

  const initialRecipeSelection = () => {
    const recipeName = localStorage.getItem('redirect_recipe');
    const recipeTasks = gantt.getTaskBy('text', recipeName);
    if (!recipeTasks.length) return;
    recipeTasks.sort((a, b) =>
      new Date(a.plannedStartDate) < new Date(b.plannedStartDate) ? -1 : 1
    );
    const selRecipeId = recipeTasks[0].id;
    let parentId = recipeTasks[0].parent;
    const parentArray = [parentId];
    while (parentId) {
      parentId = gantt.getParent(parentId);
      parentArray.push(parentId);
    }
    for (let i = parentArray.length - 2; i >= 0; i--) {
      gantt.open(parentArray[i]);
    }
    gantt.open(selRecipeId);
    gantt.selectTask(selRecipeId);
    localStorage.removeItem('redirect_recipe');
  };

  const getAllTaskForRecipeSelection = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_PROJECT_PLAN_ALL_TASK,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      const targetGanttObject = responseToGantt(res);
      gantt.parse(targetGanttObject);
      initialRecipeSelection();
      gantt.config.show_grid = true;
      gantt.render();
      const taskMap = new Map();
      res.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });
      dispatch({ type: CACHE_TASKS, payload: taskMap });
      //  setProjectPlanData(targetGanttObject);
      dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {}
  };
  const getProjectPlanAllTaskAndParse = async (data: any) => {
    try {
      dispatch({ type: SET_PROJECT_PLAN, payload: { data: [] } });

      const res = await client.query({
        query: GET_PROJECT_PLAN_ALL_TASK,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      const targetGanttObject = responseToGantt(res);
      const taskMap = new Map();

      res.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });
      if (Object.keys(data).length > 0) {
        targetGanttObject.data.forEach((task: any) => {
          if (data[task.id]) task.$open = data[task.id].$open;
        });
      }
      setExpandAllButtonFlag(true);
      // cache task with old task
      dispatch({ type: GET_CHILD_TASKS, payload: taskMap });
      gantt.parse(targetGanttObject);

      //  setProjectPlanData(targetGanttObject);
      // dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
    } catch (err) {}
  };

  const getChildTask = async (parentId: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const res = await client.query({
        query: GET_CHILD_TASK,
        variables: { parentId },
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });

      const targetGanttObject = responseToGantt(res);
      const taskMap = new Map();
      // gantt.parse(targetGanttObject);

      res.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      gantt.parse({ data: targetGanttObject.data });
      gantt.selectTask(parentId);
      gantt.showTask(parentId);
      dispatch({ type: GET_CHILD_TASKS, payload: taskMap });
      authContext.dispatch(setIsLoading(false));
    } catch (err) {
      console.log('err: ', err);
      authContext.dispatch(setIsLoading(false));
    }
  };
  const setNewTasks = (task: any) => {
    dispatch({ type: SET_NEW_TASK, payload: task });
  };

  const setUpdatedLinks = (link: any) => {
    dispatch({ type: ADD_UPDATED_LINK, payload: link });
  };
  const setNewLinks = (link: any) => {
    dispatch({ type: ADD_NEW_LINK, payload: { link } });
  };
  const setMultipleNewLinks = (links: any) => {
    dispatch({ type: ADD_MULTIPLE_NEW_LINK, payload: links });
  };

  const setGanttAction = (action: string) => {
    dispatch({ type: SET_GANTT_ACTION, payload: action });
  };

  const refreshProjectPlan = (data: any) => {
    dispatch({ type: REFRESH_PROJECT_PLAN, payload: data });
  };

  const setCurrentTask = (task: any) => {
    dispatch({ type: SET_CURRENT_TASK, payload: task });
  };

  const deleteTasks = (taskIds: any) => {
    const t: any = [];

    taskIds.forEach((taskId: any) => {
      if (state.cacheTasks?.get?.(taskId)) {
        t.push(taskId);
      } else {
        deleteNewTask(taskId);
      }
    });
    dispatch({ type: SET_DELETE_TASK_ID, payload: t });
  };

  const setCpCalculation = (flag: boolean) => {
    dispatch({ type: SET_CP_CALCULATION, payload: flag });
  };

  const setXmlImport = (flag: boolean) => {
    dispatch({ type: SET_XML_IMPORT, payload: flag });
  };

  const setLookAheadStatus = (status: boolean) => {
    dispatch({ type: SET_LOOK_AHEAD_STATUS, payload: status });
  };

  const setCurrentLookaheadWeek = (no: number) => {
    dispatch({ type: SET_CURRENT_LOOKAHEAD_WEEK, payload: no });
  };

  const setLookAheadAction = (data: any) => {
    dispatch({ type: SET_LOOKAHEAD_ACTION, payload: data });
  };

  const setCurrentView = (view: string) => {
    dispatch({ type: SET_CURRENT_VIEW, payload: view });
  };
  const getProjectMetaData = async (loader: any = false) => {
    try {
      if (loader) {
        authContext.dispatch(setIsLoading(true));
      }
      const response = await getApiSchedulerWithExchange(
        `V1/projectPlan/check/edit`
      );
      authContext.dispatch(setIsLoading(false));
      dispatch({ type: SET_METADATA, payload: response });
      return response;
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const createUpdateProjectProgress = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await putApiScheduler(`V1/projectProgress/daily`);
      authContext.dispatch(setIsLoading(false));
      return response;
    } catch (e) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const editProjectMetaData = async (
    status: string,
    userId: any,
    plannedStartDate: any = null,
    plannedEndDate: any = null
  ) => {
    const variables: any = { status };

    if (status === 'draft' || status === 'import') {
      variables.edited_by = userId;
      let tempTask = gantt.getTaskByTime();

      tempTask = tempTask.filter((task: any) => task.$open);
      const t: any = {};
      tempTask.forEach((task: any) => {
        t[task.id] = task;
      });

      setTaskFromPublishMode(t);
    } else {
      variables.published_by = userId;
      if (plannedStartDate && plannedEndDate) {
        variables.plannedStartDate = plannedStartDate;
        variables.plannedEndDate = plannedEndDate;
      }
    }
    const targetToken = authContext.state.selectedProjectToken
      ? authContext.state.selectedProjectToken
      : getProjectExchangeToken();
    try {
      // authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation:
          status === 'draft' || status === 'import'
            ? EDIT_PROJECT_METADATA_EDITED_BY
            : plannedStartDate
            ? EDIT_PROJECT_METADATA_PUBLISHED_BY
            : EDIT_PROJECT_METADATA_PUBLISHED_BY_WITHOUT_DATE,
        variables,
        context: {
          role: projectFeatureAllowedRoles.updateMasterPlan,
          token: targetToken,
        },
      });
      // authContext.dispatch(setIsLoading(true));
      getProjectMetaData();
      getProjectScheduleMetaData();
    } catch (err) {
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };
  const updateProjectMetaDataImportType = async (type: string) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: EDIT_PROJECT_METADATA_IMPORT_TYPE,
        variables: { importType: type },
        context: {
          role: projectFeatureAllowedRoles.updateMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      return res;
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      console.log('err: ', err);
    }
  };

  const getProjectPlanCalendar = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res: any = await client.query({
        query: GET_PROJECT_PLAN_CALENDAR,
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: SET_PROJECT_PLAN_CALENDAR,
        payload: res.data.projectCalendarAssociation[0],
      });
    } catch (error) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const getAllProjectPlanCalendar = async () => {
    try {
      dispatch({
        type: SET_PROJECT_PLAN_CALENDAR_LIST,
        payload: [],
      });
      authContext.dispatch(setIsLoading(true));
      const res: any = await client.query({
        query: GET_ALL_PROJECT_ASSOCIATED_CALENDAR,
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: SET_PROJECT_PLAN_CALENDAR_LIST,
        payload: res.data.projectCalendarAssociation,
      });
    } catch (error) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const getProjectUsers = async () => {
    try {
      const res = await client.query({
        query: GET_ALL_PROJECT_USERS_QUERY,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });

      const temp: any = {};
      res.data.user.forEach((user: any) => {
        const tempUser = { ...user, flag: 'user' };
        temp[user.id] = tempUser;
      });
      dispatch({ type: GET_ALL_PROJECT_USERS, payload: temp });
    } catch (err) {}
  };

  const setNewTasksAssignee = (taskAssignee: any) => {
    dispatch({ type: SET_NEW_TASK_ASSIGNEE, payload: taskAssignee });
  };

  const triggerAssigneeTasks = async () => {
    try {
      const targetList: Array<any> = [];
      if (state.newTasksAssignee.length) {
        state.newTasksAssignee.forEach((newTaAssingee: any) => {
          targetList.push({
            taskId: newTaAssingee.taskId,
            assigneeId: newTaAssingee.assigneeId,
          });
        });
        const res = await client.mutate({
          mutation: UPDATE_TASK_ASSIGNEE,
          variables: {
            taskAssignee: targetList,
          },
          context: {
            role: projectFeatureAllowedRoles.updateMasterPlan,
            token: authContext.state.selectedProjectToken,
          },
        });
      }
      state.newTasksAssignee = [];
    } catch (error) {
      console.log(error);
    }
  };
  const getPartialUpdatedTasks = async () => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_PARTIAL_UPDATED_TASKS,
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      dispatch({
        type: GET_PARTIAL_UPDATED_TASK,
        payload: res.data.projectTaskPartialUpdate,
      });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const bulkUpdateIsDeleteStatus = async (
    ids: any,
    isApproved: boolean,
    projectId: any
  ) => {
    const status = isApproved ? 'approved' : 'rejected';
    await client.mutate({
      mutation: IS_DELETE_STATUS_PARTIAL_BULK_UPDATE,
      variables: {
        ids: ids,
        partialUpdateStatus: status,
      },
      context: {
        role: priorityPermissions('update'),
        token: authContext.state.selectedProjectToken,
      },
    });
    getInsightDemoApi(Number(decodeExchangeToken().tenantId), projectId);
    dispatch({
      type: GET_PARTIAL_UPDATED_TASK,
      payload: [],
    });

    getPartialUpdatedTasks();
  };

  const taskStatusUpdateApi = async (taskDetails: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await patchApiSchedulerWithEchange(
        `V1/taskUpdate/status`,
        taskDetails
      );
      authContext.dispatch(setIsLoading(false));

      return response;
    } catch (e) {}
  };

  const getProjectScheduleMetaData = async () => {
    try {
      // authContext.dispatch(setIsLoading(true));

      const response = await client.query({
        query: GET_PROJECT_SCHEDULE_METADATA,
        fetchPolicy: 'network-only',
        context: {
          role: priorityPermissions('view'),
          token: authContext.state.selectedProjectToken,
        },
      });

      dispatch({
        type: GET_PROJECT_SCHEDULE_META_DATA,
        payload: response.data.projectScheduleMetadata[0],
      });
      // authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      dispatch({
        type: GET_PROJECT_SCHEDULE_META_DATA,
        payload: {},
      });
      // authContext.dispatch(setIsLoading(false));
    }
  };

  const updateProjectScheduleMetaData = async (data: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await client.mutate({
        mutation: UPDATE_PROJECT_CONTRACTUAL_DATES,
        variables: {
          contractualStartDate: transformDate(data.contractualStartDate),
          contractualEndDate: transformDate(data.contractualEndDate),
        },
        context: {
          role: priorityPermissions('update'),
          token: authContext.state.selectedProjectToken,
        },
      });

      dispatch({ type: UPDATE_PROJECT_SCHEDULE_META_DATA, payload: data });

      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const dashBoardScheduleChange = async () => {
    try {
      dispatch(setIsLoading(true));
      const token = getExchangeToken();
      const widget = 'PROJECT_SCHEDULE';
      const response = await axios.get(
        `${process.env['REACT_APP_DASHBOARD_URL']}dashboard/v1/refreshWidget` +
          `?widget=${widget}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );
      dispatch(setIsLoading(false));
    } catch (error) {
      dispatch(setIsLoading(false));
      console.log(error);
    }
  };

  const scheduleProgressUpdate = async () => {
    try {
      const response = await axios.post(
        `${process.env['REACT_APP_SCHEDULER_URL']}V1/projectProgressUpdate/daily`
      );
    } catch (error) {
      console.log(error);
    }
  };

  const addUpdatedTask = (task: any) => {
    dispatch({ type: ADD_UPDATED_TASK, payload: task });
  };
  const deleteUpdatedTask = (taskId: any) => {
    dispatch({ type: DELETE_TASK_FROM_UPDATED_TASK, payload: taskId });
  };

  const clearNewTask = () => {
    dispatch({ type: CLEAR_NEW_TASK, payload: {} });
  };
  const clearUpdatedTask = () => {
    dispatch({ type: CLEAR_UPDATED_TASK, payload: {} });
  };

  const clearDeletedTask = () => {
    dispatch({ type: CLEAR_DELETED_TASK, payload: {} });
  };

  const addDeletedLink = (id: any) => {
    if (state.newLinks[id]) {
      const exsistingNewLinks = state.newLinks;
      delete exsistingNewLinks[id];
      setMultipleNewLinks(exsistingNewLinks);
    } else {
      dispatch({ type: SET_DELETED_LINK_ID, payload: id });
    }
  };

  const clearDeleteLink = () => {
    dispatch({ type: CLEAR_DELETED_LINK_ID, payload: [] });
  };
  const clearNewLink = () => {
    dispatch({ type: CLEAR_NEW_LINK, payload: [] });
  };
  const clearUpdateLink = () => {
    dispatch({ type: CLEAR_UPDATED_LINK, payload: [] });
  };

  const setTaskFromPublishMode = (data: any) => {
    dispatch({ type: SET_TASK_FROM_PUBLISH_MODE, payload: data });
  };

  const clearTaskFromPublishMode = () => {
    dispatch({ type: CLEAR_TASK_FROM_PUBLISH_MODE, payload: {} });
  };
  const uploadFileToS3 = async (item: any, file: any) => {
    const config = {
      onUploadProgress: function (progressEvent: any) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
      },
    };
    try {
      await multiPartPost(item.url, item.fields, file, config);
      getProjectScheduleMetaData();
    } catch (error: any) {
      console.log(error.message);
    }
  };

  const clearAddUpdateDeleteState = () => {
    clearNewTask();
    clearUpdatedTask();
    clearDeletedTask;
    clearNewLink();
    clearUpdateLink();
    clearDeleteLink();
  };

  const getRecipeTaskAndAddToNewTask = async (
    wpRecipe: any,
    parentTask: any
  ) => {
    try {
      const res = await client.query({
        query: GET_RECIPE_PLAN,
        variables: { recipeSetId: wpRecipe?.recipeId },
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });

      let targetTasks = getTaskPartOfHierarchy(res.data.recipetasks, wpRecipe);
      const parentStartDate = targetTasks[0].startDate;
      targetTasks = targetTasks.filter((tk: any) => tk.id != wpRecipe.id);

      const ganttTasks: Array<any> = [];
      targetTasks.forEach((task: any) => {
        const tsDate: any = new Date(
          new Date(parentStartDate).setHours(0, 0, 0, 0)
        );
        const teDate: any = new Date(
          new Date(task.startDate).setHours(0, 0, 0, 0)
        );
        const diffTime: any = Math.abs(tsDate - teDate);
        const offset = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        const ganttStartDate = gantt.calculateEndDate({
          start_date: new Date(parentTask?.start_date.setHours(0, 0, 0, 0)),
          duration: offset,
        });

        const newTaskId = uuidv4();

        ganttTasks.push({
          recipeTaskId: task.id,
          recipeParentTaskId: task.parentId,
          id: newTaskId,
          text: task.taskName,
          start_date: ganttStartDate,
          duration: task.duration,
          type: task.type == 'project' ? 'work_package' : task.type,
          typeName: task.type == 'project' ? 'work_package' : task.type,
          createdBy: decodeToken().userId,
          status: 'To-Do',
          recipeSetId: wpRecipe.recipeSetId,
          // assignedTo: pulledTask?.createdBy,
          // assigneeName: getAssigneeName(pulledTask)
        });
      });

      ganttTasks.forEach((task: any) => {
        const filteredParent = ganttTasks.filter(
          (item) => item.recipeTaskId == task.recipeParentTaskId
        );
        const targetParent = filteredParent?.length
          ? filteredParent[0].id
          : parentTask?.id;

        gantt?.addTask(
          {
            id: task.id,
            text: task.text,
            start_date: task.start_date,
            duration: task.duration,
            type: task.type,
            typeName: getTaskTypeName(task.type),
            createdBy: task.createdBy,
            status: task.status,
            $open: true,
            recipeSetId: task.recipeSetId,
            recipeId: task.recipeTaskId,
            // assignedTo: pulledTask?.createdBy,
            // assigneeName: getAssigneeName(pulledTask)
          },
          targetParent
        );

        //gantt.showTask(targetParent);
        //gantt.selectTask(targetParent);
      });

      gantt.open(parentTask.id);

      res.data.recipelinks.forEach((link: any) => {
        const sFound = ganttTasks.filter(
          (t: any) => t.recipeTaskId == link.source
        );
        const tFound = ganttTasks.filter(
          (t: any) => t.recipeTaskId == link.target
        );
        if (sFound.length && tFound.length) {
          let linkType = gantt.config.links.finish_to_start;
          switch (link.type) {
            case '0':
              linkType = gantt.config.links.finish_to_start;
              break;
            case '1':
              linkType = gantt.config.links.start_to_start;
              break;
            case '2':
              linkType = gantt.config.links.finish_to_finish;
              break;
            case '3':
              linkType = gantt.config.links.start_to_finish;
              break;
            default:
              linkType = gantt.config.links.finish_to_start;
              break;
          }

          gantt.addLink({
            id: uuidv4(),
            lag: link.lag,
            source: sFound[0].id,
            target: tFound[0].id,
            createdBy: decodeToken().userId,
            type: linkType,
          });
        }
      });
    } catch (err) {
      console.log(err);
    }
  };

  const getTaskPartOfHierarchy = (
    recipesetTasks: Array<any>,
    wpRecipe: any
  ) => {
    const targetList = [];
    for (let i = 0; i < recipesetTasks.length; i++) {
      if (recipesetTasks[i].id == wpRecipe?.id) {
        targetList.push(recipesetTasks[i]);
        continue;
      }
      if (checkParent(recipesetTasks[i], recipesetTasks, wpRecipe)) {
        targetList.push(recipesetTasks[i]);
      }
    }
    return targetList;
  };

  const checkParent = (
    task: any,
    recipesetTasks: Array<any>,
    wpRecipe: any
  ): any => {
    if (task.parentId == wpRecipe?.id) {
      return true;
    } else if (!task.parentId) {
      return false;
    } else {
      const nextParent = recipesetTasks.filter((t) => t.id == task.parentId);
      return checkParent(nextParent[0], recipesetTasks, wpRecipe);
    }
  };

  const deleteTaskApiCall = async (data: any) => {
    try {
      // authContext.dispatch(setIsLoading(true));
      const response = await deleteApiSchedulerWithPayload(
        `V1/tasks/delete`,
        data
      );
      // authContext.dispatch(setIsLoading(false));
      return response;
    } catch (e) {}
  };

  const deleteNewTask = (taskId: any) => {
    dispatch({ type: DELETE_NEW_TASK, payload: { taskId } });
  };

  const updateSerialNumber = async (data: any) => {
    try {
      // authContext.dispatch(setIsLoading(true));
      const response = await putApiScheduler(
        `V1/taskDetails/update_serialNumber`,
        { taskData: data }
      );
      // authContext.dispatch(setIsLoading(false));
    } catch (e) {
      // authContext.dispatch(setIsLoading(false));
    }
  };

  const getTenantCompanies = async () => {
    try {
      if (
        !decodeExchangeToken().allowedRoles.includes(
          tenantCompanyRole.viewTenantCompanies
        )
      ) {
        dispatch({ type: GET_TENANT_COMPANIES_LIST, payload: [] });
        return;
      }
      const res = await client.query({
        query: GET_TENANT_COMPANIES,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: tenantCompanyRole.viewTenantCompanies,
        },
      });

      const temp: any = {};
      res.data.tenantCompanyAssociation.forEach((company: any) => {
        const tempCompany = { ...company, flag: 'company' };
        temp[company.id] = tempCompany;
      });
      dispatch({ type: GET_TENANT_COMPANIES_LIST, payload: temp });
    } catch (err) {}
  };

  const summaryTaskProgress = async (data: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await putApiScheduler(
        `V1/summaryTasks/progress/update`,
        { taskId: data }
      );
      response?.data?.summaryTaskProgress?.forEach((task?: any) => {
        if (task.taskId == data) {
          gantt.updateTask(task.taskId, {
            ...gantt.getTask(task.taskId),
            progress: task.progress,
          });
        }
      });
      authContext.dispatch(setIsLoading(false));
    } catch (e) {
      console.log(e);
      authContext.dispatch(setIsLoading(false));
    }
  };

  const setCurrentScale = (scale: string) => {
    dispatch({ type: SET_CURRENT_SCALE, payload: scale });
  };

  const saveVersion = async (data: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const response = await postSchedulerApiWithProjectExchange(
        'V1/baseLine/create',
        data,
        authContext.state.selectedProjectToken
      );
      authContext.dispatch(setIsLoading(false));

      if (data.isBaseline) {
        Notification.sendNotification(
          'You have successfully baselined the project plan.',
          AlertTypes.success
        );
      } else {
        Notification.sendNotification(
          `Your version ${data.versionName} has been saved successfully.`,
          AlertTypes.success
        );
      }
      getVersions();
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const getVersions = async () => {
    try {
      const res = await client.query({
        query: GET_VERSIONS_QUERY,
        variables: {},
        fetchPolicy: 'network-only',
        context: {
          role: projectFeatureAllowedRoles.viewMasterPlan,
          token: authContext.state.selectedProjectToken,
        },
      });
      dispatch({
        type: GET_VERSIONS,
        payload: res.data.scheduleBaselineMetadata,
      });
    } catch (err) {
      console.log('err: ', err);
    }
  };

  const getVersionDataById = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));

      const response = await getApiSchedulerWithExchange(`V1/baseline/${id}`);
      const targetGanttObject = responseToGantt({
        data: { tasks: response.data.tasks, links: response.data.links },
      });
      const taskMap = new Map();

      response.data.tasks.forEach((task: any) => {
        taskMap.set(task.id, task);
      });

      dispatch({ type: CACHE_TASKS, payload: taskMap });
      dispatch({ type: SET_PROJECT_PLAN, payload: targetGanttObject });
      authContext.dispatch(setIsLoading(false));
    } catch (error: any) {
      console.log('error: ', error);
      authContext.dispatch(setIsLoading(false));
    }
  };
  const deleteVersion = async (id: any) => {
    try {
      authContext.dispatch(setIsLoading(true));
      const res = await client.mutate({
        mutation: DELETE_VERSION_BY_ID,
        variables: {
          id: id,
        },
        context: {
          role: priorityPermissions('delete'),
          token: authContext.state.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(
        'Version deleted successfully',
        AlertTypes.success
      );
      getVersions();
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const crewMasterAssignee = async (assigneeIds: any) => {
    try {
      const res = await client.mutate({
        mutation: CREW_MASTER_ASSIGNEE_FROM_TASK_DETAILS,
        variables: {
          taskAssignee: assigneeIds,
        },
        context: {
          role: priorityPermissions('create'),
          token: authContext.state.selectedProjectToken,
        },
      });
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
      Notification.sendNotification(err.message, AlertTypes.error);
    }
  };

  const updateProjectProductivity = async (
    variables: ProductivityInputType
  ) => {
    const { id, ...rest } = variables;
    try {
      authContext.dispatch(setIsLoading(true));
      await client.mutate({
        mutation: UPDATE_PROJECT_PRODUCTIVITY,
        fetchPolicy: 'network-only',
        variables: {
          id,
          _set: { ...rest },
        },
        context: {
          role: 'updateMasterPlan',
          token: authContext.state?.selectedProjectToken,
        },
      });
      authContext.dispatch(setIsLoading(false));
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const setExpandAllButtonFlag = (flag: boolean) => {
    dispatch({ type: SET_EXPAND_ALL_BUTTON_FLAG, payload: flag });
  };

  const setPartialUpdatesIds = (ids: any) => {
    dispatch({ type: SET_PARTIAL_UPDATES_IDS, payload: ids });
  };

  const setSavePlanSuccessCall = (flag: boolean) => {
    dispatch({ type: SET_SAVE_PLAN_SUCCESS_FLAG, payload: flag });
  };

  const getInsightDemoApi = async (tenantId: any, projectId: any) => {
    try {
      const response = await axiosApiInstance.get(
        `https://scheduler-impact-insights.service.${DASHBOARD_URL}.slate.ai/ScheduleImpactInsightsTrigger/secure/${tenantId}/${projectId}`,
        {
          headers: {
            token: 'project',
          },
        }
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
    }
  };

  const productHistoryApiCall = async () => {
    try {
      const response = await axiosApiInstance.get(
        `https://dashboards-api.service.${DASHBOARD_URL}.slate.ai/dashboard/refreshCubeByTenant?widget=PRODUCTIVITY_HISTORY`,
        {
          headers: {
            token: 'token',
          },
        }
      );
    } catch (err) {
      authContext.dispatch(setIsLoading(false));
    }
  };
  return (
    <ProjectPlanContext.Provider
      value={{
        cacheTasks: state.cacheTasks,
        newTasks: state.newTasks,
        ganttAction: state.ganttAction,
        newLinks: state.newLinks,
        currentTask: state.currentTask,
        updatedLinks: state.updatedLinks,
        projectPlan: state.projectPlan,
        deletedTaskIds: state.deletedTaskIds,
        cpCalculation: state.cpCalculation,
        xmlImport: state.xmlImport,
        projectMetaData: state.projectMetaData,
        lookAheadStatus: state.lookAheadStatus,
        currentLookaheadWeek: state.currentLookaheadWeek,
        lookAheadAction: state.lookAheadAction,
        calendar: state.calendar,
        projectUser: state.projectUser,
        newTasksAssignee: state.newTasksAssignee,
        partialUpdateTasks: state.partialUpdateTasks,
        projectScheduleMetadata: state.projectScheduleMetadata,
        updatedTask: state.updatedTask,
        deletedLinkIds: state.deletedLinkIds,
        tenantCompanyList: state.tenantCompanyList,
        currentView: state.currentView,
        currentScale: state.currentScale,
        currentVersionList: state.currentVersionList,
        expandAllButtonFlag: state.expandAllButtonFlag,
        partialUpdatesIds: state.partialUpdatesIds,
        savePlanSuccessCall: state.savePlanSuccessCall,
        calendarList: state.calendarList,
        saveProjectPlan,
        getProjectPlan,
        setNewTasks,
        setUpdatedLinks,
        setGanttAction,
        setCurrentTask,
        refreshProjectPlan,
        deleteTasks,
        setCpCalculation,
        setXmlImport,
        getProjectMetaData,
        editProjectMetaData,
        setLookAheadStatus,
        setCurrentLookaheadWeek,
        setLookAheadAction,
        getProjectPlanCalendar,
        getProjectUsers,
        setNewTasksAssignee,
        getPartialUpdatedTasks,
        bulkUpdateIsDeleteStatus,
        taskStatusUpdateApi,
        getProjectScheduleMetaData,
        updateProjectScheduleMetaData,
        addUpdatedTask,
        addDeletedLink,
        setNewLinks,
        setMultipleNewLinks,
        getChildTask,
        getProjectPlanAllTask,
        getProjectPlanAllTaskAndParse,
        setTaskFromPublishMode,
        clearTaskFromPublishMode,
        uploadFileToS3,
        getRecipeTaskAndAddToNewTask,
        deleteNewTask,
        getProjectPlanByTaskId,
        clearUpdatedTask,
        deleteUpdatedTask,
        updateSerialNumber,
        getTenantCompanies,
        summaryTaskProgress,
        setCurrentView,
        setCurrentScale,
        saveVersion,
        getVersions,
        getVersionDataById,
        deleteVersion,
        getAllTaskForRecipeSelection,
        clearNewTask,
        updateProjectProductivity,
        updateProjectMetaDataImportType,
        setExpandAllButtonFlag,
        setPartialUpdatesIds,
        setSavePlanSuccessCall,
        getInsightDemoApi,
        productHistoryApiCall,
        getAllProjectPlanCalendar,
      }}
    >
      {props.children}
    </ProjectPlanContext.Provider>
  );
};

export default ProjectPlanState;
