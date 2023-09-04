import { gql } from "@apollo/client";

export const TENANT_USERS = gql`
  query getAllTenantUsers($limit: Int!, $offset: Int!) {
    tenantAssociation(offset: $offset, limit: $limit) {
      status
      user {
        id
        email
        firstName
        lastName
        jobTitle
        phone
      }
    }
  }
`;

export const FETCH_PROJECT_ASSOCIATED_USERS = gql`
  query fetchProjectAssociatedUsers($projectId: Int!) {
    projectAssociation(
      where: { projectId: { _eq: $projectId }, status: { _neq: 1 } }
    ) {
      user {
        email
        firstName
        id
        lastName
        phone
      }
      status
      role
    }
  }
`;

export const GET_PRODUCTIVITY_METRIC = gql`
  query GetProductvityMetric(
    $dimension: String
    $classificationCodeId: Int
    $taskId: uuid = ""
  ) {
    ProductivityMetrics: productivityMetrics(
      where: {
        dimension: { _eq: $dimension }
        classificationCodeId: { _eq: $classificationCodeId }
        taskId: { _eq: $taskId }
      }
    ) {
      actualProductivity
      actualQty
      actualHrs
      plannedHrs
      plannedProductivity
      plannedQty
      projectedHrs
      requiredProductivity
      taskId
      classificationCodeId
      classificationCode {
        classificationCode
        classificationCodeName
        UOM
      }
    }
  }
`;

export const GET_PRODUCTIVITY_PROJECT_INFO = gql`
  query GetProductvityProjectInfo(
    $dimension: String
    $classificationCode: String
    $taskId: uuid = ""
  ) {
    ProductivityMetrics: productivityMetrics(
      where: {
        dimension: { _eq: $dimension }
        classificationCode: { classificationCode: { _eq: $classificationCode } }
        taskId: { _eq: $taskId }
      }
    ) {
      taskId
      classificationCodeId
      project {
        name
      }
      projectTask {
        taskName
      }
      classificationCode {
        classificationCode
        classificationCodeName
      }
    }
  }
`;

export const GET_LABOUR_HRS_VS_QTY = gql`
  query LabourHrsvsQty(
    $dimension: String
    $taskId: uuid
    $classificationCodeId: Int
  ) {
    ProductivityMetrics: productivityMetrics(
      where: {
        dimension: { _eq: $dimension }
        taskId: { _eq: $taskId }
        classificationCodeId: { _eq: $classificationCodeId }
      }
      order_by: { dailylogDate: asc }
    ) {
      dailylogDate
      actualHrs
      actualQty
      variancesCount
      classificationCode {
        UOM
      }
    }
  }
`;

export const GET_LABOUR_PROJECTED_HRS_VS_QTY = gql`
  query LabourHrsProjectedvsQty(
    $dimension: String
    $taskId: uuid
    $classificationCodeId: Int
  ) {
    ProductivityMetrics: productivityMetrics(
      where: {
        dimension: { _eq: $dimension }
        taskId: { _eq: $taskId }
        classificationCodeId: { _eq: $classificationCodeId }
      }
    ) {
      plannedHrs
      plannedQty
      projectedHrs
    }
  }
`;

export const GET_DAILY_PRODUCTIVITY_METRIC = gql`
  query DailyProductivityDetails(
    $dimension: String
    $classificationCodeId: Int
    $taskId: uuid
  ) {
    ProductivityMetrics: productivityMetrics(
      where: {
        dimension: { _eq: $dimension }
        classificationCodeId: { _eq: $classificationCodeId }
        taskId: { _eq: $taskId }
      }
      order_by: { dailylogDate: asc }
    ) {
      dailylogDate
      classificationCode {
        classificationCode
        classificationCodeName
        UOM
      }
      variancesCount
      dailyQty
      dailyHrs
      dailyProductivity
      actualQty
      actualHrs
      actualProductivity
    }
  }
`;

export const GET_ALL_IMPACTED_SCHEDULE_BY_TASK_ID = gql`
  query getAllImpactedScheduleByTaskId($taskId: uuid) {
    projectTask(where: { id: { _eq: $taskId } }) {
      classificationCodeId
      projectScheduleImpactInsights {
        isDeleted
        messages_web
        priority
        taskId
        type
      }
      freeFloatValue
      floatValue
    }
  }
`;

export const GET_ALL_IMPACTED_SCHEDULE_BY_CLASSIFICATION_CODE = gql`
  query getAllImpactedScheduleByClassificationCode($classificationCodeId: Int) {
    projectTask(
      where: { classificationCodeId: { _eq: $classificationCodeId } }
    ) {
      classificationCodeId
      floatValue
      projectScheduleImpactInsights {
        isDeleted
        messages_web
        priority
        taskId
        type
      }
    }
  }
`;

export const GET_ALL_RELATED_ITEM = gql`
  query getRelatedItems($taskId: uuid, $classificationCodeId: Int) {
    ProjectTasks: projectTask(
      where: {
        id: { _eq: $taskId }
        classificationCodeId: { _eq: $classificationCodeId }
      }
    ) {
      id
      taskName
      status
      productivityMetrics(where: { dimension: { _eq: "TASK" } }) {
        actualProductivity
      }
      formTaskLinks(where: {form: {deleted: {_eq: false}}}) {
        formId
        form {
          formsData(
            where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
          ) {
            valueString
          }
          projectFeature {
            feature
          }
          formStatus {
            status
          }
        }
      }
      attachments(where: { fileType: { _like: "image%" } }) {
        createdAt
        tenantAssociation {
          user {
            firstName
            lastName
          }
        }
        fileName
        fileSize
        fileType
        blobKey
      }
      taskTimesheetEntries {
        attachments(where: { fileType: { _like: "image%" } }) {
          createdAt
          tenantAssociation {
            user {
              firstName
              lastName
            }
          }
          fileName
          fileSize
          fileType
          blobKey
        }
      }
    }
  }
`;

export const GET_DAILY_TASK_LIST = gql`
  query getProjectDetails(
    $projectId: Int
    $tenantId: Int
    $taskId: uuid
    $classificationCodeId: Int
    $dailylogDate: date
  ) {
    projectTask(
      where: {
        id: { _eq: $taskId }
        classificationCodeId: { _eq: $classificationCodeId }
        productivityMetrics: {
          dailylogDate: { _eq: $dailylogDate }
          dimension: { _eq: "DAILYTASK" }
        }
      }
    ) {
      tenantId
      id
      taskName
      productivityMetrics(
        where: {
          dailylogDate: { _eq: $dailylogDate }
          dimension: { _eq: "DAILYTASK" }
        }
      ) {
        classificationCode {
          classificationCode
          classificationCodeName
          UOM
        }
        variancesCount
        dailyQty
        dailyHrs
        dailyProductivity
        actualQty
        actualHrs
        actualProductivity
      }
      taskTimesheetEntries(order_by: { updatedAt: desc }) {
        userLogId
        updatedAt
        comments(order_by: { updatedAt: desc }, limit: 1) {
          comment
        }
        attachments {
          blobKey
          createdAt
          createdBy
          deleted
          fileName
          fileSize
          fileType
          id
          taskId
        }
      }
      projectTaskVariances(
        where: { varianceName: { _neq: null } }
        order_by: { updatedAt: desc }
        limit: 1
      ) {
        updatedAt
        varianceName
        category
      }
      formTaskLinks(
        where: {form: {deleted: {_eq: false}}}
        order_by: {form: {createdAt: desc}}
      ) {
        formId
        form {
          formsData(
            where: { formTemplateFieldData: { caption: { _eq: "Subject" } } }
          ) {
            valueString
          }
          projectFeature {
            feature
          }
          formStatus {
            status
          }
        }
      }
    }
  }
`;
