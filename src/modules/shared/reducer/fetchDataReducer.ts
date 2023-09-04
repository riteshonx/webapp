export const fetchInitState = {
  data: [],
  isLoading: true,
  isError: false,
  hasDataAfterFetch: true, //we assume initially that our api will have data
};
type AppState = typeof fetchInitState;
type Action =
  | { type: "INIT_FETCH" }
  | { type: "FETCH_COMPLETED"; payload: any }
  | { type: "FETCH_ERROR" };

export default function fetchDataReducer(state: AppState, action: Action) {
  switch (action.type) {
    case "INIT_FETCH": {
      return { ...state, isLoading: true, isError: false };
    }
    case "FETCH_COMPLETED": {
      return {
        data: action.payload,
        isLoading: false,
        isError: false,
        hasDataAfterFetch: action.payload.length ? true : false,
      };
    }
    case "FETCH_ERROR": {
      return { ...state, isLoading: false, isError: true };
    }
    default:
      return state;
  }
}
