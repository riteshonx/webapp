import { gql } from '@apollo/client';

export const GET_TASK_CONSTRAINTS = gql`
  query GetTaskConstraints($taskIds: [uuid!]) {
    projectTaskConstraints(
      order_by: { projectTask: { plannedStartDate: asc } }
      where: { taskId: { _in: $taskIds } }
    ) {
      category
      constraintName
      createdAt
      createdBy
      id
      taskId
      projectTask {
        taskName
        assignedTo
      }
      status
      updatedAt
      updatedBy
      description
      dueDate
      companyAssignee
      userAssignee
    }
  }
`;

export const GET_TASK_CONSTRAINTS_ORDER_BY_STATUS = gql`
  query GetTaskConstraints($taskIds: [uuid!]) {
    projectTaskConstraints(
      order_by: { status: desc }
      where: { taskId: { _in: $taskIds } }
    ) {
      category
      constraintName
      createdAt
      createdBy
      id
      lessonslearnedTaskInsight {
        lessonslearnedProjectInsight {
          id
        }
      }
      linkId
      linkFormTask {
        formId
        form {
          projectFeature {
            id
          }
          projectAutoIncrement
          formsUserLists(where: { type: { _eq: "ASSIGNEE" } }) {
            user {
              id
              lastName
              firstName
              email
            }
          }
        }
      }
      taskId
      projectTask {
        taskName
        assignedTo
      }
      status
      updatedAt
      updatedBy
      dueDate
      description
      companyAssignee
      userAssignee
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

export const UPDATE_TASK_CONSTRAINTS = gql`
  mutation UpdateTaskConstraint(
    $_set: projectTaskConstraints_set_input,
    $id: uuid
  ) {
    update_projectTaskConstraints(
      where: { id: { _eq: $id } }
      _set: $_set
    ) {
      affected_rows
    }
  }
`;

export const RESOLVED_CONSTRAINTS = gql`
  mutation ResolvedConstraints($id: [uuid!], $status: String) {
    update_projectTaskConstraints(
      where: { id: { _in: $id } }
      _set: { status: $status }
    ) {
      affected_rows
    }
  }
`;
