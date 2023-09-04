import { gql } from "@apollo/client";

export const GET_TASK_VARIANCES = gql`
query GetTaskVariances($taskIds: [uuid!]) {
    projectTaskVariance(order_by: {projectTask: {plannedStartDate: asc}}, 
        where: {taskId: {_in: $taskIds}}) {
        category
        varianceName
        createdAt
        createdBy
        id
        taskId
        projectTask {
          taskName
        }
        updatedAt
        updatedBy
    }
  }`;


  export const CREATE_TASK_VARIANCE = gql`
  mutation CreateTaskVariance($object: projectTaskVariance_insert_input!) {
    insert_projectTaskVariance_one(object: $object) {
      id
    }
  }`;

  export const UPDATE_TASK_VARIANCE = gql`  
  mutation UpdateTaskVariance($id: uuid, $category: String, $varianceName: String, $taskId: uuid) {
    update_projectTaskVariance(where: {id: {_eq: $id}}, 
      _set: {category: $category, varianceName: $varianceName, taskId: $taskId}) {
      affected_rows
    }
  }`;