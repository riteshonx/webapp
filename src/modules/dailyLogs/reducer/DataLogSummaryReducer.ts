import {fetchInitSummaryState} from "./DataLogSummaryReducerActions";
import {setSummaryData,setSummaryIsLoading,setIsError} from "./DataLogSummaryReducerActions";

export interface Action{
    payload: any,
    type : string
}

export default function fetchDataSummaryReducer(state:any =  fetchInitSummaryState, action: Action) {
    switch (action.type) {
      case "INIT_FETCH": {
        return { ...state, isLoading: true, isError: false };
      }
      case "FETCH_COMPLETED": {
        return {
            ...state,
          data:action.payload,
          isLoading: false,
          isError: false,
          hasDataAfterFetch: action.payload.length ? true : false
        };
      }
      case "FETCH_ERROR": {
        return { ...state, isLoading: false, isError: true };
      }
      default:
        return state;
    }
  }
  