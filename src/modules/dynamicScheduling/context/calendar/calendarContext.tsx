import { createContext } from 'react';

type CalendarContextInterface = {
  calendars: any[];
  currentCalendar: any;
  calendarAction: string;
  holidayList: any;
  error: any;
  filtered: any[];
  associatedCalendar: any[];
  createCalendar: (calendar: any) => any;
  updateCalendar: (calendar: any) => any;
  deleteCalendar: (id: string) => any;
  getCalendars: (searchText?: string) => any;
  //getCalendar: (id: string) => any;
  setCurrentCalendar: (calendar: any) => any;
  getHolidayListByYear: (year: string) => any;
  setHolidayList: (holiday: any) => any;
  setCalendarAction: (action: any) => any;
  getProjectCalendar: (calendarId: any) => any;
  makeCalendarDefault: (calendarId: any) => any;
};

const calendarContextontextDefaultValues: CalendarContextInterface = {
  calendars: [],
  currentCalendar: null,
  calendarAction: '',
  error: null,
  filtered: [],
  holidayList: null,
  associatedCalendar: [],
  createCalendar: () => {
    // do nothing.
  },
  updateCalendar: () => {
    // do nothing.
  },
  deleteCalendar: () => {
    // do nothing.
  },
  getCalendars: () => {
    // do nothing.
  },

  getProjectCalendar: () => {
     // do nothing.
  },
  setCurrentCalendar: () => {
    // do nothing.
  },

  getHolidayListByYear: () => {
    // do nothing.
  },
  setHolidayList: () => {
    // do nothing.
  },

  setCalendarAction: () => {
    // do nothing.
  },
  makeCalendarDefault: () => {
     // do nothing.
  }
};

const calendarContext = createContext<CalendarContextInterface>(
  calendarContextontextDefaultValues
);

export default calendarContext;
