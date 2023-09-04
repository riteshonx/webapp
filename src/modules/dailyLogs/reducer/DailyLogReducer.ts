import type { Filter } from "../components/Small/FilterDrawer/FilterDrawer";

//type DailyLogReducerState = typeof initialDailyLogReducerState;

export type FilterListType = {
  [key: string]: {
    options: Array<Filter>;
  };
};

export interface DailyLogReducerState {
  listView: {
    pagination: { page: number; limit: number };
    totalRecords: number;
    filters: {
      filterList: FilterListType;
      triggerFetch: boolean;
    };
  };
  formId: number;
  globalDailyLogId: number;
  featureId: number;
  customList: Array<any>;
  constraintList: Array<any>;
  selectedLogDate:any;
}

export type SetPaginationAction = {
  type: "SET_LIST_VIEW_PAGINATION";
  payload: { page: number; limit: number };
};

export type SetTotalRecordsAction = {
  type: "SET_LIST_VIEW_TOTAL_RECORDS";
  payload: number;
};

export type SetListViewFilters = {
  type: "SET_LIST_VIEW_FILTERS";
  payload: { groupName: string; options: Array<Filter> };
};

export type SetListViewFilterList = {
  type: "SET_LIST_VIEW_FILTER_LIST";
  payload: FilterListType;
};

export type SetFormId = {
  type: "SET_FORM_ID";
  payload: number;
};

export type SetGlobalDailyLogId = {
  type: "SET_GLOBAL_DAILYLOG_ID";
  payload: number;
};

export type SetFeatureId = {
  type: "SET_FEATURE_ID";
  payload: number;
};

export type SetCustomList = {
  type: "SET_CUSTOM_LIST";
  payload: Array<any>;
};

export type SetConstraintList = {
  type: "SET_CONSTRAINT_LIST";
  payload: Array<any>;
};

export type SetTriggerFilterFetch = {
  type: "SET_TRIGGER_FILTER_FETCH";
  payload: boolean;
};

export type SetSelectedLogDate={
  type:"SET_SELECTED_LOG_DATE";
  payload:any;
}
export type DailyLogReducerAction =
  | SetPaginationAction
  | SetTotalRecordsAction
  | SetListViewFilters
  | SetListViewFilterList
  | SetFormId
  | SetGlobalDailyLogId
  | SetFeatureId
  | SetCustomList
  | SetTriggerFilterFetch
  | SetConstraintList
  | SetSelectedLogDate
    

export default function reducer(
  state: DailyLogReducerState,
  action: DailyLogReducerAction
): DailyLogReducerState {
  switch (action.type) {
    case "SET_LIST_VIEW_PAGINATION":
      return {
        ...state,
        listView: { ...state.listView, pagination: action.payload },
      };
    case "SET_LIST_VIEW_TOTAL_RECORDS":
      return {
        ...state,
        listView: { ...state.listView, totalRecords: action.payload },
      };
    case "SET_LIST_VIEW_FILTERS":
      return {
        ...state,
        listView: {
          ...state.listView,
          filters: {
            ...state.listView.filters,
            filterList: {
              ...state.listView.filters.filterList,
              [action.payload.groupName]: { options: action.payload.options },
            },
          },
        },
      };

    case "SET_LIST_VIEW_FILTER_LIST":
      return {
        ...state,
        listView: {
          ...state.listView,
          filters: {
            ...state.listView.filters,
            filterList: action.payload,
          },
        },
      };

    case "SET_TRIGGER_FILTER_FETCH": {
      return {
        ...state,
        listView: {
          ...state.listView,
          filters: {
            ...state.listView.filters,
            triggerFetch: action.payload,
          },
        },
      };
    }
    case "SET_FORM_ID":
      return {
        ...state,
        formId: action.payload,
      };
    case "SET_GLOBAL_DAILYLOG_ID":
      return {
        ...state,
        globalDailyLogId: action.payload,
      };
    case "SET_FEATURE_ID":
      return {
        ...state,
        featureId: action.payload,
      };
    case "SET_CUSTOM_LIST":
      return {
        ...state,
        customList: action.payload,
      };
    case "SET_CONSTRAINT_LIST":
      return {
        ...state,
        constraintList: action.payload,
      };
    case "SET_SELECTED_LOG_DATE":
      return{
        ...state,
        selectedLogDate:action.payload,
      };
    default:
      throw new Error();
  }
}
