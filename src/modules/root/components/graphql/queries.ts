import { gql } from "@apollo/client";


export  const LOAD_PROJECT_ROLES= gql`
query fetchProjectAuthValue($roleId:Int!, $limit: Int!){
    projectPermission(where: {roleId: {_eq: $roleId}, feature: {_eq: "PROJECT_SETUP"}, authValue: {_gte: 1}}, limit: $limit) {
    authValue
    }
}`;

export const GET_TENANT_PASSWORD_CONFIGURATION = gql`
query getTenantPasswordConfiguration($tenantId: Int!) {
  tenantPasswordConfiguration(where: {tenantId: {_eq: $tenantId}}){
    passwordFormat
    passwordExpiration
    maxRetryCount
    ssoEnabled
    mfaEnabled
}
}
`
export const UPDATE_PASSWORD_CONFIGURATION = gql`
mutation updateTenantPasswordConfiguration($tenantId: Int!, $passwordFormat: jsonb, $passwordExpiration: Int = 90, $maxRetrycount: Int = 3, $ssoEnabled: Boolean = false, $mfaEnabled: Boolean = false) {
  update_tenantPasswordConfiguration(where: {tenantId: {_eq: $tenantId}}, _set: {maxRetryCount: $maxRetrycount, mfaEnabled: $mfaEnabled, passwordExpiration: $passwordExpiration, passwordFormat: $passwordFormat, ssoEnabled: $ssoEnabled}) {
    returning {
      passwordFormat
      passwordExpiration
      maxRetryCount
      ssoEnabled
      mfaEnabled
    }
  }
}
`
