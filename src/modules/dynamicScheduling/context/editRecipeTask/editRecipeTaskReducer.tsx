import {
  CLEAR_EDIT_RECIPE_TASK_STATE,
  CLEAR_RECIPE_TASK_STATE,
  DELETE_RECIPE_MATERIAL,
  GET_ALL_TENANT_MATERIAL,
  GET_RECIPE_TASK_MATERIAL,
  UPDATE_PARENT_TASKS,
  UPDATE_RECIPE_MATERIAL,
} from './types';

export default (state: any, action: any) => {
  switch (action.type) {
    case CLEAR_RECIPE_TASK_STATE:
      return {
        parentTasks: [],
      };

    case UPDATE_PARENT_TASKS: {
      return {
        ...state,
        parentTasks: action.payload,
      };
    }

    case GET_ALL_TENANT_MATERIAL: {
      return {
        ...state,
        tenantMaterials: action.payload,
      };
    }
    case GET_RECIPE_TASK_MATERIAL: {
      return {
        ...state,
        currentTaskMaterial: action.payload,
      };
    }

    case UPDATE_RECIPE_MATERIAL: {
      return {
        ...state,
        currentTaskMaterial: state.currentTaskMaterial.map((material: any) =>
          material.id === action.payload.material.id
            ? action.payload.material
            : material
        ),
      };
    }

    case DELETE_RECIPE_MATERIAL:
      return {
        ...state,
        currentTaskMaterial: state.currentTaskMaterial.filter(
          (material: any) => action.payload.id !== material.id
        ),
      };
    case CLEAR_EDIT_RECIPE_TASK_STATE: {
      return {
        ...state,
        currentTaskMaterial: [],
        tenantMaterials: null,
        parentTasks: [],
      };
    }
    default:
      return {
        ...state,
      };
  }
};
