import { gql } from '@apollo/client';
import {TaskLibrary} from '../models/taskLibrary'; 

// fetch all task library data
export const LOAD_TASK_LIBRARY = gql`query getTaskLibraries($limit: Int!, $offset: Int!, $taskName: String!) {
        ${TaskLibrary.modelName}(limit: $limit, offset: $offset, order_by: {taskName: asc}, where: {taskName: {_ilike: $taskName }}) {
          ${TaskLibrary.selector.id}
          ${TaskLibrary.selector.duration}
          ${TaskLibrary.selector.taskName}
          ${TaskLibrary.selector.taskType}
          ${TaskLibrary.selector.customId}
          ${TaskLibrary.selector.customTaskType}
          ${TaskLibrary.selector.classification}
          ${TaskLibrary.selector.description}
          ${TaskLibrary.selector.tag}
          ${TaskLibrary.selector.createdBy}
          ${TaskLibrary.selector.createdAt}
          ${TaskLibrary.selector.tenantAssociation} {
            ${TaskLibrary.selector.user} {
              ${TaskLibrary.selector.firstName}
              ${TaskLibrary.selector.lastName}
            }
          }
        }
  }
`;

export const UNIQUE_TASK_LIBRARY = gql`query getUniqueTaskLibrary($taskName: String!) {
  ${TaskLibrary.modelName}(where: {taskName: {_ilike: $taskName}}) {
    ${TaskLibrary.selector.id}
    ${TaskLibrary.selector.taskName}
  }
}
`;


export const UNIQUE_CUSTOM_ID = gql`query getUniqueTaskCustomID($customId: String!) {
  ${TaskLibrary.modelName}(where: {customId: {_eq: $customId}}) {
    ${TaskLibrary.selector.id}
    ${TaskLibrary.selector.taskName}
  }
}
`;


export const CREATE_TASK_LIBRARY =gql`
  mutation createTaskLibrary
      ($taskName: String, $duration: Int, $description: String, $customId: String,
        $classification: String, $customTaskType: String) {
    insert_taskLibrary(objects: 
      {taskName: $taskName, duration: $duration, description: $description,
        customId: $customId, classification: $classification, customTaskType: $customTaskType}) {
      affected_rows
    }
  }
`;

export const UPDATE_TASK_LIBRARY =gql`
  mutation updateTaskLibrary
      ($id: Int!, $taskName: String, $duration: Int, $description: String, $customId: String,
        $classification: String, $customTaskType: String, $tag: Int) {
    update_taskLibrary(where: {id: {_eq: $id}},
      _set: {taskName: $taskName, tag: $tag, duration: $duration, description: $description,
            customTaskType: $customTaskType, customId: $customId, classification: $classification}) {
      affected_rows
    }
  }
`;

export const DELETE_TASK_LIBRARY =gql`
  mutation deleteTaskLibrary
      ($id: Int!) {
        delete_taskLibrary(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }
`;