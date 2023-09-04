import { gql } from '@apollo/client';

export const GET_SUGGESTED_LINKS = gql`
  query autolinkTaskListQuery {
    projectInsightsTaskFormLink(
      where: {
        isDeleted: { _eq: false },
        projectTask: {isDeleted: {_eq: false}}
      }
      distinct_on: [taskId]
    ) {
      id
      taskId
      projectTask {
        taskName
        description
        plannedStartDate
        plannedEndDate
        actualStartDate
        actualEndDate
        projectInsightsTaskFormLinks {
        form {
          projectFeature {
            feature
          }
        }
      }
      }
    }
  }
`;
export const GET_TASK_DETAILS = gql`
query getTaskAutolinksQuery($taskId: uuid!, $feature: String) {
  projectInsightsTaskFormLink(where: {taskId: {_eq: $taskId}, isDeleted: {_eq: false}, projectTask: {isDeleted: {_eq: false}}, form: {projectFeature: {feature: {_like: $feature}}}}) {
    id
    formId
    taskId
    linkData
    userResponse
    form {
      id
      featureId
      formsData(where: {caption: {_in: ["Subject", "Checklist No", "RFI ID", "Issue Number"]}}) {
        caption
        valueString
        valueInt
      }
      formsLocationLists {
        locationValue
      }
      projectFeature {
        feature
      }
    }
    projectTask {
      taskName
      description
      plannedStartDate
      plannedEndDate
      actualStartDate
      actualEndDate
    }
  }
}
`;

export const UPDATE_USER_RESPONSE = gql`
  mutation UpdateProjectInsightsTaskFormLink(
    $userResponse: String!
    $id: [Int!]!
  ) {
    update_projectInsightsTaskFormLink(
      where: { id: { _in: $id } }
      _set: { userResponse: $userResponse }
    ) {
      affected_rows
      __typename
    }
  }
`;
