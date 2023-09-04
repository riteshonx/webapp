import React, { useContext, useReducer } from 'react';
import { client } from '../../../../services/graphql';
import { CalendarRoles } from '../../../../utils/role';
import { setIsLoading } from '../../../root/context/authentication/action';
import { stateContext } from '../../../root/context/authentication/authContext';
import Notification, {
  AlertTypes,
} from '../../../shared/components/Toaster/Toaster';
import { CalendarModel } from '../../libraries/grqphql/models/calendar';
import {
  CREATE_CALENDAR_TEMPLATE_QUERY,
  DELETE_CALENDAR_QUERY,
  GET_CALENDARS_QUERY,
  UPDATE_CALENDAR_TEMPLATE_QUERY,
  GET_PROJECT_ASSOCIATED_CALENDAR,
  UPDATE_DEFAULT_CALENDAR_QUERY
} from '../../libraries/grqphql/queries/calendar';
import CalendarContext from './calendarContext';
import calendarReducer from './calendarReducer';
import {
  CALENDAR_ERROR,
  CURRENT_CALENDAR,
  GET_CALENDARS,
  SET_CALENDAR_ACTION,
  SET_HOLIDAY_DETAILS,
} from './type';

const CalendarState = (props: any) => {
  const initialState = {
    calendars: [],
    currentCalendar: null,
    filtered: null,
    calendarAction: 'create',
    error: null,
    holidayList: null,
    associatedCalendar: []
  };

  const [state, dispatch] = useReducer(calendarReducer, initialState);
  const globalContext: any = useContext(stateContext);
  // Create Calendar

  const createCalendar = async (Calendar: any) => {
    try {
      const res = await client.mutate({
        mutation: CREATE_CALENDAR_TEMPLATE_QUERY,
        variables: Calendar,
        context: { role: CalendarRoles.createTenantCalendar },
      });
      getCalendars();
      //  dispatch({ type: CREATE_CALENDAR_TEMPLATE, payload: res });
      Notification.sendNotification(
        'Created  successfully',
        AlertTypes.success
      );
    } catch (error) {
      dispatch({
        type: CALENDAR_ERROR,
        payload: error.message,
      });
    }
  };

  // Update Calendar
  const updateCalendar = async (Calendar: any) => {
    try {
      const res = await client.mutate({
        mutation: UPDATE_CALENDAR_TEMPLATE_QUERY,
        variables: Calendar,
        context: { role: CalendarRoles.updateTenantCalendar },
      });
      getCalendars();
      // dispatch({ type: CREATE_CALENDAR_TEMPLATE, payload: res });
      Notification.sendNotification(
        'Updated  successfully',
        AlertTypes.success
      );
    } catch (error) {
      dispatch({
        type: CALENDAR_ERROR,
        payload: error.message,
      });
    }
  };

  // Make CalendarDefault
  const makeCalendarDefault = async (calendarId: any) => {
    try {
      const res = await client.mutate({
        mutation:   UPDATE_DEFAULT_CALENDAR_QUERY,
        variables: {calendarId: calendarId},
        context: { role: CalendarRoles.updateTenantCalendar },
      });
      
      getCalendars();
      Notification.sendNotification(
        'Updated successfully',
        AlertTypes.success
      );
    } catch (error) {
      dispatch({
        type: CALENDAR_ERROR,
        payload: error.message,
      });
    }
  };

  // GET Calendar
  const getCalendars = async (searchText: any = '') => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res = await client.query({
        query: GET_CALENDARS_QUERY,
        fetchPolicy: 'network-only',
        variables: { calendarName: `%${searchText}%` || null },
        context: { role: CalendarRoles.viewTenantCalendar },
      });
      globalContext.dispatch(setIsLoading(false));
      dispatch({ type: GET_CALENDARS, payload: res.data.calendars });
    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
      dispatch({
        type: CALENDAR_ERROR,
        payload: error.message,
      });
    }
  };

  const getProjectCalendar = async (calendarId: any = []) => {
    try {
      globalContext.dispatch(setIsLoading(true));
      const res: any = await client.query({
        query: GET_PROJECT_ASSOCIATED_CALENDAR,
        fetchPolicy: 'network-only',
        variables: { calendarId: calendarId  },
        context: { role: CalendarRoles.viewTenantCalendar },
      });
      globalContext.dispatch(setIsLoading(false));
      dispatch({ type: "GET_PROJECT_ASSOCIATED_CALENDAR", payload: res.data.projectCalendarAssociation });
    } catch (error) {
      globalContext.dispatch(setIsLoading(false));
    }
  };

  // Set current calendars
  const setCurrentCalendar = (calendar: CalendarModel) => {
    dispatch({ type: CURRENT_CALENDAR, payload: { calendar } });
  };

  // Delete calendar
  const deleteCalendar = async (id: any) => {
    try {
      const res = await client.mutate({
        mutation: DELETE_CALENDAR_QUERY,
        variables: { id },
        context: { role: CalendarRoles.deleteTenantCalendar },
      });
      getCalendars();
      // dispatch({ type: GET_CALENDARS, payload: res });
      Notification.sendNotification(
        'Deleted  successfully',
        AlertTypes.success
      );
    } catch (error) {
      dispatch({
        type: CALENDAR_ERROR,
        payload: error.message,
      });
    }
  };

  const getHolidayListByYear = (year: string) => {
    let t = [];
    if(state.currentCalendar && state.currentCalendar.holidayList) {
      t = state.currentCalendar.holidayList.filter(
        (holiday: any) => holiday.year == year
      );
    }
    t = t.map((h: any) => ({ ...h, name: h.holidayName }));
    return t;
  };

  const setHolidayList = (holidayList: any) => {
    dispatch({
      type: SET_HOLIDAY_DETAILS,
      payload: Array.from(new Set(holidayList)),
    });
  };

  const setCalendarAction = (action: string) => {
    dispatch({ type: SET_CALENDAR_ACTION, payload: action });
  };
  return (
    <CalendarContext.Provider
      value={{
        calendars: state.calendars,
        currentCalendar: state.currentCalendar,
        filtered: state.filtered,
        error: state.error,
        calendarAction: state.calendarAction,
        holidayList: state.holidayList,
        associatedCalendar: state. associatedCalendar,
        getCalendars,
        getProjectCalendar,
        makeCalendarDefault,
        createCalendar,
        setCurrentCalendar,
        deleteCalendar,
        updateCalendar,
        getHolidayListByYear,
        setHolidayList,
        setCalendarAction,
      }}
    >
      {props.children}
    </CalendarContext.Provider>
  );
};

export default CalendarState;
