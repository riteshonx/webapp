import { gql } from "@apollo/client";

export const LOAD_CONFIGURATION_LIST_VALUES = gql`
  query fetchCustomList($name: String!) {
    configurationLists(
      where: {
        _and: [{ name: { _ilike: $name } }, { deleted: { _eq: false } }]
      }
    ) {
      id
      name
      createdAt
      updatedAt
      systemGenerated
      configurationValues(where: { deleted: { _eq: false } }) {
        parentId
        id
      }
    }
  }
`;

export const LOAD__PROJECT_CONFIGURATION_LIST_VALUES = gql`
  query fetchCustomList($name: String!, $projectId: Int!) {
    configurationLists(where: { _and: [{ name: { _ilike: $name } }] }) {
      id
      name
      createdAt
      updatedAt
      systemGenerated
      projectConfigAssociations(
        where: { project: { id: { _eq: $projectId } } }
      ) {
        configValueId
      }
      configurationValues {
        id
      }
    }
  }
`;

export const VALIDATE_CUSTOM_LIST_NAME_UNIQUE = gql`
  query fetchCustomList($name: String!) {
    configurationLists(
      where: { _and: { name: { _ilike: $name } }, deleted: { _eq: false } }
    ) {
      id
      name
    }
  }
`;

export const CREATE_CUSTOM_LIST = gql`
  mutation addNewConfigList(
    $configName: String!
    $configData: [configDataArray!]
  ) {
    insertConfiguration_mutation(
      configName: $configName
      configData: $configData
    ) {
      message
    }
  }
`;

export const LOAD_CONFIGURATION_LIST_DETAILS = gql`
  query fetchCustomListDetails($id: Int!) {
    configurationLists(where: { id: { _eq: $id } }) {
      id
      name
      createdAt
      updatedAt
      systemGenerated
      configurationValues(
        where: { deleted: { _eq: false } }
        order_by: { nodeName: asc }
      ) {
        id
        parentId
        nodeName
        deleted
      }
    }
  }
`;

export const UPDATE_CUSTOM_LIST_NAME = gql`
  mutation updateCustomListName($id: Int!, $name: String!) {
    update_configurationLists(
      where: { id: { _eq: $id } }
      _set: { name: $name }
    ) {
      affected_rows
    }
  }
`;

export const UPDATE_CUSTOM_LIST_VALUE_NAME = gql`
  mutation updateCustomListValueName($id: uuid!, $nodeName: String!) {
    update_configurationValues(
      where: { id: { _eq: $id } }
      _set: { nodeName: $nodeName }
    ) {
      affected_rows
    }
  }
`;

export const ADD_CUSTOM_LIST_VALUE = gql`
  mutation addNewListItemToCustomList(
    $object: [configurationValues_insert_input!]!
  ) {
    insert_configurationValues(objects: $object) {
      affected_rows
    }
  }
`;

export const DELETE_CONFIGURATION_LIST = gql`
  mutation deleteCustomList($id: Int!) {
    update_configurationLists(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const DELETE_CONFIGURATION_LIST_VALUE = gql`
  mutation deleteCustomListValue($id: uuid!) {
    update_configurationValues(where: { id: { _eq: $id } }) {
      affected_rows
    }
  }
`;

export const CHECK_PARENT_NODE_DUPLICATE = gql`
  query checkIfParentNode($nodeName: String!, $configListId: Int!) {
    configurationValues(
      where: {
        parentId: { _is_null: true }
        nodeName: { _ilike: $nodeName }
        configListId: { _eq: $configListId }
        deleted: { _eq: false }
      }
    ) {
      nodeName
      id
      parentId
    }
  }
`;

export const CHECK_CHILD_NODE_DUPLICATE = gql`
  query checkIfParentNode(
    $parentId: uuid!
    $nodeName: String!
    $configListId: Int!
  ) {
    configurationValues(
      where: {
        parentId: { _eq: $parentId }
        nodeName: { _ilike: $nodeName }
        configListId: { _eq: $configListId }
      }
    ) {
      nodeName
      id
      parentId
    }
  }
`;
