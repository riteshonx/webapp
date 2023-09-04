export const SET_WORKFLOW_NAME = "SET_WORKFLOW_NAME";
export const STEPS_DATA = "STEPS_DATA";
export const OUTCOME_DATA = "OUTCOMES_DATA";
export const SET_WORKFLOW_TEMPLATE_CONFIG_FROM_DB =
  "SET_WORKFLOW_TEMPLATE_CONFIG_FROM_DB";
export const CANCEL_STEP_DATA = "CANCEL_STEP_DATA";
export const UPDATE_STEP_POSITION = "UPDATE_STEP_POSITION";
export const DELETE_STEP = "DELETE_STEP";
export const EDIT_STEP_NAME = "EDIT_STEP_NAME";
export const SET_UPDATES_DONE = "SET_UPDATES_DONE";
export const UNMOUNT_WORKFLOW_DATA = "UNMOUNT_WORKFLOW_DATA";
export const DELETE_OUTCOME = "DELETE_OUTCOME";
export const UPDATE_OUTCOME_DATA = "UPDATE_OUTCOME_DATA";

export const setWorkFlowName = (payload: any) => {
  return {
    type: SET_WORKFLOW_NAME,
    payload,
  };
};

export const setStepData = (payload: any) => {
  return {
    type: STEPS_DATA,
    payload,
  };
};

export const setStepName = (payload: any) => {
  return {
    type: EDIT_STEP_NAME,
    payload,
  };
};

export const updateOutcomeData = (payload: any) => {
  return {
    type: UPDATE_OUTCOME_DATA,
    payload,
  };
};

export const deleteOutcome = (payload: any) => {
  return {
    type: DELETE_OUTCOME,
    payload,
  };
};

export const setOutcomeData = (payload: any) => {
  return {
    type: OUTCOME_DATA,
    payload,
  };
};

export const cancelStepData = (payload: any) => {
  return {
    type: CANCEL_STEP_DATA,
    payload,
  };
};

export const updateStepPositionOnDrag = (payload: any) => {
  return {
    type: UPDATE_STEP_POSITION,
    payload,
  };
};

export const deleteStep = (payload: any) => {
  return {
    type: DELETE_STEP,
    payload,
  };
};

export const setWorkflowTemplateConfigFromDB = (payload: any) => {
  return {
    type: SET_WORKFLOW_TEMPLATE_CONFIG_FROM_DB,
    payload,
  };
};

export const setUpdatesDone = (payload: any) => {
  return {
    type: SET_UPDATES_DONE,
    payload,
  };
};

export const unmountWorkflowData = () => {
  return {
    type: SET_UPDATES_DONE,
  };
};
