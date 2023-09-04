import { gql } from "@apollo/client";

// to fetch form association details
export const FETCH_PROJECT_TEMPLATE_ASSOCIATION = gql`
  query getFormAssociation(
    $limit: Int
    $offset: Int!
    $searchFormText: String
    $projectId: Int!
  ) {
    projectTemplateAssociation(
      limit: $limit
      offset: $offset
      order_by: { projectFeature: { caption: asc } }
      where: {
        project: { id: { _eq: $projectId } }
        projectFeature: { caption: { _ilike: $searchFormText } }
      }
    ) {
      workflowEnabled
      formTemplate {
        featureId
        id
        templateName
        projectFeature {
          feature
          caption
        }
      }
      workflowTemplate {
        id
        name
      }
    }
  }
`;

export const FETCH_CUSTOM_LIST_DETAIL = gql`
  query fetchCustomList($id: Int) {
    configurationLists(where: { id: { _eq: $id } }) {
      id
      name
      configurationValues {
        id
        nodeName
        parentId
      }
      projectConfigAssociations {
        configValueId
      }
    }
  }
`;

export const MUTATION_CUSTOM_LIST = gql`
  mutation customListMutation($configListId: Int, $configValueId: uuid!) {
    insert_projectConfigAssociation(
      objects: { configValueId: $configValueId, configListId: $configListId }
    ) {
      affected_rows
    }
  }
`;

export const DELETE_CUSTOM_LIST = gql`
  mutation deleteCutomList($configListId: Int, $configValueId: uuid!) {
    delete_projectConfigAssociation(
      where: {
        configListId: { _eq: $configListId }
        configValueId: { _eq: $configValueId }
      }
    ) {
      affected_rows
    }
  }
`;
