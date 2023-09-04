import { gql } from '@apollo/client';


export const GET_ATTCHED_FILES = gql`
  query MyQuery($taskId: uuid) {
    attachments(where: {taskId: {_eq: $taskId}}) {
      taskId
      id
      fileName
      fileSize
      fileType
      blobKey
    }
  }
`;

export const SAVE_ATTCHED_FILES = gql`
  mutation saveAttachedFiles($objects: [attachments_insert_input!]!) {
    insert_attachments(objects: $objects) {
      returning {
        blobKey
      }
    }
  }
`;

export const DELETE_ATTCHED_FILE = gql`
  mutation MyMutation($id: Int) {
    delete_attachments(where: {id: {_eq: $id}}) {
      returning {
        id
      }
    }
  }
`;

