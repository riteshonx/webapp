import {
  CANCEL_STEP_DATA,
  DELETE_STEP,
  EDIT_STEP_NAME,
  OUTCOME_DATA,
  SET_WORKFLOW_NAME,
  STEPS_DATA,
  UPDATE_STEP_POSITION,
  SET_WORKFLOW_TEMPLATE_CONFIG_FROM_DB,
  SET_UPDATES_DONE,
  UNMOUNT_WORKFLOW_DATA,
  DELETE_OUTCOME,
  UPDATE_OUTCOME_DATA,
} from "./action";

export const initialState = {
  currentStep: 1,
  stepsData: [],
  outcomeData: [],
  workflowDetails: undefined,
  updatesDone: false,
  enableVersioning: false,
  workflowTemplateConfigFromDB: [],
};

export const workflowReducer = (state: any, action: any): any => {
  switch (action.type) {
    case SET_WORKFLOW_TEMPLATE_CONFIG_FROM_DB:
      return {
        ...state,
        workflowTemplateConfigFromDB: action.payload,
      };
    case SET_WORKFLOW_NAME:
      return {
        ...state,
        workflowDetails: action.payload,
      };
    case STEPS_DATA:
      return {
        ...state,
        currentStep: state.currentStep + 1,
        stepsData: [...state.stepsData, action.payload],
      };
    case EDIT_STEP_NAME:
      return {
        ...state,
        stepsData: action.payload,
        enableVersioning: true,
        updatesDone: true,
      };
    case OUTCOME_DATA:
      return {
        ...state,
        outcomeData: [...state.outcomeData, ...action.payload],
      };
    case CANCEL_STEP_DATA:
      return {
        ...state,
        stepsData: action.payload.stepsData,
        outcomeData: action.payload.outcomeData,
      };
    case UPDATE_STEP_POSITION:
      return {
        ...state,
        stepsData: action.payload,
        updatesDone: true,
      };
    case DELETE_STEP:
      return {
        ...state,
        stepsData: action.payload.stepsData,
        outcomeData: action.payload.outcomeData,
        enableVersioning: true,
        updatesDone: true,
      };
    case SET_UPDATES_DONE:
      return {
        ...state,
        enableVersioning: action.payload.versioning,
        updatesDone: action.payload.updates,
      };

    case UPDATE_OUTCOME_DATA:
      return {
        ...state,
        outcomeData: action.payload.outcomeData,
        enableVersioning: true,
        updatesDone: true,
      };

    case DELETE_OUTCOME:
      return {
        ...state,
        outcomeData: action.payload.outcomeData,
        enableVersioning: true,
        updatesDone: true,
      };
    case UNMOUNT_WORKFLOW_DATA:
      return {
        currentStep: 1,
        workflowId: 1,
        stepsData: [],
        outcomeData: [],
        workflowDetails: [],
        updatesDone: false,
        enableVersioning: false,
      };
    default:
      return state;
  }
};
