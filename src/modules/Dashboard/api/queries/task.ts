import { gql } from "@apollo/client";

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
      actualDuration
      estimatedStartDate
      estimatedEndDate
      estimatedDuration
      commitmentCost
      payoutCost
      plannedQuantity
      plannedLabourHour
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
          formsData(
            where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
          ) {
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
    attachments: attachments(where: { taskId: { _eq: $id } }) {
      taskId
      id
      fileName
      fileSize
      fileType
      blobKey
    }
  }
`;

export const GET_ROOT_PROJECT_TASK = gql`
	query getProjectEndDateCC($projectId: Int!, $tenantId: Int!) {
		projectInsightsTaskDelay(
			where: {
				projectId: { _eq: $projectId }
				tenantId: { _eq: $tenantId }
				taskType: { _eq: "project" }
			}
		) {
			taskType
			forecastedDelay
			forecastedEndDate
		}
	}
`;
