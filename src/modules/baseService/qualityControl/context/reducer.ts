type SetFiltersAction = {
  type: "SET_FILTERS";
  payload: Array<any>;
};

export type PunchListAction = SetFiltersAction;

export type PunchListState = {
  filters: Array<any>;
};

export const punchListInitState: PunchListState = {
  filters: [],
};

export const punchListReducer = (
  state: PunchListState,
  action: PunchListAction
) => {
  switch (action.type) {
    case "SET_FILTERS": {
      return { ...state, filters: action.payload };
    }
    default:
      return state;
  }
};
