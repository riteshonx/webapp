import { Action } from "../../../../../models/context";
import {
  FORM_FEATURES,
  SELECTED_FEATURE,
  SLECTED_FORM_LINKS,
  CURRENT_FORM_ID,
  SLECTED_FEATURE_FORM_LIST,
  RESET,
  DRAFTSELECTEDFORMLINKS,
  FORM_STATUS,
  SELECTED_FORM_TO_TASK_LINKS,
  RESET_SELECTED_FORM_TO_TASK_LINKS,
} from "./linkAction";

export const LinkInitailState = {
  formStatus: "",
  formToFormLinks: {
    formFeatures: [],
    selectedFeature: null,
    selectedFormLinks: [],
    selectedFeatureFormsList: [],
    draftSelectedFormLinks: [],
    currentFormId: -1,
  },
  formToTaskLinks: {
    selectedLinks: [],
  },
};

export const LinkReducer = (
  state: any = LinkInitailState,
  action: Action
): any => {
  switch (action.type) {
    case FORM_FEATURES: {
      return {
        ...state,
        formToFormLinks: {
          ...state.formToFormLinks,
          formFeatures: action.payload,
        },
      };
    }
    case SELECTED_FEATURE: {
      return {
        ...state,
        formToFormLinks: {
          ...state.formToFormLinks,
          selectedFeature: action.payload,
        },
      };
    }
    case SLECTED_FORM_LINKS: {
      return {
        ...state,
        formToFormLinks: {
          ...state.formToFormLinks,
          selectedFormLinks: action.payload,
        },
      };
    }
    case SLECTED_FEATURE_FORM_LIST: {
      return {
        ...state,
        formToFormLinks: {
          ...state.formToFormLinks,
          selectedFeatureFormsList: action.payload,
        },
      };
    }
    case CURRENT_FORM_ID: {
      return {
        ...state,
        formToFormLinks: {
          ...state.formToFormLinks,
          currentFormId: action.payload,
        },
      };
    }
    case RESET: {
      return {
        ...action.payload,
      };
    }
    case DRAFTSELECTEDFORMLINKS: {
      return {
        ...state,
        formToFormLinks: {
          ...state.formToFormLinks,
          draftSelectedFormLinks: action.payload,
        },
      };
    }
    case FORM_STATUS: {
      return {
        ...state,
        formStatus: action.payload,
      };
    }
    case SELECTED_FORM_TO_TASK_LINKS: {
      return {
        ...state,
        formToTaskLinks: {
          ...state.formToTaskLinks,
          selectedLinks: action.payload,
        },
      };
    }

    case RESET_SELECTED_FORM_TO_TASK_LINKS: {
      return {
        ...state,
        formToTaskLinks: {
          ...state.formToTaskLinks,
          selectedLinks: action.payload,
        },
      };
    }

    default:
      return state;
  }
};
