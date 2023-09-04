import { gql } from "@apollo/client";
import { TenantRole, ProjectRole } from "../models/role";

export const LOAD_TENANT_ROLE = gql`
        query fetchTenantRole($offset: Int!, $limit: Int!, $searchText: String!) { 
            ${TenantRole.modelName}(offset: $offset, 
                limit: $limit,
                where:{
                    ${TenantRole.selector.role}: {_ilike: $searchText },
                    ${TenantRole.selector.deleted}: {_eq: false}
                },order_by: {${TenantRole.selector.role}: asc}) {
                    ${TenantRole.selector.id}
                    ${TenantRole.selector.role}
                    ${TenantRole.selector.updatedAt}
                    ${TenantRole.selector.createdAt}
                    ${TenantRole.selector.description}
                    ${TenantRole.selector.tenantId}
            }
        }`;

export const LOAD_TENANT_ROLE_BY_NAME = gql`
        query fetchTenantRoleByName($name: String!) { 
            ${TenantRole.modelName}(
                where:{
                    ${TenantRole.selector.role}: {_ilike: $name },
                    ${TenantRole.selector.deleted}: {_eq: false}
                }) {
                    ${TenantRole.selector.id}
                    ${TenantRole.selector.role}
            }
        }`;

export const LOAD_PROJECT_ROLES = gql`
        query fetchProjectRoles($offset: Int!, $limit: Int!, $searchText: String!) { 
            ${ProjectRole.modelName}(offset: $offset, 
                limit: $limit,
                where:{
                    ${ProjectRole.selector.role}: {_ilike: $searchText}
                },
                order_by: {${ProjectRole.selector.role}: asc}){
                    ${ProjectRole.selector.id}
                    ${ProjectRole.selector.role}
                    ${ProjectRole.selector.deleted}
                    ${ProjectRole.selector.updatedAt}
                    ${ProjectRole.selector.createdAt}
                    ${ProjectRole.selector.description}
                    ${ProjectRole.selector.systemGenerated}
            }
        }`;

export const LOAD_PROJECT_ROLES__PROJECT__ASSOCIATION = gql`
        query fetchProjectRoles { 
            ${ProjectRole.modelName}{
                    ${ProjectRole.selector.id}
                    ${ProjectRole.selector.role}
                    ${ProjectRole.selector.deleted}
            }
        }`;

export const LOAD_PROJECT_ROLE_BY_NAME = gql`
        query fetchProjectRoleByName($name: String!){
            ${ProjectRole.modelName}(
                where:{
                    ${TenantRole.selector.role}: {_ilike: $name},
                    ${TenantRole.selector.deleted}: {_eq: false}
                }){
                    ${ProjectRole.selector.id}
                    ${ProjectRole.selector.role}
            }
        }`;

export const COPY_ROLE = gql`
  mutation copyRole($roleId: Int!, $roleName: String!, $roleType: String!) {
    insert_duplicateRole_mutation(
      roleId: $roleId
      roleName: $roleName
      roleType: $roleType
    ) {
      message
      roleId
    }
  }
`;

export const DELETE_SYSTEM_ROLE = gql` mutation deleteRole($roleId: Int!) { 
        update_tenantRole(where: {${TenantRole.selector.id}: {_eq: $roleId}}, _set: {${TenantRole.selector.deleted}: true}) {
            affected_rows
        }
    }`;

export const DELETE_PROJECT_ROLE = gql`mutation deleteProjectRole($roleId: Int!) { 
        update_projectRole(where: {${ProjectRole.selector.id}: {_eq: $roleId}}, _set: {${ProjectRole.selector.deleted}: true}) {
            affected_rows
        }
    }`;

export const FETCH_SYSTEM_ROLE_BY_ID = gql`query fetchSystemRoleById($id: Int!) { 
        ${TenantRole.modelName}(where: {${TenantRole.selector.id}: {_eq: $id }}) {
            ${TenantRole.selector.id}
            ${TenantRole.selector.role}
            ${TenantRole.selector.description}
            ${TenantRole.selector.tenantId}
        }
    }`;

export const FETCH_PROJECT_ROLE_BY_ID = gql`query fetchProjectRoleById($id: Int!) { 
        ${ProjectRole.modelName}(where: {${ProjectRole.selector.id}: {_eq: $id }}){
            ${ProjectRole.selector.id}
            ${ProjectRole.selector.role}
            ${ProjectRole.selector.description}
        }
    }`;

export const FETCH_PROJECT_ROLE_PERMISSION = gql`
  query viewProjectPermission($id: Int!) {
    projectPermission(
      where: { roleId: { _eq: $id }, authValue: {} }
      distinct_on: feature
    ) {
      authValue
      feature
    }
  }
`;

export const FETCH_SYSTEM_ROLE_PERMISSION = gql`
  query viewSystemPermission($id: Int!) {
    tenantPermission(
      where: { roleId: { _eq: $id }, authValue: {} }
      distinct_on: feature
    ) {
      authValue
      feature
    }
  }
`;

export const UPDATE_ROLE = gql`
  mutation updateRole(
    $roleId: Int!
    $roleName: String!
    $description: String
    $roleType: String!
    $permissions: [permissionsArray!]!
  ) {
    updateRoleAndPermissions_mutation(
      roleId: $roleId
      roleName: $roleName
      roleType: $roleType
      description: $description
      permissions: $permissions
    ) {
      message
      roleId
      roleName
      roleType
      description
      permissions
    }
  }
`;

export const LOAD_PROJECT_FEATURE = gql`
  query fetchProjectRoleFeatures {
    projectFeature(where: { feature: { _neq: "DAILYLOG" } }) {
      feature
      id
      featureTypeId
      caption
      description
    }
  }
`;

export const LOAD_TENANT_ROLE_FEATURE = gql`
  query fetchTenantRoleFeatures {
    tenantFeature {
      feature
      id
      caption
      description
    }
  }
`;
