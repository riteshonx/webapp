import type {
  SetPaginationAction,
  SetTotalRecordsAction,
  SetListViewFilters,
  SetFormId,
  SetGlobalDailyLogId,
  SetFeatureId,
  SetCustomList,
  SetTriggerFilterFetch,
  SetConstraintList,
  SetListViewFilterList,
  FilterListType,
  SetSelectedLogDate
} from "../reducer/DailyLogReducer";
import type { Filter } from "../components/Small/FilterDrawer/FilterDrawer";

export function setListViewPagination(
  page: number,
  limit: number
): SetPaginationAction {
  return {
    type: "SET_LIST_VIEW_PAGINATION",
    payload: { page, limit },
  };
}

export function setListViewTotalRecordsCount(
  totalRecords: number
): SetTotalRecordsAction {
  return {
    type: "SET_LIST_VIEW_TOTAL_RECORDS",
    payload: totalRecords,
  };
}

export function setListViewFilters(
  groupName: string,
  options: Array<Filter>
): SetListViewFilters {
  return {
    type: "SET_LIST_VIEW_FILTERS",
    payload: { groupName, options },
  };
}

export function setListViewFilterList(
  filterList: FilterListType
): SetListViewFilterList {
  return {
    type: "SET_LIST_VIEW_FILTER_LIST",
    payload: filterList,
  };
}

export function setTriggerFilterFetch(value: boolean): SetTriggerFilterFetch {
  return {
    type: "SET_TRIGGER_FILTER_FETCH",
    payload: value,
  };
}

export function setFormId(dailyLogId: number): SetFormId {
  return {
    type: "SET_FORM_ID",
    payload: dailyLogId,
  };
}

export function setGlobalDailyLogId(
  globalDailyLogId: number
): SetGlobalDailyLogId {
  return {
    type: "SET_GLOBAL_DAILYLOG_ID",
    payload: globalDailyLogId,
  };
}

export function setFeatureId(featureId: number): SetFeatureId {
  return {
    type: "SET_FEATURE_ID",
    payload: featureId,
  };
}

export function setCustomList(customList: Array<any>): SetCustomList {
  return {
    type: "SET_CUSTOM_LIST",
    payload: customList,
  };
}

export function setConstraintList(customList: Array<any>): SetConstraintList {
  return {
    type: "SET_CONSTRAINT_LIST",
    payload: customList,
  };
}

export function setSelectedLogDate(date:any):SetSelectedLogDate{
  return{
    type:"SET_SELECTED_LOG_DATE",
    payload:date
  }
}