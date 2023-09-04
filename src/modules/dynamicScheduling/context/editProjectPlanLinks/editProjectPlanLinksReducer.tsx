import {
  DRAFT_SELECTED_FORM_LINKS,
  FORM_FEATURES,
  FORM_STATUS,
  GET_LINKED_FORM,
  RESET,
  SELECT_FEATURE,
  SELECT_FEATURE_FORM_LIST,
  SLECTED_FORM_LINKS,
  UPDATE_LINKED_FORM,
} from './types';
export default (state: any, action: any) => {
  switch (action.type) {
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
    case SLECTED_FORM_LINKS: {
      return {
        ...state,
        selectedFormLinks: action.payload,
      };
    }
    case SELECT_FEATURE_FORM_LIST: {
      return {
        ...state,
        selectedFeatureFormsList: action.payload,
      };
    }

    case RESET: {
      return {
        ...action.payload,
      };
    }
    case DRAFT_SELECTED_FORM_LINKS: {
      return {
        ...state,
        draftSelectedFormLinks: action.payload,
      };
    }
    case FORM_STATUS: {
      return {
        ...state,
        formStatus: action.payload,
      };
    }
    case GET_LINKED_FORM: {
      return {
        ...state,
        currentTaskLinkedForm: [...action.payload],
      };
    }

    case UPDATE_LINKED_FORM: {
      return {
        ...state,
        currentTaskLinkedForm: [
          ...state.currentTaskLinkedForm,
          { ...action.payload },
        ],
      };
    }
    default:
      return state;
  }
};
