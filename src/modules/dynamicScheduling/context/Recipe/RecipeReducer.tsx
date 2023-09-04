import { RECIPE_DETAILS, SET_RECIPE_PLAN, SET_CURRENT_TASK, SET_METADATA, SET_DELETE_TASK_ID, CACHE_TASKS, SET_NAVIGATING_STATUS } from "./type";


export default (state: any, action: any): any => {
    switch(action.type){
        case RECIPE_DETAILS:{
            return {
                ...state,
                recipeDetails: action.payload
            }
        }
        case SET_CURRENT_TASK:
            return {
              ...state,
              currentTask: action.payload,
        };
        case SET_RECIPE_PLAN:
            REFRESH_PROJECT_PLAN: return {
              ...state,
              recipePlan: action.payload,
              deletedTaskIds: [],
        };
        case SET_METADATA:
            return {
              ...state,
              recipeMetaData: action.payload,
            };
        case SET_NAVIGATING_STATUS:
            return {
              ...state,
              navigatingStatus: action.payload,
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
        default: return state
    }
}