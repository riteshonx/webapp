import { gql } from '@apollo/client';

export const START_TASK = gql`
  mutation startTask(
    $status: String
    $id: uuid
    $date: date
    $lpsStatus: String
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { status: $status, actualStartDate: $date, lpsStatus: $lpsStatus }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_TASK_ASSIGNEE = gql`
  mutation updateTaskAssignee($taskAssignee: [TasksAssignee!]) {
    updateTaskAssignee_mutation(tasksAssignee: $taskAssignee) {
      message
    }
  }
`;

export const UPDATE_PROJECT_TASK_ASSIGNEE = gql`
  mutation update_task($id: [uuid!], $assignedTo: uuid) {
    update_projectTask(
      where: { id: { _in: $id } }
      _set: { assignedTo: $assignedTo }
    ) {
      returning {
        id
      }
    }
  }
`;
//adding responsible contractor
export const UPDATE_RESPONSIBLE_CONTRACTOR = gql`
  mutation update_task($id: uuid, $responsibleContractor: Int) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { responsibleContractor: $responsibleContractor }
    ) {
      returning {
        id
      }
    }
  }
`;

export const COMPLETE_TASK = gql`
  mutation completeTask(
    $status: String
    $id: uuid
    $date: date
    $lpsStatus: String
    $actualDuration: Int
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: {
        status: $status
        actualEndDate: $date
        lpsStatus: $lpsStatus
        actualDuration: $actualDuration
      }
    ) {
      affected_rows
    }
  }
`;

export const MOVE_TASK_IN_TODO = gql`
  mutation moveTaskInTodo(
    $status: String
    $id: uuid
    $actualStartDate: date
    $actualEndDate: date
    $actualDuration: Int
    $lpsStatus: String
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: {
        status: $status
        actualEndDate: $actualEndDate
        actualStartDate: $actualStartDate
        actualDuration: $actualDuration
        lpsStatus: $lpsStatus
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_TASK_LPS_STATUS = gql`
  mutation updateTaskLpsStatus($lpsStatus: String, $id: uuid, $status: String) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { lpsStatus: $lpsStatus, status: $status }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_TASK_LPS_STATUS_ONLY = gql`
  mutation updateTaskLpsStatus($lpsStatus: String, $id: uuid) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { lpsStatus: $lpsStatus }
    ) {
      affected_rows
    }
  }
`;

export const MOVE_TASK_TO_IN_PROGRSS = gql`
  mutation moveTaskToInProgress(
    $id: uuid
    $status: String
    $lpsStatus: String
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { status: $status, lpsStatus: $lpsStatus }
    ) {
      affected_rows
    }
  }
`;

export const MOVE_TASK_TO_IN_COMPLETED = gql`
  mutation moveTaskToInCompleted(
    $id: uuid
    $status: String
    $lpsStatus: String
    $actualEndDate: date
    $actualDuration: Int
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: {
        status: $status
        lpsStatus: $lpsStatus
        estimatedDate: $actualEndDate
        actualDuration: $actualDuration
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CONSTRAINT_NAME_AND_CATEGORY = gql`
  mutation UpdateTaskConstraintNameAndCategory(
    $id: uuid
    $category: String
    $constraintName: String
    $description: String
    $dueDate: date!
    $userAssignee: uuid!
    $companyAssignee: Int!
  ) {
    update_projectTaskConstraints(
      where: { id: { _eq: $id } }
      _set: {
        category: $category
        constraintName: $constraintName
        description: $description
        dueDate: $dueDate
        userAssignee: $userAssignee
        companyAssignee: $companyAssignee
      }
    ) {
      affected_rows
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

export const DELETE_CONSTRAINT = gql`
  mutation deleteConstraint($id: uuid) {
    delete_projectTaskConstraints(where: { id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_PROJECT_TASK_START_DATE_END_DATE = gql`
  mutation updateProjectTaskStartAndEndDate(
    $id: uuid
    $plannedStartDate: date
    $plannedEndDate: date
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: {
        plannedStartDate: $plannedStartDate
        plannedEndDate: $plannedEndDate
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_END_DATE_DURATION = gql`
  mutation updateProjectTaskEndDateAndDuration(
    $id: uuid
    $plannedEndDate: date
    $plannedDuration: Int
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: {
        plannedEndDate: $plannedEndDate
        plannedDuration: $plannedDuration
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ESTIMATED_END_DATE = gql`
  mutation updateProjectTaskActualStartDateAndEstimatedDate(
    $id: uuid
    $actualStartDate: date
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { actualStartDate: $actualStartDate }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_ACTUAL_START_DATE_AND_ACTUAL_END_DATE = gql`
  mutation updateProjectTaskActualStartDateAndActualEndDate(
    $id: uuid
    $actualStartDate: date
    $actualEndDate: date
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { actualStartDate: $actualStartDate, actualEndDate: $actualEndDate }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_ACTUAL_END_DATE_AND_DURATION = gql`
  mutation updateProjectTaskActualEndDateAndDuration(
    $id: uuid
    $duration: Int
    $actualEndDate: date
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { actualDuration: $duration, actualEndDate: $actualEndDate }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_VARIANCE = gql`
  mutation deleteVariance($id: uuid) {
    delete_projectTaskVariance(where: { id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_PROJECT_TASK_COMMITMENT_COST = gql`
  mutation updateProjectTaskCommitmentCost($id: uuid, $commitmentCost: float8) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { commitmentCost: $commitmentCost }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_PAYOUT_COST = gql`
  mutation updateProjectTaskPayoutCost($id: uuid, $payoutCost: float8) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { payoutCost: $payoutCost }
    ) {
      affected_rows
    }
  }
`;

export const CREATE_DRAFT_FORM_ADD_CONSTRANT = gql`
  mutation createLinkFormAddASConstraint(
    $category: String!
    $featureId: Int!
    $subject: String!
    $taskId: uuid!
    $description: String!
    $dueDate: Date
    $userAssignee: uuid!
    $companyAssignee: Int!
  ) {
    insert_formDraftScheduler_mutation(
      category: $category
      featureId: $featureId
      subject: $subject
      taskId: $taskId
      description: $description
      dueDate: $dueDate
      userAssignee: $userAssignee
      companyAssignee: $companyAssignee
    ) {
      message
    }
  }
`;

export const CREW_MASTER_ASSIGNEE_FROM_TASK_DETAILS = gql`
  mutation crewMasterAssignee($taskAssignee: [uuid!]) {
    insertCrewMaster_mutation(assignee: $taskAssignee) {
      message
    }
  }
`;

export const GET_RELATED_TASKS_QUERY = gql`
  query getRelatedTasks($taskId: uuid!) {
    Succeeding: taskRelationship(where: { source: { _eq: $taskId } }) {
      id
      type
      lag
      projectTask {
        id
        taskName
        status
      }
    }
    Preceding: taskRelationship(where: { target: { _eq: $taskId } }) {
      id
      type
      lag
      projectTaskBySource {
        id
        taskName
        status
      }
    }
  }
`;
