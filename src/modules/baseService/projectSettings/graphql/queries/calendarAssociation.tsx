import { gql } from '@apollo/client';

export const GET_PROJECT_ASSOCIATED_CALENDAR = gql`
  query getCalendarAssociation($projectId: Int) {
    projectCalendarAssociation(where: { projectId: { _eq: $projectId } }) {
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

export const GET_CALENDAR = gql`
  query getCalendar($calendarName: String) {
    calendars(
      order_by: { calendarName: asc }
      where: { calendarName: { _ilike: $calendarName } }
    ) {
      id
      calendarName
      tenantId
      description
      workingDays
      workingHours
      isEditable
      createdAt
      createdBy
      updatedAt
      updatedBy
      holidayList
      externalCalendar
    }
  }
`;

export const SET_PROJECT_ASSOCIATED = gql`
  mutation addAssociateCalendar($calendarId: Int, $projectId: Int) {
    insert_projectCalendarAssociation(
      objects: { calendarId: $calendarId, projectId: $projectId }
    ) {
      returning {
        calendarId
        id
        isDefault
        projectId
      }
    }
  }
`;

export const DELETE_ASSOCIATE_CALENDAR = gql`
  mutation deleteAssociateCalendar($id: Int) {
    delete_projectCalendarAssociation(where: { id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_PROJECT_SCHEDULE_METADATA = gql`
  mutation updateProjectScheduleMetadata($projectId: Int) {
    update_projectScheduleMetadata(
      where: { projectId: { _eq: $projectId } }
      _set: { defaultCalendar: null }
    ) {
      returning {
        defaultCalendar
      }
    }
  }
`;

export const UPDATE_PROJECT_TASK = gql`
  mutation updateProjectTask($calendarId: Int, $projectId: Int) {
    update_projectTask(
      where: { projectId: { _eq: $projectId }, calendarId: { _is_null: false } }
      _set: { calendarId: null }
    ) {
      returning {
        calendarId
      }
    }
  }
`;

export const GET_PROJECT_PLAN_CALENDAR = gql`
  query getProjectPlanCalendar {
    projectCalendarAssociation(where: {}) {
      calendar {
        calendarName
        workingHours
        workingDays
        holidayList
      }
      calendarId
      id
      isDefault
    }
  }
`;

export const GET_ALL_PROJECT_ASSOCIATED_CALENDAR = gql`
  query getAllProjectAssociatedCalendar {
    projectCalendarAssociation(where: {}) {
      calendarId
      id
      isDefault
      isDeleted
      calendar {
        calendarName
        externalCalendar
        externalCalendarId
        id
      }
    }
  }
`;
