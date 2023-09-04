import {
  CLEAR_EDIT_PROJECT_PLAN_STATE,
  CLEAR_PROJECT_MATERIALS,
  CLEAR_PROJECT_TASK_MATERIALS,
  DELETE_PROJECT_TASK_MATERIAL,
  GET_CUSTOM_LIST,
  GET_PROJECT_MATERIALS,
  GET_PROJECT_TASK_MATERIALS,
  GET_RELATED_TASKS,
  GET_TASK_EQUIPMENT,
  GET_TASK_LABOUR,
  SET_TASK_CONSTRAINTS,
  SET_TASK_VARIANCES,
  UPDATE_PARENT_TASKS,
  UPDATE_PROJECT_TASK_MATERIAL,
} from './types';

export default (state: any, action: any) => {
  switch (action.type) {
    case UPDATE_PARENT_TASKS: {
      return {
        ...state,
        parentTasks: action.payload,
      };
    }
    case SET_TASK_CONSTRAINTS:
      return {
        ...state,
        currentTaskConstraint: action.payload,
      };
    case SET_TASK_VARIANCES:
      return {
        ...state,
        currentTaskVariances: action.payload,
      };
    case GET_PROJECT_MATERIALS:
    case CLEAR_PROJECT_MATERIALS:
      return {
        ...state,
        projectMaterials: action.payload,
      };

    case GET_PROJECT_TASK_MATERIALS:
    case CLEAR_PROJECT_TASK_MATERIALS:
      return {
        ...state,
        currentTaskMaterial: action.payload,
      };

    case DELETE_PROJECT_TASK_MATERIAL:
      return {
        ...state,
        currentTaskMaterial: state.currentTaskMaterial.filter(
          (material: any) => action.payload.id !== material.id
        ),
      };

    case UPDATE_PROJECT_TASK_MATERIAL:
      return {
        ...state,
        currentTaskMaterial: state.currentTaskMaterial.map((material: any) =>
          material.id === action.payload.material.id
            ? action.payload.material
            : material
        ),
      };

    case GET_CUSTOM_LIST:
      return {
        ...state,
        categoryList: action.payload,
      };

    case CLEAR_EDIT_PROJECT_PLAN_STATE:
      return {
        ...state,
        parentTasks: [],
        currentTaskConstraint: [],
        currentTaskVariances: [],
        projectMaterials: [],
        currentTaskMaterial: [],
        categoryList: [],
      };

    case GET_RELATED_TASKS:
      return {
        ...state,
        relatedTasks: action.payload,
      };
    case GET_TASK_EQUIPMENT: {
      return {
        ...state,
        currentTaskEquipment: action.payload,
      };
    }
    case GET_TASK_LABOUR: {
      return {
        ...state,
        currentTaskLabour: action.payload,
      };
    }
    default:
      return {
        ...state,
      };
  }
};
