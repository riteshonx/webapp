import type { Filter } from "../components/Small/FilterDrawer/FilterDrawer";

export const initialAddDailyLogReducerState = {
  refreshAssignedActivities: false,
  refreshUpcomingActivities: false,
};

export type AddDailyLogReducerState = typeof initialAddDailyLogReducerState;

export type FilterListType = {
  [key: string]: {
    options: Array<Filter>;
  };
};

export type SetRefreshAssignedActivitiesAction = {
  type: "SET_REFRESH_ASSIGNED_ACTIVITIES";
  payload: boolean;
};

export type SetRefreshUpcomingActivitiesAction = {
  type: "SET_REFRESH_UPCOMING_ACTIVITIES";
  payload: boolean;
};

export type AddDailyLogReducerAction =
  | SetRefreshAssignedActivitiesAction
  | SetRefreshUpcomingActivitiesAction;

export default function reducer(
  state: AddDailyLogReducerState,
  action: AddDailyLogReducerAction
): AddDailyLogReducerState {
  switch (action.type) {
    case "SET_REFRESH_ASSIGNED_ACTIVITIES":
      return {
        ...state,
        refreshAssignedActivities: action.payload,
      };
    case "SET_REFRESH_UPCOMING_ACTIVITIES":
      return {
        ...state,
        refreshUpcomingActivities: action.payload,
      };

    default:
      throw new Error();
  }
}
