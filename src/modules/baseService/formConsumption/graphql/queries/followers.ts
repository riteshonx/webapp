import { gql } from '@apollo/client';

export const LOAD_PROJECT_USERS_BY_FULLNAME= gql`query getProjectUsers($fName: String!, $lName: String!) {
  user(where: {
      _and: {
        lastName: {_ilike: $lName},
         _or:[
           {firstName: {_ilike: $fName}},
           {email: {_ilike: $fName}}
          ]}
    }) {
        email
        firstName
        id
        lastName
        status
      }
  }
  `;

  export const LOAD_PROJECT_USERS = gql`query getProjectUsers($fName: String!) {
    user(where: {
        _or: [
              {lastName: {_ilike: $fName}},
              {firstName: {_ilike: $fName}},
              {email: {_ilike: $fName}}
            ]
      }) {
          email
          firstName
          id
          lastName
          status
        }
    }
    `;

export const LOAD_PROJECT_USER_GROUPS= gql`query getProjectUserGroup($fName: String!, $lName: String!) {
  userGroup(where: {_or: [{name: {_ilike: $fName}},
    	{
        groupUsers: {users: {
        _and: {
          lastName: {_ilike: $lName},
          _or: [{
              firstName: {_ilike: $fName}}, 
              {email: {_ilike: $fName}
          }]
        }
      }
    }}]}) {
    name
    id
    groupUsers {
      users {
        firstName
        id
        lastName
        email
        status
      }
    }
  }
}`;

export const LOAD_FORM_USERS= gql`query getFormFollowers($formId: Int!) {
    formsFollower(where: {formInstanceId: {_eq: $formId}}) {
      userId
      user {
        email
        firstName
        id
        lastName
        status
      }
    }
  }
  `;

  export const LOAD_FORM_USER_GROUPS= gql`query getFormFollowers($formId: Int!) {
    formsUserGroup(where: {formInstanceId: {_eq: $formId}}) {
        formInstanceId
        userGroupId
        userGroup {
          name
          groupUsers {
            users {
              id
              lastName
              firstName
              email
              status
            }
          }
        }
      }
    }
  `;

export const ADD_TENANT_USER_FOLLOWERS= gql`
    mutation addTenantFollowers($featureId: Int!, $formId: Int!,  $userIds: [String]) {
        insertFollowers_mutation(featureId: $featureId, formId: $formId, userIds:  $userIds) {
        message
        }
}`;

export const ADD_TENANT_USERGROUP_FOLLOWERS= gql`
    mutation addTenantFollowers($featureId: Int!, $formId: Int!, $userGroupIds: [Int]) {
        insertFollowers_mutation(featureId: $featureId, formId: $formId, userGroupIds: $userGroupIds) {
        message
        }
}`;

export const DELETE_TENANT_USERS= gql`mutation deleteFormsUsers($formId: Int!, $userId: uuid! ) {
    delete_formsFollower(where: {formInstanceId: {_eq: $formId}, userId: {_eq: $userId}}) {
      affected_rows
    }
  }`;

export const DELETE_FORM_USER_GROUPS= gql`mutation deleteFormUserGroup($formInstanceId: Int!, $userGroupId: Int!) {
    delete_formsUserGroup(where: {formInstanceId: {_eq: $formInstanceId}, userGroupId: {_eq: $userGroupId}}) {
      affected_rows
    }
  }`;

export const FETCH_USER_GROUP_MEMBERS=gql`query fetchUserGroupMembers($id: Int!,$name: String!) {
  userGroup(where: {id: {_eq: $id}}) {
    id
    name
    groupUsers(where:{
      users:{_or:[{firstName:{_ilike:$name}},{lastName:{_ilike:$name}},
      {email:{_ilike:$name}}]}
    }) {
      users {
        email
        firstName
        lastName
        status
      }
    }
  }
}
`