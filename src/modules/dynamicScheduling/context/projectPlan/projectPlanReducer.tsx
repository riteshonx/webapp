import {
  ADD_MULTIPLE_NEW_LINK,
  ADD_NEW_LINK,
  ADD_UPDATED_LINK,
  ADD_UPDATED_TASK,
  CACHE_TASKS,
  CLEAR_DELETED_LINK_ID,
  CLEAR_NEW_LINK,
  CLEAR_NEW_TASK,
  CLEAR_TASK_FROM_PUBLISH_MODE,
  CLEAR_UPDATED_LINK,
  CLEAR_UPDATED_TASK,
  CREATE_TASK,
  DELETE_NEW_TASK,
  DELETE_TASK_FROM_UPDATED_TASK,
  GET_ALL_PROJECT_USERS,
  GET_CHILD_TASKS,
  GET_PARTIAL_UPDATED_TASK,
  GET_PROJECT_SCHEDULE_META_DATA,
  GET_TENANT_COMPANIES_LIST,
  GET_VERSIONS,
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

export default (state: any, action: any) => {
  switch (action.type) {
    case CREATE_TASK:
      return {
        ...state,
        newTasks: { ...state.newTasks, [action.payload.id]: action.payload },
      };

    case SET_GANTT_ACTION:
      return {
        ...state,
        ganttAction: action.payload,
      };

    case SET_CURRENT_TASK:
      return {
        ...state,
        currentTask: action.payload,
      };
    case SET_PROJECT_PLAN:
      REFRESH_PROJECT_PLAN: return {
        ...state,
        projectPlan: action.payload,
        deletedTaskIds: [],
      };
    case SET_NEW_TASK:
      return {
        ...state,
        newTasks: { ...state.newTasks, [action.payload.id]: action.payload },
      };
    case CLEAR_NEW_TASK:
      return {
        ...state,
        newTasks: {},
      };

    case SET_DELETE_TASK_ID:
      return {
        ...state,
        deletedTaskIds: [...state.deletedTaskIds, ...action.payload],
      };

    case CACHE_TASKS:
      return {
        ...state,
        cacheTasks: action.payload,
      };

    case SET_CP_CALCULATION:
      return {
        ...state,
        cpCalculation: action.payload,
      };

    case SET_XML_IMPORT:
      return {
        ...state,
        xmlImport: action.payload,
      };

    case SET_METADATA:
      return {
        ...state,
        projectMetaData: action.payload,
      };

    case SET_LOOK_AHEAD_STATUS:
      return {
        ...state,
        lookAheadStatus: action.payload,
      };

    case SET_CURRENT_LOOKAHEAD_WEEK:
      return {
        ...state,
        currentLookaheadWeek: action.payload,
      };

    case SET_LOOKAHEAD_ACTION:
      return {
        ...state,
        lookAheadAction: action.payload,
      };

    case SET_PROJECT_PLAN_CALENDAR:
      return {
        ...state,
        calendar: action.payload,
      };
    case SET_PROJECT_PLAN_CALENDAR_LIST:
      return {
        ...state,
        calendarList: action.payload,
      };

    case GET_ALL_PROJECT_USERS:
      return {
        ...state,
        projectUser: action.payload,
      };
    case GET_TENANT_COMPANIES_LIST:
      return {
        ...state,
        tenantCompanyList: action.payload,
      };

    case SET_NEW_TASK_ASSIGNEE:
      return {
        ...state,
        newTasksAssignee: action.payload,
      };
    case GET_PARTIAL_UPDATED_TASK:
      return {
        ...state,
        partialUpdateTasks: action.payload,
      };

    case GET_PROJECT_SCHEDULE_META_DATA:
    case UPDATE_PROJECT_SCHEDULE_META_DATA:
      return {
        ...state,
        projectScheduleMetadata: {
          ...state.projectScheduleMetadata,
          ...action.payload,
        },
      };

    case ADD_UPDATED_TASK:
      return {
        ...state,
        updatedTask: {
          ...state.updatedTask,
          [action.payload.id]: action.payload,
        },
      };

    case DELETE_TASK_FROM_UPDATED_TASK: {
      const tempUpdateTask = { ...state.updatedTask };
      delete tempUpdateTask[action.payload];
      return {
        ...state,
        updatedTask: {
          ...tempUpdateTask,
        },
      };
    }

    case CLEAR_UPDATED_TASK:
      return {
        ...state,
        updatedTask: {},
      };
    case SET_DELETED_LINK_ID:
      return {
        ...state,
        deletedLinkIds: [...state.deletedLinkIds, ...action.payload],
      };
    case CLEAR_DELETED_LINK_ID:
      return {
        ...state,
        deletedLinkIds: [],
      };
    case ADD_NEW_LINK:
      return {
        ...state,
        newLinks: {
          ...state.newLinks,
          [action.payload.link.id]: action.payload.link,
        },
      };
    case ADD_MULTIPLE_NEW_LINK:
      return {
        ...state,
        newLinks: action.payload,
      };
    case CLEAR_NEW_LINK:
      return {
        ...state,
        newLinks: {},
      };
    case ADD_UPDATED_LINK:
      return {
        ...state,
        updatedLinks: {
          ...state.updatedLinks,
          [action.payload.id]: action.payload,
        },
      };
    case CLEAR_UPDATED_LINK:
      return {
        ...state,
        updatedLinks: {},
      };

    case GET_CHILD_TASKS:
      return {
        ...state,
        cacheTasks: new Map([...state.cacheTasks, ...action.payload]),
      };
    case SET_TASK_FROM_PUBLISH_MODE:
      return {
        ...state,
        taskFromPublishMode: action.payload,
      };

    case CLEAR_TASK_FROM_PUBLISH_MODE:
      return {
        ...state,
        taskFromPublishMode: {},
      };

    case DELETE_NEW_TASK: {
      const t = { ...state.newTasks };
      if (state.newTasks[action.payload.taskId]) {
        delete t[action.payload.taskId];
      }
      return {
        ...state,
        newTasks: { ...t },
      };
    }

    case SET_CURRENT_VIEW: {
      return {
        ...state,
        currentView: action.payload,
      };
    }
    case SET_CURRENT_SCALE: {
      return {
        ...state,
        currentScale: action.payload,
      };
    }

    case GET_VERSIONS: {
      return {
        ...state,
        currentVersionList: action.payload,
      };
    }
    case SET_EXPAND_ALL_BUTTON_FLAG: {
      return {
        ...state,
        expandAllButtonFlag: action.payload,
      };
    }

    case SET_PARTIAL_UPDATES_IDS: {
      return {
        ...state,
        partialUpdatesIds: action.payload,
      };
    }
    case SET_SAVE_PLAN_SUCCESS_FLAG: {
      return {
        ...state,
        savePlanSuccessCall: action.payload,
      };
    }
    default:
      return state;
  }
};
