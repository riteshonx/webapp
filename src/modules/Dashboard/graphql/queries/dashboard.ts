import { gql } from "@apollo/client";

export const FETCH_TENANT_DETAILS = gql`
  query fetchTenantDetails {
    tenant {
      name
      productionCenterEnabled
    }
  }
`;

export const UPDATE_TENANT_DETAILS = gql`
  mutation updateTenantRoleStatus($productionCenterEnabled: Boolean!) {
    update_tenant(
      where: {}
      _set: { productionCenterEnabled: $productionCenterEnabled }
    ) {
      affected_rows
    }
  }
`;

export const GET_TENANT_ROLE = gql`
  query getTenantRole($userId: uuid!) {
    tenantAssociation(where: { userId: { _eq: $userId } }) {
      roleByRole {
        role
      }
    }
  }
`;

export const GET_PROJECT_PARENT_LOCATION_NODE = gql`
  query fetchProjectLocationTree($status: [Int!]) {
    projectLocationTree(where: { parentId: { _is_null: true } }) {
      nodeName
      parentId
      id
      childNodes {
        id
        nodeName
        childNodes {
          id
          formsLocationLists(where: { form: { status: { _in: $status } } }) {
            form {
              id
            }
          }
        }
        formsLocationLists(where: { form: { status: { _in: $status } } }) {
          form {
            id
          }
        }
      }
    }
  }
`;

export const GET_PROJECT_LOCATION_NODE = gql`
  query fetchProjectLocationTree($id: uuid!) {
    projectLocationTree(where: { id: { _eq: $id } }) {
      id
      nodeName
      parentId
      childNodes {
        id
        nodeName
      }
      locationByParentId {
        id
        nodeName
        childNodes {
          id
          nodeName
        }
      }
    }
  }
`;

export const GET_LOCATION_TREE_BY_ID = gql`
  query fetchListForm($id: uuid!, $status: [Int!]) {
    projectLocationTree(where: { id: { _eq: $id } }) {
      id
      nodeName
      parentId
      formsLocationLists(where: { form: { status: { _in: $status } } }) {
        form {
          id
        }
      }
      childNodes {
        id
        nodeName
        formsLocationLists(where: { form: { status: { _in: $status } } }) {
          form {
            id
          }
        }
      }
    }
  }
`;

export const FETCH_PUNCHLIST_FORMS = gql`
  query fetchListForm(
    $featureId: Int!
    $status: [Int!]
    $configId: uuid!
    $offset: Int!
    $limit: Int!
  ) {
    forms_aggregate(
      where: {
        featureId: { _eq: $featureId }
        status: { _in: $status }
        formsLocationLists: { locationReferenceId: { _eq: $configId } }
      }
    ) {
      aggregate {
        count
      }
    }
    forms(
      limit: $limit
      offset: $offset
      where: {
        featureId: { _eq: $featureId }
        status: { _in: $status }
        formsLocationLists: { locationReferenceId: { _eq: $configId } }
      }
      order_by: { updatedAt: desc }
    ) {
      id
      status
      updatedAt
      metadata
      createdByUser {
        firstName
        email
        lastName
      }
      formStatus {
        id
        status
      }
      formsLocationLists {
        elementId
        formInstanceId
        locationReferenceId
        locationValue
        formTemplateFieldData {
          caption
          elementId
        }
        formLocationValue {
          parentId
          nodeName
          id
        }
      }
      formsData {
        caption
        valueDate
      }
      childForms(limit: 1) {
        id
        status
        formsConfigLists {
          configValue
          configReferenceId
          elementId
          formTemplateFieldData {
            caption
            elementId
          }
          configurationValue {
            nodeName
          }
        }
        formsData(distinct_on: caption) {
          elementId
          valueBool
          valueString
          caption
        }
        attachments(where: { deleted: { _eq: false } }) {
          blobKey
          fileName
          fileSize
          fileType
        }
      }
    }
  }
`;

export const FETCH_PUNCHLIST_FORMS_BY_ID = gql`
  query fetchListForm(
    $featureId: Int!
    $status: [Int!]
    $formId: Int!
    $offset: Int!
    $limit: Int!
  ) {
    forms_aggregate(
      where: {
        featureId: { _eq: $featureId }
        status: { _in: $status }
        id: { _eq: $formId }
      }
    ) {
      nodes {
        childForms_aggregate {
          aggregate {
            count
          }
        }
      }
    }
    forms(
      where: {
        featureId: { _eq: $featureId }
        status: { _in: $status }
        id: { _eq: $formId }
      }
      order_by: { updatedAt: desc }
    ) {
      childForms(limit: $limit, offset: $offset) {
        id
        status
        formsConfigLists {
          configValue
          configReferenceId
          elementId
          formTemplateFieldData {
            caption
            elementId
          }
          configurationValue {
            nodeName
          }
        }
        formsData(distinct_on: caption) {
          elementId
          valueBool
          valueString
          caption
        }
        attachments(where: { deleted: { _eq: false } }) {
          blobKey
          fileName
          fileSize
          fileType
        }
        metadata
      }
    }
  }
`;

export const UPDATE_PUNCHLIST_FORM_STATUS = gql`
  mutation MyMutation($status: String!, $formId: Int!) {
    update_forms(
      where: { id: { _eq: $formId } }
      _set: { metadata: { status: $status } }
    ) {
      affected_rows
      returning {
        id
        metadata
      }
    }
  }
`;

export const GET_CLOSED_INSPECTION_FORMS = gql`
  query getClosedInspectionForms($formId: Int!, $status: String!) {
    qcforms(where: { parentId: { _eq: $formId }, status: { _neq: $status } }) {
      id
    }
  }
`;

export const GET_PROJECT_PHASES = gql`
  query getProjectPhases {
    projectPhase {
      id
      name
      description
      parentId
    }
  }
`;

export const GET_PROJECT_PHASES_BY_PROJECTID = gql`
  query getProjectPhaseDetails($projectId: Int!) {
    projectPhaseDetails(
      where: { projectId: { _eq: $projectId }, deleted: { _eq: false } }
    ) {
      projectId
      projectPhase {
        id
        name
        description
      }
      deleted
    }
  }
`;

export const SET_PROJECT_PHASES = gql`
  mutation insertProjectPhaseDetails(
    $projectPhases: [projectPhaseDetails_insert_input!]!
  ) {
    insert_projectPhaseDetails(
      objects: $projectPhases
      on_conflict: {
        constraint: projectPhaseDetails_pkey
        update_columns: [deleted, updatedAt]
      }
    ) {
      returning {
        projectId
        phaseId
      }
    }
  }
`;

export const GET_PERSONAS = gql`
  query getPersonas {
    persona {
      id
      name
      description
    }
  }
`;

export const GET_USER_PERSONA = gql`
  query getPersonas($userId: uuid!, $projectId: Int!) {
    projectAssociation(
      where: { userId: { _eq: $userId }, projectId: { _eq: $projectId } }
    ) {
      personaId
      persona {
        name
      }
      role
      status
    }
  }
`;

export const UPDATE_USER_PERSONA = gql`
  mutation updateUserPersona(
    $personaId: Int!
    $userId: uuid!
    $projectId: Int!
  ) {
    update_projectAssociation(
      _set: { personaId: $personaId }
      where: { userId: { _eq: $userId }, projectId: { _eq: $projectId } }
    ) {
      returning {
        userId
        role
        personaId
      }
    }
  }
`;

export const GET_PROJECT_MILESTONE = gql`
  query getProjectMilestone($id: Int!) {
    projectTask(
      where: {
        _and: { projectId: { _eq: $id } }
        taskType: { _in: ["milestone", "wbs"] }
      }
    ) {
      plannedDuration
      plannedEndDate
      taskType
      plannedStartDate
      taskName
      status
      id
      actualStartDate
      actualEndDate
    }
  }
`;

export const GET_CONNECTORS_DETAILS = gql`
  query getConnectorsData(
    $tenantId: Int!
    $sourceSystem: [String!]
    $projectId: Int!
  ) {
    connectorsDashboard_query(
      projectId: $projectId
      tenantId: $tenantId
      sourceSystem: $sourceSystem
    ) {
      connectedSystem
      artifactsIngested
      count
      status
      lastSyncDate
      featureId
      sourceProject
    }
  }
`;
