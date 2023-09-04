import { gql } from "@apollo/client";

export const FETCH_LIST_WORKFLOWS = gql`
  query fetchWorkflowTemplateList {
    workflowTemplate(
      where: { isDeleted: { _eq: false }, active: { _eq: true } }
      order_by: { updatedAt: desc, createdAt: desc }
    ) {
      id
      name
      tenantId
      description
      version
      updatedAt
      createdAt
      rootTemplateId
      isDefault
      wfTemplateCreatedByUser {
        firstName
        lastName
      }
      wfTemplateUpdatedByUser {
        firstName
        lastName
      }
    }
  }
`;

export const DELETE_WORKFLOW_TEMPLATE = gql`
  mutation deleteWorkflowTemplate($id: Int) {
    update_workflowTemplate(
      where: {
        id: { _eq: $id }
        isDeleted: { _eq: false }
        isDefault: { _eq: false }
      }
      _set: { isDeleted: true }
    ) {
      returning {
        id
      }
    }
  }
`;

export const UPDATE_ACTIVE_STATUS_FOR_CLONED_TEMPLATE = gql`
  mutation updateActiveStatusForVersioningWFTemplate(
    $workflowTemplateId: Int
    $workflowName: String
    $version: Int
    $parentId: Int
    $rootTemplateId: Int
    $isDefaultWorkflow: Boolean
  ) {
    update_workflowTemplate(
      where: {
        id: { _eq: $workflowTemplateId }
        active: { _eq: true }
        isDeleted: { _eq: false }
      }
      _set: { active: false }
    ) {
      returning {
        id
        rootTemplateId
      }
    }
    insert_workflowTemplate(
      objects: {
        parentTemplateId: $parentId
        version: $version
        name: $workflowName
        rootTemplateId: $rootTemplateId
        isDefault: $isDefaultWorkflow
      }
    ) {
      returning {
        id
        name
      }
    }
  }
`;

export const FETCH_LIST_USERS_BY_ID_LIST = gql`
  query queryUserByIdList($userIdArray: [uuid!]) {
    user(where: { id: { _in: $userIdArray } }) {
      email
      firstName
      id
      jobTitle
      lastName
    }
  }
`;

export const FETCH_WORKFLOW_DETAILS = gql`
  query getListWorkflowDetails($workflowTemplateId: Int) {
    workflowTemplate(
      where: {
        id: { _eq: $workflowTemplateId }
        isDeleted: { _eq: false }
        active: { _eq: true }
      }
    ) {
      description
      id
      label
      name
      tenantId
      version
      workflowTemplateStepDefs {
        id
        description
        name
        type
        editsAllowed
        isDeleted
        wFFromStepDefOutcomes {
          id
          name
          fromStepDefName
          toStepDefName
          endx
          endy
          startx
          starty
          condition
          isDeleted
        }
        posx
        posy
      }
    }
  }
`;

export const FETCH_WORKFLOW_LIST_BY_NAME = gql`
  query getListWorkflowListByName($workflowName: String) {
    workflowTemplate(
      where: {
        name: { _eq: $workflowName }
        active: { _eq: true }
        isDeleted: { _eq: false }
      }
    ) {
      name
      id
    }
  }
`;

export const FETCH_RUNTIME_INFO_DATA_FOR_WF_TEMPLATE_ID = gql`
  query getWFRuntimeInfoByWFTemplateId($workflowTemplateId: Int) {
    workflowRuntimeInfo(
      where: { workflowTemplateId: { _eq: $workflowTemplateId } }
    ) {
      workflowTemplateId
    }
  }
`;

export const CREATE_WORKFLOW_TEMPLATE_DEFINITION = gql`
  mutation createWorkflowTemplateDefinition($workflowName: String) {
    insert_workflowTemplate(objects: { name: $workflowName }) {
      returning {
        id
      }
    }
  }
`;

export const CREATE_STEPS_AND_OUTCOMES = gql`
  mutation createWorkflowStepsAndOutcomes(
    $outcomesToInsert: [workflowTemplateStepOutcome_insert_input!]!
    $stepsToInsert: [workflowTemplateStepDef_insert_input!]!
  ) {
    insert_workflowTemplateStepDef(objects: $stepsToInsert) {
      returning {
        id
        name
      }
    }
    insert_workflowTemplateStepOutcome(objects: $outcomesToInsert) {
      returning {
        id
        name
      }
    }
  }
`;

export const UPDATE_WORKFLOW_TEMPLATE = gql`
  mutation updateWorkflowTemplate(
    $workflowTemplateId: Int
    $templateConfig: workflowTemplate_set_input
  ) {
    update_workflowTemplate(
      where: { id: { _eq: $workflowTemplateId } }
      _set: $templateConfig
    ) {
      returning {
        id
        name
      }
    }
  }
`;

export const UPDATE_WORKFLOW_STEPS = gql`
  mutation updateWorkflowSteps(
    $workflowTemplateId: Int
    $stepId: Int
    $stepsToUpdate: workflowTemplateStepDef_set_input
  ) {
    update_workflowTemplateStepDef(
      where: {
        workflowTemplateId: { _eq: $workflowTemplateId }
        id: { _eq: $stepId }
      }
      _set: $stepsToUpdate
    ) {
      returning {
        id
        name
      }
    }
  }
`;

export const UPDATE_WORKFLOW_OUTCOMES = gql`
  mutation updateWorkflowOutcomes(
    $workflowTemplateId: Int
    $outcomeId: Int
    $outcomesToUpdate: workflowTemplateStepOutcome_set_input
  ) {
    update_workflowTemplateStepOutcome(
      where: {
        workflowTemplateId: { _eq: $workflowTemplateId }
        id: { _eq: $outcomeId }
      }
      _set: $outcomesToUpdate
    ) {
      returning {
        id
        name
      }
    }
  }
`;

export const DELETE_WORKFLOW_STEPS_AND_OUTCOMES = gql`
  mutation deleteWorkflowStepsAndOutcomes(
    $id: Int!
    $workflowTemplateId: Int!
    $fromStepDefName: String
  ) {
    delete_workflowTemplateStepOutcome(
      where: {
        fromStepDefName: { _eq: $fromStepDefName }
        workflowTemplateId: { _eq: $workflowTemplateId }
      }
    ) {
      returning {
        fromStepDefName
      }
    }
    delete_workflowTemplateStepDef(where: { id: { _eq: $id } }) {
      returning {
        id
      }
    }
  }
`;
