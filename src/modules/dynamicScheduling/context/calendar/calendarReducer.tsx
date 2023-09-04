import {
  CALENDAR_ERROR,
  CREATE_CALENDAR_TEMPLATE,
  CURRENT_CALENDAR,
  GET_CALENDARS,
  SET_CALENDAR_ACTION,
  SET_HOLIDAY_DETAILS,
} from './type';

export default (state: any, action: any) => {
  switch (action.type) {
    case GET_CALENDARS:
      return {
        ...state,
        calendars: action.payload,
        loading: false,
      };
    case "GET_PROJECT_ASSOCIATED_CALENDAR":
      return {
        ...state,
        associatedCalendar: action.payload,
        loading: false,
      };
      

    case CREATE_CALENDAR_TEMPLATE:
      return {
        ...state,
        calendars: [action.payload, ...state.calendars],
        loading: false,
      };

    case CURRENT_CALENDAR:
      return {
        ...state,
        currentCalendar: action.payload.calendar,
        calendarAction: action.payload.calendarAction,
      };

    case SET_HOLIDAY_DETAILS:
      return {
        ...state,
        holidayList: action.payload,
      };

    case SET_CALENDAR_ACTION:
      return {
        ...state,
        calendarAction: action.payload,
      };

    case CALENDAR_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    default:
      return state;
  }
};
