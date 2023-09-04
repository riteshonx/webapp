import { ISLOADING } from 'src/modules/root/context/authentication/action';
import {
  DRAFT_SELECTED_FORM_LINKS,
  FORM_FEATURES,
  GET_LINKED_FORM,
  SELECT_FEATURE,
  SELECT_FEATURE_FORM_LIST,
} from '../editProjectPlanLinks/types';
import {
  GET_ALL_PROJECT_USERS,
  GET_PROJECT_SCHEDULE_META_DATA,
} from '../projectPlan/types';
import {
  CLEAR_UPLOADED_FILES,
  COMMON_CLEAR_EDIT_PROJECT_PLAN_STATE,
  COMMON_CLEAR_PROJECT_MATERIALS,
  COMMON_CLEAR_PROJECT_TASK_MATERIALS,
  COMMON_DELETE_PROJECT_TASK_MATERIAL,
  COMMON_GET_CUSTOM_LIST,
  COMMON_GET_PROJECT_MATERIALS,
  COMMON_GET_PROJECT_TASK_MATERIALS,
  COMMON_GET_RELATED_TASKS,
  COMMON_SET_CURRENT_TASK,
  COMMON_SET_PROJECT_TOKEN,
  COMMON_SET_TASK_CONSTRAINTS,
  COMMON_SET_TASK_VARIANCES,
  COMMON_UPDATE_PARENT_TASKS,
  COMMON_UPDATE_PROJECT_TASK_MATERIAL,
  GET_ATTACHMENT_FILES,
  SET_UPLOADED_FILES,
} from './types';

export default (state: any, action: any) => {
  switch (action.type) {
    case COMMON_UPDATE_PARENT_TASKS: {
      return {
        ...state,
        parentTasks: action.payload,
      };
    }
    case COMMON_SET_TASK_CONSTRAINTS:
      return {
        ...state,
        currentTaskConstraint: action.payload,
      };
    case COMMON_SET_TASK_VARIANCES:
      return {
        ...state,
        currentTaskVariances: action.payload,
      };
    case COMMON_GET_PROJECT_MATERIALS:
    case COMMON_CLEAR_PROJECT_MATERIALS:
      return {
        ...state,
        projectMaterials: action.payload,
      };

    case COMMON_GET_PROJECT_TASK_MATERIALS:
    case COMMON_CLEAR_PROJECT_TASK_MATERIALS:
      return {
        ...state,
        currentTaskMaterial: action.payload,
      };

    case COMMON_DELETE_PROJECT_TASK_MATERIAL:
      return {
        ...state,
        currentTaskMaterial: state.currentTaskMaterial.filter(
          (material: any) => action.payload.id !== material.id
        ),
      };

    case COMMON_UPDATE_PROJECT_TASK_MATERIAL:
      return {
        ...state,
        currentTaskMaterial: state.currentTaskMaterial.map((material: any) =>
          material.id === action.payload.material.id
            ? action.payload.material
            : material
        ),
      };

    case COMMON_GET_CUSTOM_LIST:
      return {
        ...state,
        categoryList: action.payload,
      };

    case COMMON_CLEAR_EDIT_PROJECT_PLAN_STATE:
      return {
        ...state,
        parentTasks: [],
        currentTaskConstraint: [],
        currentTaskVariances: [],
        projectMaterials: [],
        currentTaskMaterial: [],
        categoryList: [],
      };

    case COMMON_GET_RELATED_TASKS:
      return {
        ...state,
        relatedTasks: action.payload,
      };
    case COMMON_SET_CURRENT_TASK:
      return {
        ...state,
        currentTask: action.payload,
      };
    case COMMON_SET_PROJECT_TOKEN:
      return {
        ...state,
        projectTokens: {
          ...state.projectTokens,
          [action.payload.projectId]: action.payload.token,
        },
      };
    case GET_ALL_PROJECT_USERS:
      return {
        ...state,
        projectUser: action.payload,
      };
    case FORM_FEATURES: {
      return {
        ...state,
        formFeatures: action.payload,
      };
    }
    case SELECT_FEATURE: {
      return {
        ...state,
        selectedFeature: action.payload,
      };
    }
    case GET_PROJECT_SCHEDULE_META_DATA: {
      return {
        ...state,
        projectMetaData: action.payload,
      };
    }
    case SELECT_FEATURE_FORM_LIST: {
      return {
        ...state,
        selectedFeatureFormsList: action.payload,
      };
    }
    case DRAFT_SELECTED_FORM_LINKS: {
      return {
        ...state,
        draftSelectedFormLinks: action.payload,
      };
    }

    case GET_LINKED_FORM: {
      return {
        ...state,
        currentTaskLinkedForm: [...action.payload],
      };
    }
    case GET_ATTACHMENT_FILES: {
      return {
        ...state,
        attachedFiles: action.payload,
      };
    }

    case SET_UPLOADED_FILES: {
      return {
        ...state,
        uploadedFiles: [...state.uploadedFiles, action.payload],
      };
    }
    case CLEAR_UPLOADED_FILES: {
      return {
        ...state,
        uploadedFiles: [],
      };
    }
    case ISLOADING: {
      return {
        ...state,
        isLoading: action.payload,
      };
    }

    default:
      return {
        ...state,
      };
  }
};
