import { gql } from '@apollo/client';

export const LOAD_PROJECT_WORKFLOW_DETAILS=gql`query getListWorkflowDetails($workflowTemplateId: Int) {
  workflowTemplate(where: {id: {_eq: $workflowTemplateId}, active: {_eq: true}}) {
    description
    id
    label
    name
    version
    active
    workflowTemplateStepDefs(where: {isDeleted: {_eq: false}}) {
      id
      description
      name
      type
      editsAllowed
      posx
      posy
      wFFromStepDefOutcomes {
        id
        startx
        starty
        endx
        endy
        fromStepDefName
        toStepDefName
        condition
        name
      }
      wFToStepDefOutcomes {
        id
        condition
        endx
        endy
        startx
        starty
        toStepDefName
        fromStepDefName
      }
    }
  }
}`;

    export const LOAD_WORKFLOW_DETAILS=gql`query getListWorkflowDetails($workflowTemplateId: Int, $tenantId: Int) {
      workflowTemplate(where: {id: {_eq: $workflowTemplateId}, 
        tenantId: {_eq: $tenantId}, isDeleted: {_eq: false},
        active: {_eq: true}}) 
        {
          description
          id
          label
          name
          tenantId
          version
          active
          workflowTemplateStepDefs(where: {isDeleted: {_eq: false}}) {
            id
            description
            name
            type
            editsAllowed
            posx
            posy
            wFFromStepDefOutcomes(where: {isDeleted: {_eq: false}}) {
              id
              startx
              starty
              endx
              endy
              fromStepDefName
              toStepDefName
              condition
              name
            }
            wFToStepDefOutcomes(where: {isDeleted: {_eq: false}}) {
              id
              condition
              endx
              endy
              startx
              starty
              toStepDefName
              fromStepDefName
            }
          }
        }
      }
      `;
  


export const LOAD_PROJECT_TEMPLATE_ASSOCIATION=gql`query getProjectFeatureAssociatedWorkflow($featureId: Int!) {
  projectTemplateAssociation(where: {featureId: {_eq: $featureId}}) {
    featureId
    templateId
    workflowTemplateId
  }
}
`;


export const CREATE_WORK_FLOW_STEP_DEF=gql`mutation createWorkflowProjectStepDef($projectId: Int,
    $stepDefName: String, $workflowTemplateId: Int, $durationInDays: Int, $featureType: Int!) {
  insert_workflowProjectStepDef(objects: {projectId: $projectId,
      stepDefName: $stepDefName, workflowTemplateId: $workflowTemplateId,
      durationInDays: $durationInDays,featureType: $featureType}) {
    affected_rows,
    returning {
      id
    }
  }
}`;

export const CREATE_WORK_FLOW_ASSIGNEES=gql`mutation createWorkflowProjectStepAssignees($object:  [workflowProjectStepAssignees_insert_input!]!) {
  insert_workflowProjectStepAssignees(objects: $object) {
    affected_rows
  }
}`;

export const FETCH_WORK_FLOW_LATEST_VERSION= gql`
query fetchLatestWorkFlowVersionId($rootTemplateId: Int) {
  workflowTemplate_aggregate(where: {_and: {rootTemplateId: {_eq: $rootTemplateId}, active: {_eq: true}}}) {
    aggregate {
      max {
        id
      }
    }
  }
}`;

export const FETCH_WORK_FLOW_DURATION_ASSIGNEE=gql`query fetchWorkFlowFeatureDurationAndAsssigniee($featureType: Int!,
   $workflowTemplateId: Int!, $projectId: Int!) {
  workflowProjectStepDef(where: {featureType: {_eq: $featureType}, workflowTemplateId: {_eq: $workflowTemplateId},
   workflowTemplateStepDef: {isDeleted: {_eq: false}}, projectId: {_eq: $projectId}}, distinct_on: stepDefName) {
    id
    stepDefName
    durationInDays
    workflowTemplateStepDef {
      type
    }
    workflowProjectStepAssignees(where: {isDeleted: {_eq: false}}) {
      user {
        firstName
        lastName
        email
      }
      assignee
    }
  }
}
`;

export const FETCH_PROJECT_WORK_FLOW_DURATION_ASSIGNEE=gql`query fetchWorkFlowDurationAndAsssigniee($featureType: Int!, $workflowTemplateId: Int!) {
  workflowProjectStepDef(where: {featureType: {_eq: $featureType}, workflowTemplateId: {_eq: $workflowTemplateId}}, distinct_on: stepDefName) {
    id
    stepDefName
    durationInDays
    workflowTemplateStepDef {
      type
    }
    workflowProjectStepAssignees(where: {isDeleted: {_eq: false}}) {
      user {
        firstName
        lastName
        email
      }
      assignee
    }
  }
}`;

export const UPDATE_WORK_FLOW_STEP_DURATION=gql`mutation updateStepDuration($stepDefName: String!, $durationInDays: Int!, $workflowTemplateId: Int!) {
  update_workflowProjectStepDef(
    where: {_and: {stepDefName: {_eq: $stepDefName}, workflowTemplateId: {_eq: $workflowTemplateId}}}
    _set: {durationInDays: $durationInDays}
  ) {
    affected_rows
    __typename
  }
}`;

export const DELETE_STEP_ASSIGNEE=gql`mutation deleteStepAssignee($assignee: uuid!,$stepDefName: Int!) {
  update_workflowProjectStepAssignees(where: {wfProjectStepDefId: {_eq: $stepDefName}, assignee: {_eq: $assignee}}) {
    affected_rows
  }
}`;


export const FETCH_WORK_FLOW_FEATURE=gql`
query fetchWorkflowFeatureDetails($featureType: String!, $featureName: String!, $projectId: Int!) {
  workflowTemplate(where: {_and: {workflowFeatureStepDefs: {featureType: {_eq: $featureType}, 
    featureName: {_eq: $featureName}, projectId: {_eq: $projectId}}}}) {
    description
    id
    label
    name
    tenantId
    version
    workflowFeatureStepDefs(where: {featureName: {_eq: $featureName}, featureType: {_eq: $featureType}, projectId: {_eq: $projectId}}) {
      workflowTemplateStepDef {
        type
      }
      stepDefName
      durationInDays
      workflowFeatureStepAssignees(where: {isDeleted: {_eq: false}}) {
        assignee
        user {
          email
          firstName
          lastName
        }
      }
    }
    workflowTemplateStepDefs(where:{isDeleted:{_eq: false}})  {
      id
      description
      name
      type
      editsAllowed
      posx
      posy
      wFFromStepDefOutcomes(where:{isDeleted: {_eq: false}}) {
        id
        startx
        starty
        endx
        endy
        fromStepDefName
        toStepDefName
        condition
        name
      }
      wFToStepDefOutcomes(where:{isDeleted: {_eq: false}}) {
        id
        condition
        endx
        endy
        startx
        starty
        toStepDefName
        fromStepDefName
      }
    }
  }
}`;