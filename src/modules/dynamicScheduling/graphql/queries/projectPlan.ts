import { gql } from '@apollo/client';

export const GET_PROJECT_PLAN = gql`
  query getProjectPlanTasks {
    tasks: projectTask(
      order_by: { serialNumber: asc }
      where: {
        _or: [{ level: { _in: [0, 1] } }, { level: { _is_null: true } }]
      }
    ) {
      id
      parentId
      taskType
      taskName
      calendarId
      plannedStartDate
      plannedEndDate
      plannedDuration
      actualStartDate
      actualEndDate
      actualDuration
      assignedTo
      createdBy
      updatedBy
      serialNumber
      floatValue
      isCritical
      level
      status
      recipeSetId
      recipeId
      hasChild
      estimatedDuration
      estimatedEndDate
      externalId
      assignedToUser {
        firstName
        lastName
        jobTitle
        email
      }
      tenantCompanyAssociation {
        id
        name
      }
      scheduleRecipeSet {
        recipeName
      }
      lpsStatus
      commitmentCost
      payoutCost
      tenantAssociationByTenantidCreatedby {
        user {
          id
          lastName
          firstName
        }
      }
    }
    links: taskRelationship {
      id
      lag
      source
      target
      type
      createdBy
    }
  }
`;

export const GET_PROJECT_ALL_TASKS = gql`
  query getProjectPlanTasks {
    tasks: projectTask(
      order_by: { serialNumber: asc }
      where: {
        _or: [{ level: { _in: [0, 1] } }, { level: { _is_null: true } }]
      }
    ) {
      id
      taskType
      taskName
      plannedStartDate
      plannedEndDate
      actualStartDate
      actualEndDate
      assignedTo
      createdBy
      updatedBy
      projectId
      status
      projectTaskPartialUpdates {
        partialUpdateStatus
      }
      assignedToUser {
        firstName
        lastName
        jobTitle
        email
      }
      projectTaskConstraints_aggregate {
        aggregate {
          count
        }
      }
      projectTaskVariances_aggregate {
        aggregate {
          count
        }
      }
    }
  }
`;

export const GET_PROJECT_PLAN_ALL_TASK = gql`
  query getProjectPlanTasks {
    tasks: projectTask(order_by: { serialNumber: asc }) {
      id
      parentId
      taskType
      taskName
      calendarId
      plannedStartDate
      plannedEndDate
      plannedDuration
      actualStartDate
      actualEndDate
      actualDuration
      assignedTo
      createdBy
      updatedBy
      serialNumber
      floatValue
      isCritical
      level
      status
      recipeSetId
      recipeId
      hasChild
      estimatedDuration
      estimatedEndDate
      externalId
      assignedToUser {
        firstName
        lastName
        jobTitle
        email
      }
      scheduleRecipeSet {
        recipeName
      }
      tenantCompanyAssociation {
        id
        name
      }
      lpsStatus
      commitmentCost
      payoutCost
      tenantAssociationByTenantidCreatedby {
        user {
          id
          lastName
          firstName
        }
      }
    }
    links: taskRelationship {
      id
      lag
      source
      target
      type
      createdBy
    }
  }
`;

export const GET_CHILD_TASK = gql`
  query getProjectPlanTasks($parentId: uuid) {
    tasks: projectTask(
      order_by: { serialNumber: asc }
      where: { parentId: { _eq: $parentId } }
    ) {
      id
      parentId
      taskType
      taskName
      calendarId
      plannedStartDate
      plannedEndDate
      plannedDuration
      actualStartDate
      actualEndDate
      actualDuration
      assignedTo
      createdBy
      updatedBy
      serialNumber
      floatValue
      isCritical
      level
      status
      recipeSetId
      recipeId
      hasChild
      estimatedDuration
      estimatedEndDate
      externalId
      assignedToUser {
        firstName
        lastName
        jobTitle
        email
      }
      scheduleRecipeSet {
        recipeName
      }
      lpsStatus
      commitmentCost
      payoutCost
      tenantAssociationByTenantidCreatedby {
        user {
          id
          lastName
          firstName
        }
      }
    }
    tenantCompanyAssociation {
      id
      name
    }
    links: taskRelationship {
      id
      lag
      source
      target
      type
      createdBy
    }
  }
`;

export const SAVE_PROJECT_PLAN = gql`
  mutation saveProjectPlanTasks(
    $tasks: [Tasks]!
    $links: [Links]!
    $deleteTasksIds: [uuid]!
    $deleteLinkIds: [uuid]!
  ) {
    insertProjectTask_relationship_mutation(
      tasks: $tasks
      links: $links
      deleteTasksIds: $deleteTasksIds
      deleteLinkIds: $deleteLinkIds
    ) {
      tasks
      links
    }
  }
`;

export const EDIT_PROJECT_METADATA_EDITED_BY = gql`
  mutation updateProjectMetaData($status: String, $edited_by: uuid) {
    update_projectScheduleMetadata(
      where: {}
      _set: { status: $status, edited_by: $edited_by }
    ) {
      affected_rows
    }
  }
`;

export const EDIT_PROJECT_METADATA_PUBLISHED_BY = gql`
  mutation updateProjectMetaData(
    $status: String
    $published_by: uuid
    $plannedStartDate: date
    $plannedEndDate: date
  ) {
    update_projectScheduleMetadata(
      where: {}
      _set: {
        status: $status
        published_by: $published_by
        plannedStartDate: $plannedStartDate
        plannedEndDate: $plannedEndDate
      }
    ) {
      affected_rows
    }
  }
`;

export const EDIT_PROJECT_METADATA_PUBLISHED_BY_WITHOUT_DATE = gql`
  mutation updateProjectMetaDataWithoutDate(
    $status: String
    $published_by: uuid
  ) {
    update_projectScheduleMetadata(
      where: {}
      _set: { status: $status, published_by: $published_by }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_STATUS = gql`
  mutation updateProjectTaskStatus(
    $id: uuid
    $status: String
    $actualStartDate: date
    $actualEndDate: date
  ) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: {
        status: $status
        actualStartDate: $actualStartDate
        actualEndDate: $actualEndDate
      }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_PROJECT_TASK_LPS_STATUS = gql`
  mutation updateProjectTaskLPSStatus($id: uuid, $lpsStatus: String) {
    update_projectTask(
      where: { id: { _eq: $id } }
      _set: { lpsStatus: $lpsStatus }
    ) {
      affected_rows
    }
  }
`;

export const GET_ALL_PROJECT_USERS_QUERY = gql`
  query getProjectUsers {
    user {
      email
      firstName
      id
      lastName
    }
  }
`;

export const GET_PROJECT_SCHEDULE_METADATA = gql`
  query getProjectScheduleMetaData {
    projectScheduleMetadata(where: {}) {
      updatedBy
      updatedAt
      totalProjectDelay
      published_by
      status
      projectId
      plannedEndDate
      plannedStartDate
      edited_by
      contractualEndDate
      contractualStartDate
      importType
    }
  }
`;

export const UPDATE_PROJECT_CONTRACTUAL_DATES = gql`
  mutation updateContractualDates(
    $contractualStartDate: date
    $contractualEndDate: date
  ) {
    update_projectScheduleMetadata(
      where: {}
      _set: {
        contractualStartDate: $contractualStartDate
        contractualEndDate: $contractualEndDate
      }
    ) {
      returning {
        id
      }
    }
  }
`;

export const GET_TENANT_COMPANIES = gql`
  query FETCH_TENANT_COMPANIES($search: String) {
    tenantCompanyAssociation(where: { active: { _eq: true } }) {
      name
      id
    }
  }
`;

export const GET_VERSIONS_QUERY = gql`
  query GET_VERSIONS {
    scheduleBaselineMetadata(where: {}, order_by: { createdAt: asc }) {
      id
      baselineName
      createdBy
      description
      projectName
      createdAt
      isBaseline
    }
  }
`;

export const DELETE_VERSION_BY_ID = gql`
  mutation deleteVersion($id: Int) {
    delete_scheduleBaselineMetadata(where: { id: { _eq: $id } }) {
      affected_rows
      returning {
        id
      }
    }
  }
`;

export const TASK_POPUP_DETAIL_BY_TASK_ID = gql`
  query getTaskDetails($taskId: uuid) {
    projectTask(where: { id: { _eq: $taskId } }) {
      actualEndDate
      actualStartDate
      plannedEndDate
      plannedStartDate
      floatValue
      description
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
  }
`;

export const EDIT_PROJECT_METADATA_IMPORT_TYPE = gql`
  mutation updateProjectMetaData($importType: String) {
    update_projectScheduleMetadata(
      where: {}
      _set: { importType: $importType }
    ) {
      affected_rows
    }
  }
`;

export const GET_PROJECT_IMPORT_TYPE = gql`
  query projectMetaDetailsInformation($projectId: Int) {
    projectScheduleMetadata(where: { projectId: { _eq: $projectId } }) {
      importType
    }
  }
`;
