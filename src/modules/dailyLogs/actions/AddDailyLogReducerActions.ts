import type {
  SetRefreshAssignedActivitiesAction,
  SetRefreshUpcomingActivitiesAction,
} from "../reducer/AddDailyLogReducer";

export function setRefreshUpcomingActivities(
  shouldRefresh: boolean
): SetRefreshUpcomingActivitiesAction {
  return {
    type: "SET_REFRESH_UPCOMING_ACTIVITIES",
    payload: shouldRefresh,
  };
}

export function setRefreshAssignedActivities(
  shouldRefresh: boolean
): SetRefreshAssignedActivitiesAction {
  return {
    type: "SET_REFRESH_ASSIGNED_ACTIVITIES",
    payload: shouldRefresh,
  };
}
