import { gql } from "@apollo/client";
import {
  TenantCompany,
  ProjectAssociationUsers,
  ProjectsUsers,
} from "../models/dataModels";

export const LOAD_CONFIGURATION_LIST_VALUES = gql`
  query getCustomList($ConfigListID: Int) {
    configurationValues(where: { configListId: { _eq: $ConfigListID } }) {
      id
      nodeName
      parentId
    }
  }
`;

export const LOAD_CONFIGURATION_LIST_VALUES_CREATE = gql`
  query fetchCustomList($id: [Int!], $projectId: Int!) {
    configurationLists(where: { id: { _in: $id } }) {
      id
      name
      configurationValues(order_by: { nodeName: asc }) {
        id
        nodeName
        parentId
      }
      projectConfigAssociations(where: { projectId: { _eq: $projectId } }) {
        configValueId
      }
    }
  }
`;

export const LOAD_CONFIGURATION_LIST_BY_NAME = gql`
  query getCustomListByName($name: String) {
    configurationLists(where: { name: { _eq: $name } }) {
      name
      id
    }
  }
`;

// load company details
export const LOAD_TENANT_COMPANY = gql`query getCompanyLists($limit: Int, $offset: Int) {
  ${TenantCompany.modelName}(limit: $limit, offset: $offset) {
    ${TenantCompany.selector.id}
    ${TenantCompany.selector.name}
    ${TenantCompany.selector.active}
  }
}
`;

export const LOAD_PROJECT_USERS = gql`
  query getProjectUsers($name: String!) {
    user(
      where: {
        _or: [
          { lastName: { _ilike: $name } }
          { email: { _ilike: $name } }
          { firstName: { _ilike: $name } }
        ]
      }
    ) {
      email
      firstName
      id
      lastName
      status
    }
  }
`;
