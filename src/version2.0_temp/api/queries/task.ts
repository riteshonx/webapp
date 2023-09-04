import { gql } from '@apollo/client';

export const TASK_DETAIL_BY_TASK_ID = gql`
  query TaskDetailByTaskId($id: uuid!) {
    projectTask_by_pk(id: $id) {
      taskName
      actualEndDate
      actualStartDate
      plannedEndDate
      plannedStartDate
      description
      taskType
      progress
      floatValue
      isCritical
      classificationCode {
        classificationCode
        classificationCodeName
      }
      assignedToUser {
        firstName
      }
      projectedLaborHour
      formTaskLinks {
        linkType {
          id
          name
        }
        id
        form {
          id
          projectFeature {
            feature
            id
          }
          formsData {
            valueString
          }
        }
      }
      projectTaskConstraints(where: { status: { _eq: "open" } }) {
        description
        constraintName
      }
      projectTaskVariances {
        varianceName
        category
      }
      projectTaskMaterialAssociations {
        quantityConsumed
        quantityAllocated
        projectMaterial {
          embodiedCarbonValue
          materialMaster {
            materialName
            unit
          }
        }
      }
    }
    Succeeding: taskRelationship(where: { source: { _eq: $id } }) {
      id
      type
      lag
      projectTask {
        id
        taskName
        status
      }
    }
    Preceding: taskRelationship(where: { target: { _eq: $id } }) {
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
