import { gql } from "@apollo/client";
import { DailyLogs } from "../models/dailyLogs";

export const FETCH_ASSIGNED_ACTIVITIES = gql`query getDailyLogsList($userId: uuid!) {
    ${DailyLogs.modelName} (
      where: {assignedTo: {_eq: $userId}, _and: [{taskType: {_eq: "task"}}, {status: {_neq: "Complete"}}, {_or: [{actualStartDate: {_lte: "now()"}}, {plannedStartDate: {_lte: "now()"}}]}]},order_by: {plannedStartDate: asc}
      ) {
      ${DailyLogs.selector.status}
      ${DailyLogs.selector.taskName}
      ${DailyLogs.selector.plannedEndDate}
      ${DailyLogs.selector.plannedStartDate}
      ${DailyLogs.selector.plannedDuration}
      ${DailyLogs.selector.actualDuration}
      ${DailyLogs.selector.actualEndDate}
      ${DailyLogs.selector.actualStartDate}
      ${DailyLogs.selector.assignedTo}
      ${DailyLogs.selector.id}
      
      ${DailyLogs.relation.attachments}{
        ${DailyLogs.selector.id}
        ${DailyLogs.selector.taskId}
      }
      projectTaskPartialUpdates(where: {isDeleted: {_eq: false}}) {
        actualStartDate
        actualEndDate
        createdAt
        taskStatus
        plannedEndDate
        plannedStartDate
      }
      projectTaskVariances {
        category
        varianceName
      }
      projectTaskConstraints(where: { status: {_neq: "closed"}}) {
        id
      }
    }
  }
`;

export const FETCH_UPCOMING_ACTIVITIES = gql`query getUpcomingLogsList($userId: uuid!, $lessThan: date!) {
  ${DailyLogs.modelName} (order_by: { plannedStartDate: asc }
    where: {_and: {assignedTo: {_eq: $userId}, taskType: {_eq: "task"}, plannedStartDate: {_gt: "now()", _lte: $lessThan}, actualStartDate: {_is_null: true}}}
    ) {
    ${DailyLogs.selector.status}
    ${DailyLogs.selector.taskName}
    ${DailyLogs.selector.plannedEndDate}
    ${DailyLogs.selector.plannedStartDate}
    ${DailyLogs.selector.plannedDuration}
    ${DailyLogs.selector.actualDuration}
    ${DailyLogs.selector.actualEndDate}
    ${DailyLogs.selector.actualStartDate}
    ${DailyLogs.selector.id}
    ${DailyLogs.relation.projectTaskConstraints}(order_by: {status: desc}) {
      id
      constraintName
      category
      status
      linkId
      taskId
    }
    projectTaskPartialUpdates(where: {isDeleted: {_eq: false}}) {
      actualStartDate
      actualEndDate
      createdAt
      taskStatus
      plannedEndDate
      plannedStartDate
    }

  }
}
`;

export const UPDATE_CONSTRAINT_STATUS = gql`
  mutation UpdateTaskConstraintStatus($id: uuid, $status: String) {
    update_projectTaskConstraints(
      where: { id: { _eq: $id } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_ACTIVITY_STATUS = gql`
  mutation UpdateActivityStatus(
    $taskId: uuid!
    $status: String!
    $category: String
    $variance: String
    $actualStartDate: String
    $estimatedEndDate: String
    $createdAt:String

  ) {
    insertDailylogTaskTimesheet_mutation(
      status: $status
      taskId: $taskId
      category: $category
      variance: $variance
      actualStartDate: $actualStartDate
      estimatedEndDate: $estimatedEndDate
      createdAt: $createdAt
    ) {
      message
    }
  }
`;

export const UPDATE_ACTIVITY_COMMENTS = gql`
  mutation UpdateActivityComments(
    $comment: String
    $timesheetId: Int!
    $deleteComment: Boolean!
  ) {
    insert_comments(
      objects: {
        timesheetId: $timesheetId
        comment: $comment
        deleted: $deleteComment
      }
      on_conflict: {
        constraint: comments_timesheetId_key
        update_columns: [comment, deleted]
      }
    ) {
      affected_rows
    }
  }
`;

export const FETCH_DAILYLOG_ID = gql`
  query fetchDailyLogId($date: date) {
    projectDailyLog(where: { createdAt: { _eq: $date } }) {
      id
    }
  }
`;

export const FETCH_FORM_ID = gql`
  query fetchFormId($createdBy: uuid, $uniqueDailylogId: Int) {
    forms(
      where: {
        createdBy: { _eq: $createdBy }
        uniqueDailylogId: { _eq: $uniqueDailylogId }
      }
    ) {
      id
    }
  }
`;

export const FETCH_TIMESHEET_ENTRIES = gql`
  query fetchTimesheetEntries($id: Int!) {
    forms_by_pk(id: $id) {
      id
      taskTimesheetEntries(order_by: {projectTask: {plannedStartDate: asc}}) {
        id
        taskId
        metadata
        comments {
          comment
          id
          deleted
        }
        attachments {
          blobKey
          createdBy
          fileName
          fileSize
          fileType
        }
      }
      comments {
        comment
        id
        deleted
      }
    }
  }
`;

export const NEW_FETCH_TIMESHEET_ENTRIES = gql`
query fetchUpdatedTimesheetEntries($taskIds: [uuid!]) {
  taskTimesheetEntry(
    where: {taskId: {_in: $taskIds}, projectTask: {status: {_neq: "Complete"}}}
    distinct_on: taskId
    order_by: {taskId: asc, updatedAt: desc}
  ) {
    id
    taskId
    metadata
    comments {
      comment
      id
      deleted
    }
    attachments {
      blobKey
      createdBy
      fileName
      fileSize
      fileType
    }
    projectTask {
      status
    }
    updatedAt
  }
}
`

export const UPDATE_ADDITIONAL_COMMENTS_WITHCOMMENTID = gql`
  mutation updateCommentWithCommentId(
    $comment: String!
    $commentId: Int!
    $deleteComment: Boolean!
  ) {
    update_comments(
      where: { id: { _eq: $commentId } }
      _set: { comment: $comment, deleted: $deleteComment }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_ADDITIONAL_COMMENTS_WITHFORMID = gql`
  mutation updateCommentWithFormId($comment: String!, $formId: Int!) {
    insert_comments(objects: { comment: $comment, formId: $formId }) {
      affected_rows
    }
  }
`;

export const UPDATE_ADDITIONAL_COMMENTS_WITHDAILYLOGID = gql`
  mutation updateCommentWithDailyLogId(
    $comment: String!
    $uniqueDailylogId: Int!
    $featureId: Int!
  ) {
    insert_forms(
      objects: {
        uniqueDailylogId: $uniqueDailylogId
        comments: { data: { comment: $comment } }
        featureId: $featureId
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_ADDITIONAL_COMMENTS = gql`
  mutation UpdateAdditionalCommentsWithId(
    $comment: String!
    $featureId: Int
    $timestampDate: timestamptz
    $createdAtDate: date
  ) {
    insert_projectDailyLog(
      objects: {
        forms: {
          data: {
            featureId: $featureId
            comments: { data: { comment: $comment } }
            createdAt: $timestampDate
          }
        }
        createdAt: $createdAtDate
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_PROJECT_DAILYLOG_FEATURE_ID = gql`
  query getProjectDailyogFeatureId {
    projectFeature(where: { feature: { _eq: "DAILYLOG" } }) {
      id
    }
  }
`;

// for showing users in the filter
export const GET_PROJECT_DAILYLOG_USERSLIST = gql`
  query getProjectDailylogUserslist {
    forms(distinct_on: createdBy) {
      createdByUser {
        firstName
        id
        lastName
      }
    }
  }
`;

export const UPDATE_COMMENT_WITHOUTTIMESHEETID = gql`
  mutation updateCommentWithoutTimeSheetId($comment: String, $taskId: uuid!) {
    insertDailylogTaskTimesheet_mutation(taskId: $taskId, comments: $comment) {
      message
    }
  }
`;

export const INSERT_ATTACHEDFILES = gql`
  mutation insertAttachedFiles(
    $blobKey: String
    $fileName: String
    $fileSize: float8
    $fileType: String
    $timesheetId: Int
  ) {
    insert_attachments(
      objects: [
        {
          blobKey: $blobKey
          fileName: $fileName
          fileSize: $fileSize
          fileType: $fileType
          timesheetId: $timesheetId
        }
      ]
    ) {
      affected_rows
    }
  }
`;

export const INSERT_ATTACHEDFILES_WITHTASKID = gql`
  mutation insertAttachedFiles(
    $blobKey: String!
    $fileName: String!
    $fileSize: Float!
    $fileType: String!
    $taskId: uuid!
  ) {
    insertDailylogTaskTimesheet_mutation(
      taskId: $taskId
      attachments: [
        {
          blobKey: $blobKey
          fileName: $fileName
          fileSize: $fileSize
          fileType: $fileType
        }
      ]
    ) {
      message
    }
  }
`;

export const GET_DAILYLOG_LIST = gql`
  query getProjectDailylogList(
    $limit: Int
    $offset: Int
    $createdBy: [uuid]
    $createdAt: timestamptz
  ) {
    forms(
      limit: $limit
      offset: $offset
      where: { createdBy: { _in: $createdBy }, createdAt: { _eq: $createdAt } }
      order_by: { uniqueDailylogId: desc }
    ) {
      id
      createdAt
      createdBy
      createdByUser {
        firstName
        lastName
      }
    }
  }
`;

export const FETCH_DAILY_LOG_COUNT = gql`
  query getProjectDailyLogCount($createdBy: [uuid], $createdAt: timestamptz) {
    forms_aggregate(
      where: { createdBy: { _in: $createdBy }, createdAt: { _eq: $createdAt } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

export const FETCH_DAILYLOG_SUMMARY_DATA = gql`
  query fetchDailylogSummaryData($uniqueDailylogId: Int) {
    taskTimesheetEntry(
      where: { form: { uniqueDailylogId: { _eq: $uniqueDailylogId } } }
    ) {
      metadata
      id
      taskId
      form {
        createdByUser {
          id
          firstName
          lastName
        }
      }
      comments {
        comment
        id
        createdByUser {
          lastName
          firstName
        }
      }
      attachments {
        blobKey
        createdBy
        fileName
        fileSize
        fileType
      }
    }
  }
`;

export const LOAD_CONSTRAINT_LIST_VALUES = gql`
  query fetchCustomList($name: String!) {
    configurationLists(where: { _and: [{ name: { _eq: $name } }] }) {
      id
      name
      createdAt
      updatedAt
      systemGenerated
      projectConfigAssociations {
        configValueId
      }
      configurationValues(order_by: { nodeName: asc }) {
        id
        nodeName
        parentId
      }
    }
  }
`;

export const CREATE_TASK_CONSTRAINTS = gql`
  mutation CreateTaskConstraint($object: projectTaskConstraints_insert_input!) {
    insert_projectTaskConstraints_one(object: $object) {
      id
    }
  }
`;

export const UPDATE_ACTIVITY_STATUS_COMPLETED = gql`
  mutation UpdateActivityStatus(
    $taskId: uuid!
    $status: String!
    $category: String
    $variance: String
    $actualEndDate: String
    $actualStartDate: String
    $createdAt: String
  ) {
    insertDailylogTaskTimesheet_mutation(
      status: $status
      taskId: $taskId
      category: $category
      variance: $variance
      actualEndDate: $actualEndDate
      actualStartDate: $actualStartDate
      createdAt:$createdAt
    ) {
      message
    }
  }
`;
