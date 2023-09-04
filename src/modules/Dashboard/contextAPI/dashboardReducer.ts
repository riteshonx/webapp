import { Action } from "../../../models/context";
import {
  SET_SELECTED_BLOCK_OR_LOT_HEADER,
  SET_SELECTED_PARENT_OR_CHILD_LIST,
} from "./action";

interface DashboardState {
  selectedBlockorLotHeaders: any;
  selectedParentOrChildList: any;
}

export const initialState: DashboardState = {
  selectedBlockorLotHeaders: [],
  selectedParentOrChildList: {
    parent: [],
    child: [],
  },
};

export const dashboardReducer = (
  dashboardState: DashboardState = initialState,
  action: Action
): any => {
  switch (action.type) {
    case SET_SELECTED_BLOCK_OR_LOT_HEADER:
      return {
        ...dashboardState,
        selectedBlockorLotHeaders: action.payload,
      };
    case SET_SELECTED_PARENT_OR_CHILD_LIST:
      return {
        ...dashboardState,
        selectedParentOrChildList: action.payload,
      };

    default:
      return dashboardState;
  }
};
