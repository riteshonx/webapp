import { gql } from "@apollo/client";


export const LOAD_FILTERS_LIST_FORM = gql`
  query getFilterListForms(
    $featureId: Int!
    $filterData: [json]
    $limit: Int!
    $offset: Int!
    $order: String!
    $orderBy: String!
  ) {
    listForms_query(
      featureId: $featureId
      filterData: $filterData
      workflowStep: true
      limit: $limit
      offset: $offset
      orderBy: { column: $orderBy, order: $order }
    ) {
      count
      data {
        formsData
        formState
        id
        specificationId
        submittalId
        blockedByCounter
        workflowData
      }
    }
  }
`;


export const GET_FORM_DETAIL_BY_FORM_ID = gql`query getFormDetails($formId: Int) {
  forms(where: {id: {_eq: $formId}}) {
    id
    featureId
    blockedByCounter
    clientId
    lastSyncDate
    workflowEnabled
    templateVersionId
    formState
    status
    formStatus {
      id
      status
    }
    formsData {
      caption
      elementId
      typeId
      valueBool
      valueDate
      valueInt
      valuePoint
      valueString
      valueTime
      typeId
    }
    createdByUser {
      id
      firstName
      lastName
    }
    dueDate
    projectAutoIncrement
    updatedByUser {
      id
      firstName
      lastName
    }
    updatedAt
    createdAt
    completedAt
    costImpact
    costImpactComments
    scheduleImpact
    scheduleImpactComments
    completedByUser {
      id
      firstName
      lastName
    }
  }
  formsUserLists: formsUserList(where: {formInstanceId: {_eq: $formId}}){
    user{
      firstName
      lastName
    }
    formTemplateFieldData{
      caption
      fieldTypeId
      elementId
    }
  }
	formsConfigLists: formsConfigList(where: {formInstanceId: {_eq: $formId}}){
    elementId
    configValue
    formTemplateFieldData{
      caption
      elementId
      
    }
  }
  formsLocationLists: formsLocationList(where: {formInstanceId: {_eq: $formId}}) {
      locationReferenceId
      locationValue
      formTemplateFieldData {
        caption
        elementId
        fieldTypeId
      }
    }
  formsCompanyLists: formsCompanyList(where: {formInstanceId: {_eq: $formId}}) {
      tenantCompanyAssociation {
        id
        name
      }
      formTemplateFieldData {
        caption
        elementId
        fieldTypeId
      }
    }
  formsAttachmentList: formsAttachmentList(where: {formInstanceId: {_eq: $formId}}) {
      elementId
      attachment {
        blobKey
        fileName
        fileSize
        fileType
      }
      formTemplateFieldDatum {
        caption
        fieldTypeId
      }
    }
  formsFollowers: formsFollower(where: {formInstanceId: {_eq: $formId}}){
    user{
        id
        firstName
        lastName
      }
  }
  formTaskLinks: linkFormTask(where: {formId: {_eq: $formId}}) {
      linkType {
        name
      }
      projectTask {
        id
        taskName
      }
    }
  formsSpecLists: formsSpecList(where: {formInstanceId: {_eq: $formId}}){
    specificationId
    sequenceId
  } 
  historyEvents: history(order_by: {createdAt: desc}, where: {field: {_eq: "status"}, formFeatureId: {_eq: $formId}}) {
      field
      oldValue
      newValue
      createdAt
    }
}
`
export const GET_BUDGET_CHANGE_ORDER_FORM_BY_ID = gql`
query budgetChangeOrderForm ($id:Int) {
  changeOrder(where: {id: {_eq: $id}}) {
    approvedAmount
    budgetLineItemTitle
    classificationCode
    dateOfRequest
    description
    estimatedAmount
    changeOrderNumber
    linkedActivity
    linkedBudget
    linkedForms
    location
    quotedAmount
    reasonForChange
    status
    substantiation
    tenantId
    title
    trade
    type
  }
}
`

export const GET_BUDGET_LINE_ITEM = gql`
query GetBudgetLineItem($budgetLineItemTitle:String) {
  projectBudget(where: {budgetLineItemTitle: {_eq: $budgetLineItemTitle}}) {
    UOM
    allowance
    budgetLineItemTitle
    classificationCode
    contingency
    classificationCodeId
    costType
    country
    currency
    date
    externalId
    description
    modificationAmount
    originalBudgetAmount
    totalBudget
    totalCost
  }
}

`

export const ISSUE_FORM_DETAIL_BY_ID = gql`query getFormDetails($formId: Int) {
  forms(where: {id: {_eq: $formId}}) {
    id
    featureId
    blockedByCounter
    clientId
    lastSyncDate
    workflowEnabled
    templateVersionId
    formState
    status
    formStatus {
      id
      status
    }
    formsData {
      fieldType{
        fieldType
      }
      caption
      elementId
      typeId
      valueBool
      valueDate
      valueInt
      valuePoint
      valueString
      valueTime
      typeId
    }
    createdByUser {
      id
      firstName
      lastName
    }
    dueDate
    projectAutoIncrement
    updatedByUser {
      id
      firstName
      lastName
    }
    updatedAt
    createdAt
    completedAt
    costImpact
    costImpactComments
    scheduleImpact
    scheduleImpactComments
    completedByUser {
      id
      firstName
      lastName
    }
  }
  formsUserLists: formsUserList(where: {formInstanceId: {_eq: $formId}}){
    user{
      firstName
      lastName
    }
    formTemplateFieldData{
      caption
      fieldTypeId
      elementId
    }
  }
	formsConfigLists: formsConfigList(where: {formInstanceId: {_eq: $formId}}){
    elementId
    configValue
    formTemplateFieldData{
      caption
      elementId
      
    }
  }
  formsLocationLists: formsLocationList(where: {formInstanceId: {_eq: $formId}}) {
      locationReferenceId
      locationValue
      formTemplateFieldData {
        caption
        elementId
        fieldTypeId
      }
    }
  formsCompanyLists: formsCompanyList(where: {formInstanceId: {_eq: $formId}}) {
      tenantCompanyAssociation {
        id
        name
      }
      formTemplateFieldData {
        caption
        elementId
        fieldTypeId
      }
    }
  formsAttachmentList: formsAttachmentList(where: {formInstanceId: {_eq: $formId}}) {
      elementId
      attachment {
        blobKey
        fileName
        fileSize
        fileType
      }
      formTemplateFieldDatum {
        caption
        fieldTypeId
      }
    }
  formsFollowers: formsFollower(where: {formInstanceId: {_eq: $formId}}){
    user{
        id
        firstName
        lastName
      }
  }
  formTaskLinks: linkFormTask(where: {formId: {_eq: $formId}}) {
      linkType {
        name
      }
      projectTask {
        id
        taskName
      }
    }
  formsSpecLists: formsSpecList(where: {formInstanceId: {_eq: $formId}}){
    specificationId
    sequenceId
  } 
  historyEvents: history(order_by: {createdAt: desc}, where: {field: {_eq: "status"}, formFeatureId: {_eq: $formId}}) {
      field
      oldValue
      newValue
      createdAt
    }
  formIssueLogs: formIssueLog(where: {formInstanceId: {_eq: $formId}}){
    elementId
    assigneeRole
    assigneeUser
    assigneeCompany
    creator
    linkedForms
  }
}`

export const GET_DAILY_LOG_DETAILS = gql`
query getDailyLog($taskId: uuid) {
  edw_insight_daily_log_detail_audit_tbl(where: {taskId: {_eq: $taskId}}) {
    actualDuration
    actual_productivity
    actual_uom
    dailylog_status
    totalTimeToDate
    installedQuantity
    percentageProgress
    plannedDuration
    plannedLabourHour
    plannedQuantity
    planned_productivity
    value_metric_date
  }
  edw_insight_daily_log_detail_history_tbl(where: {taskId: {_eq: $taskId}}){
    actualDuration
    actual_productivity
    actual_uom
    dailylog_status
    totalTimeToDate
    installedQuantity
    percentageProgress
    plannedDuration
    plannedLabourHour
    plannedQuantity
    planned_productivity
    value_metric_date
  }
  projectTaskPartialUpdate(where: {taskId: {_eq: $taskId}, isDeleted: {_neq: true}}){
    status
  }
}
`