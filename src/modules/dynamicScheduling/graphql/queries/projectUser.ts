import { gql } from "@apollo/client";

export const FETCH_PROJECT_ASSOCIATED_USERS= gql`query fetchProjectAssociatedUsers($projectId: Int!, $fName: String!) {
  projectAssociation(where: {projectId: {_eq: $projectId}, user: {_or: [{firstName: {_ilike: $fName}},
  {lastName: {_ilike: $fName}},
  {email: {_ilike: $fName}}]}, status: {_neq: 1}}) {
      user {
        email
        firstName
        id
        lastName
      }
    status
    role
  }
}`;

export const FETCH_PROJECT_ASSOCIATED_USERS_BY_FULL_NAME = gql`query fetchProjectAssociatedUsers($projectId: Int!, $fName: String!, $lName: String!) {
  projectAssociation(where: {projectId: {_eq: $projectId},
     user: {
      _and: {
        lastName: {_ilike: $lName},
        _or:[
          {firstName: {_ilike: $fName}},
          {email: {_ilike: $fName}}
          ]
      }
    },
      status: {_neq: 1}}) {
      user {
        email
        firstName
        id
        lastName
      }
    status
    role
  }
}`;


export const FETCH__PROJECT_ROLE_ABOVE_VIEW=gql`
    query permittedRoles($featureId: [Int!] ) {
      projectPermission(where: {featureId: {_in: $featureId}, authValue: {_gte: 2}}, distinct_on: roleId) {
        roleId
      }
}`;