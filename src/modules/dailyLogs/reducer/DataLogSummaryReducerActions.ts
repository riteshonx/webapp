export const fetchInitSummaryState = {
    data: [],
    isLoading: true,
    isError: false,
    hasDataAfterFetch: true
  };

  export function setSummaryData(payload: any) {
    return {
      type: "FETCH_COMPLETED",
      payload,
    };
  }

  export function setSummaryIsLoading(data:any) {
    return {
      type: "INIT_FETCH",
    };
  }

  export function setIsError(data:any) {
    return {
      type: "FETCH_ERROR",
    };
  }
  