import { gql } from '@apollo/client';
// import { TaskLibrary } from '../models/taskLibrary';
import { Calendar } from '../models/calendar';
// fetch all calendars
export const GET_CALENDARS_QUERY = gql`query getCalendar($calendarName: String) {
        ${Calendar.modelName}(order_by: {calendarName: asc}, where: { ${Calendar.selector.calendarName} : {_ilike: $calendarName} }) {
          ${Calendar.selector.id}
          ${Calendar.selector.calendarName}
          ${Calendar.selector.tenantId}
          ${Calendar.selector.description}
          ${Calendar.selector.workingDays}
          ${Calendar.selector.workingHours}
          ${Calendar.selector.isEditable}
          ${Calendar.selector.createdAt}
          ${Calendar.selector.createdBy}
          ${Calendar.selector.updatedAt}
          ${Calendar.selector.updatedBy}
          ${Calendar.selector.holidayList}
          ${Calendar.selector.isDefault}
          ${Calendar.selector.tenantAssociation} {
  ${Calendar.selector.user} {
    ${Calendar.selector.firstName}
    ${Calendar.selector.lastName}
  }
}
        }
  }
`;

// To be added

// export const UNIQUE_TASK_LIBRARY = gql`query enumerateTaskLibrary($taskName: String!) {
//   ${TaskLibrary.modelName}(where: {taskName: {_ilike: $taskName}}) {
//     ${TaskLibrary.selector.id}
//     ${TaskLibrary.selector.taskName}
//   }
// }
// `;

// export const UNIQUE_CUSTOM_ID = gql`query enumerateTaskLibrary($customId: String!) {
//   ${TaskLibrary.modelName}(where: {customId: {_eq: $customId}}) {
//     ${TaskLibrary.selector.id}
//     ${TaskLibrary.selector.taskName}
//   }
// }
// `;

// mutation MyMutation {
// insert_calendars(objects: {calendarName: "5 day calendar", description: "first calendar", isEditable: true, workingHours: 8, holidayList: [{holidayName: "May day", year: "2021", date: "01-05-2021"}], workingDays: "{Monday, Tuesday}"}) {
// returning {
// calendarName
// description
// holidayList
// isEditable
// workingDays
// workingHours
// id
// }
// }
// }
export const CREATE_CALENDAR_TEMPLATE_QUERY = gql`
  mutation createCalendar(
    $calendarName: String
    $description: String
    $workingDays: _varchar
    $holidayList: jsonb
    $isEditable: Boolean
    $workingHours: numeric
  ) {
    insert_calendars(
      objects: {
        calendarName: $calendarName
        description: $description
        workingDays: $workingDays
        holidayList: $holidayList
        isEditable: $isEditable
        workingHours: $workingHours
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CALENDAR_TEMPLATE_QUERY = gql`
  mutation updateCalendar(
    $id: Int
    $calendarName: String
    $description: String
    $workingDays: _varchar
    $holidayList: jsonb
    $isEditable: Boolean
    $workingHours: numeric
  ) {
    update_calendars(
      where: { id: { _eq: $id } }
      _set: {
        calendarName: $calendarName
        description: $description
        workingDays: $workingDays
        holidayList: $holidayList
        isEditable: $isEditable
        workingHours: $workingHours
      }
    ) {
      affected_rows
    }
  }
`;

// export const UPDATE_TASK_LIBRARY = gql`
//   mutation enumerateTaskLibrary(
//     $id: Int!
//     $taskName: String
//     $duration: Int
//     $description: String
//     $customId: String
//     $classification: String
//     $customTaskType: String
//     $tag: Int
//   ) {
//     update_taskLibrary(
//       where: { id: { _eq: $id } }
//       _set: {
//         taskName: $taskName
//         tag: $tag
//         duration: $duration
//         description: $description
//         customTaskType: $customTaskType
//         customId: $customId
//         classification: $classification
//       }
//     ) {
//       affected_rows
//     }
//   }
// `;

export const DELETE_CALENDAR_QUERY = gql`
  mutation deleteCalendar($id: Int!) {
    delete_calendars(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const GET_PROJECT_ASSOCIATED_CALENDAR = gql`
  query getCalendarAssociation($calendarId: [Int!]) {
    projectCalendarAssociation(where: {calendarId: {_in: $calendarId}}) {
      calendar {
        calendarName
        description
        isEditable
      }
      calendarId
      id
      isDefault
    }
  }
`;


export const UPDATE_DEFAULT_CALENDAR_QUERY = gql`
  mutation updateDefaultCalendar($calendarId: Int!) {
    update_defaultCalendar_mutation(calendarId: $calendarId) {
      defaultCalendarId     
      message
    }
  }
`;