import { gql } from '@apollo/client';

export const GET_LABOUR_BY_TASK_ID = gql`
  query getLabourByTaskId($taskId: uuid) {
    projectTask(where: { id: { _eq: $taskId } }) {
      projectTaskLabourAssociations {
        startDate
        endDate
        projectLabourMaster {
          labourName
          externalLabourId
          id
        }
      }
    }
  }
`;
