import { Action } from "../../../../../models/context";

export const FORM_FEATURES = "FORM_FEATURES";
export const SELECTED_FEATURE = "SELECTED_FEATURE";
export const SLECTED_FORM_LINKS = "SLECTED_FORM_LINKS";
export const SLECTED_FEATURE_FORM_LIST = "SLECTED_FEATURE_FORM_LIST";
export const CURRENT_FORM_ID = "CURRENT_FORM_ID";
export const RESET = "RESET";
export const DRAFTSELECTEDFORMLINKS = "DRAFTSELECTEDFORMLINKS";
export const FORM_STATUS = "FORM_STATUS";
export const SELECTED_FORM_TO_TASK_LINKS = "SELECTED_FORM_TO_TASK_LINKS";
export const RESET_SELECTED_FORM_TO_TASK_LINKS =
  "RESET_SELECTED_FORM_TO_TASK_LINKS";

export const setFormFeature = (payload: Array<any>): Action => {
  return {
    type: FORM_FEATURES,
    payload,
  };
};

export const setselectedFeature = (payload: any): Action => {
  return {
    type: SELECTED_FEATURE,
    payload,
  };
};

export const setSelectedFormLinks = (payload: Array<any>): Action => {
  return {
    type: SLECTED_FORM_LINKS,
    payload,
  };
};

export const setSelectedFeatureFormList = (payload: Array<any>): Action => {
  return {
    type: SLECTED_FEATURE_FORM_LIST,
    payload,
  };
};

export const setCurrentFormId = (payload: number): Action => {
  return {
    type: CURRENT_FORM_ID,
    payload,
  };
};

export const setResetValue = (payload: any): Action => {
  return {
    type: RESET,
    payload,
  };
};

export const setDraftSelectedFormLinks = (payload: any): Action => {
  return {
    type: DRAFTSELECTEDFORMLINKS,
    payload,
  };
};

export const setFormStatus = (payload: string): Action => {
  return {
    type: FORM_STATUS,
    payload,
  };
};

export const setSelectedFormToTaskLinks = (payload: any): Action => {
  return {
    type: SELECTED_FORM_TO_TASK_LINKS,
    payload,
  };
};

export const resetSelectedFormTaskLinks = (): Action => {
  return {
    type: RESET_SELECTED_FORM_TO_TASK_LINKS,
    payload: [],
  };
};
