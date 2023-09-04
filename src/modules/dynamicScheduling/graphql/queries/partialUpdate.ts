import { gql } from '@apollo/client';

export const IS_DELETE_STATUS_PARTIAL_UPDATE = gql`
  mutation updateIsDeleteStatus(
    $isDeleted: Boolean
    $taskId: uuid
    $checkIsDelete: Boolean
  ) {
    update_projectTaskPartialUpdate(
      where: { taskId: { _eq: $taskId }, isDeleted: { _eq: $checkIsDelete } }
      _set: { isDeleted: $isDeleted }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_START_TASK = gql`
  mutation partialStartTask(
    $taskId: uuid
    $taskStatus: String
    $actualStartDate: date
    $taskLpsStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        taskStatus: $taskStatus
        actualStartDate: $actualStartDate
        taskLpsStatus: $taskLpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_COMPLETE_TASK = gql`
  mutation partialCompleteTask(
    $taskId: uuid
    $taskStatus: String
    $actualDuration: Int
    $actualEndDate: date
    $taskLpsStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        taskStatus: $taskStatus
        actualDuration: $actualDuration
        actualEndDate: $actualEndDate
        taskLpsStatus: $taskLpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_MOVE_TASK_IN_TODO = gql`
  mutation partialMoveTaskInTodo(
    $taskStatus: String
    $taskId: uuid
    $actualStartDate: date
    $actualEndDate: date
    $actualDuration: Int
    $taskLpsStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        taskStatus: $taskStatus
        actualEndDate: $actualEndDate
        actualStartDate: $actualStartDate
        actualDuration: $actualDuration
        taskLpsStatus: $taskLpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_TASK_LPS_STATUS = gql`
  mutation partialUpdateTaskLpsStatus(
    $taskLpsStatus: String
    $id: uuid
    $status: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $id
        taskStatus: $status
        taskLpsStatus: $taskLpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_MOVE_TASK_TO_IN_PROGRESS = gql`
  mutation partialMoveTaskToInProgress(
    $taskId: uuid
    $taskStatus: String
    $actualEndDate: date
    $actualDuration: Int
    $taskLpsStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        taskStatus: $taskStatus
        actualEndDate: $actualEndDate
        actualDuration: $actualDuration
        taskLpsStatus: $taskLpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_MOVE_TASK_TO_IN_COMPLETED = gql`
  mutation partialMoveTaskToInCompleted(
    $taskId: uuid
    $taskStatus: String
    $taskLpsStatus: String
    $actualEndDate: date
    $actualDuration: Int
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        taskStatus: $taskStatus
        actualEndDate: $actualEndDate
        actualDuration: $actualDuration
        taskLpsStatus: $taskLpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_PROJECT_TASK_START_DATE_END_DATE = gql`
  mutation partialUpdateProjectTaskStartAndEndDate(
    $taskId: uuid
    $plannedStartDate: date
    $plannedEndDate: date
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        plannedStartDate: $plannedStartDate
        plannedEndDate: $plannedEndDate
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_PROJECT_TASK_END_DATE_DURATION = gql`
  mutation partialUpdateProjectTaskEndDateAndDuration(
    $taskId: uuid
    $plannedEndDate: date
    $plannedDuration: Int
    $partialUpdateStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        plannedEndDate: $plannedEndDate
        plannedDuration: $plannedDuration
        partialUpdateStatus: $partialUpdateStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ESTIMATED_END_DATE = gql`
  mutation partialUpdateProjectTaskActualStartDateAndEstimatedDate(
    $taskId: uuid
    $actualStartDate: date
    $taskStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        actualStartDate: $actualStartDate
        taskStatus: $taskStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ACTUAL_END_DATE = gql`
  mutation partialUpdateProjectTaskActualStartDateAndActualEndDate(
    $taskId: uuid
    $actualStartDate: date
    $actualEndDate: date
    $taskStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        actualStartDate: $actualStartDate
        actualEndDate: $actualEndDate
        taskStatus: $taskStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_PROJECT_TASK_ACTUAL_END_DATE_AND_DURATION = gql`
  mutation partialUpdateProjectTaskActualEndDateAndDuration(
    $taskId: uuid
    $actualDuration: Int
    $actualEndDate: date
    $taskStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        actualDuration: $actualDuration
        actualEndDate: $actualEndDate
        taskStatus: $taskStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const GET_PARTIAL_UPDATED_TASKS = gql`
  query getPartialUpdatedTasks {
    projectTaskPartialUpdate(
      where: { isDeleted: { _eq: false } }
      order_by: { createdAt: desc }
    ) {
      id
      actualStartDate
      actualEndDate
      actualDuration
      estimatedStartDate
      estimatedEndDate
      estimatedDuration
      partialUpdateStatus
      plannedStartDate
      plannedEndDate
      plannedDuration
      taskStatus
      taskLpsStatus
      taskId
      isDeleted
      createdAt
      tenantAssociationByCreatedbyTenantid {
        user {
          email
          firstName
          lastName
        }
      }
      projectTask {
        taskName
      }
    }
  }
`;

export const IS_DELETE_STATUS_PARTIAL_BULK_UPDATE = gql`
  mutation bulkUpdateIsDeleteStatus(
    $ids: [Int!]
    $partialUpdateStatus: String
  ) {
    update_projectTaskPartialUpdate(
      where: { id: { _in: $ids } }
      _set: { isDeleted: true, partialUpdateStatus: $partialUpdateStatus }
    ) {
      affected_rows
    }
  }
`;

export const PARTIAL_UPDATE_PROJECT_TASK_ESTIMATED_END_DATE_AND_DURATION = gql`
  mutation partialUpdateProjectTaskEstimatedEndDateAndDuration(
    $taskId: uuid
    $estimatedDuration: Int
    $estimatedEndDate: date
    $taskStatus: String
  ) {
    insert_projectTaskPartialUpdate(
      objects: {
        taskId: $taskId
        estimatedDuration: $estimatedDuration
        estimatedEndDate: $estimatedEndDate
        taskStatus: $taskStatus
      }
    ) {
      affected_rows
    }
  }
`;
