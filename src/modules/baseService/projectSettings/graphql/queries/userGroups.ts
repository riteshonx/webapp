import { gql } from "@apollo/client";

export const LOAD_USER_GROUPS=gql`query FecthProjectUserGroups($name: String!, $projectId: Int!) {
  userGroup(where: {name: {_ilike: $name}, project: {id: {_eq: $projectId}}}) {
    id
    name
    description
    groupUsers {
      userId
    }
    createdByUser {
      firstName
      lastName
    }
  }
}
`;

export const LOAD_USER_GROUP_BY_NAME=gql`query FecthProjectUserGroupByName($name: String!) {
    userGroup(where: {deleted: {_eq: false},name: {_ilike: $name}}) {
        id
        name
    }
}`;

export const LOAD_USERS=gql`query fetchProjectUsers($name: String!) {
    user(where: {_or: [{lastName: {_ilike: $name}},{email: {_ilike: $name}}, {firstName: {_ilike: $name}}]}) {
        email
        firstName
        id
        lastName
        status
        projectAssociations {
          role
          projectRole {
            role
          }
        }
        companyAssociations {
          companyId
          company {
            name
          }
        }
    }
}`;


export const CREATE_USER_GROUP=gql`mutation createNewuserGroup($name: String!,$description: String!,$users: [uuid!]) {
    insert_userGroup_mutation(name: $name, users: $users, description: $description) {
      userGroupId
      message
    }
}`;

export const UPDATE_USER_GROUP_NAME_DESCRIPTION=gql`mutation updateUserGroup($Id:Int!,$name: String!, $description: String!) {
    update_userGroup(where: {id: {_eq: $Id}}, _set: {description: $description, name: $name}) {
      affected_rows
    }
}`;


export const INSERT_USER_GROUP_ASSOCIATION=gql`
    mutation  insertUserGroupAssociation($userGroupId:Int!, $userId:uuid! ){
      insert_userGroupAssociation(objects: {userGroupId: $userGroupId, userId: $userId},
         on_conflict: {constraint: userGroupAssociation_pkey, update_columns: deleted}) {
        returning {
          deleted
          userGroupId
          userId
          
        }
      }
    }`;

export const FETCH_USER_GROUP_DETAILS=gql`query fetchUserGroupDetails($id: Int!) {
    userGroup(where: {id: {_eq: $id}}) {
      name
      id
      description
      groupUsers {
        users {
          email
          firstName
          id
          lastName
          status
          projectAssociations {
            role
            projectRole {
              role
            }
          }
          companyAssociations {
            companyId
            company {
              name
            }
          }
        }
      }
    }
  }`;

export const DELETE_USER_GROUP= gql`mutation deleteUserGroup($id: Int) {
  update_userGroup(where: {id: {_eq: $id}}) {
    affected_rows
  }
}`;

export const REMOVE_USER_FROM_USERGROUP=gql`
  mutation updateUserFromUserGroup($userId: uuid!, $userGroupId: Int!) {
      update_userGroupAssociation(where: {userId: {_eq: $userId}, userGroupId: {_eq: $userGroupId}}) {
        affected_rows
      }
}`;