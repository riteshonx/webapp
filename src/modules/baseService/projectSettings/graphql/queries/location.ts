import { gql } from "@apollo/client";

export const LOAD_LOCATION_DATA=gql`query fetchProjectLocationTree($projectId: Int!) {
  projectLocationTree(where: {parentId: {_is_null: true}, project: {id: {_eq: $projectId}}}) {
    nodeName
    parentId
    id
    childNodes {
      id
      nodeName
      parentId
      childNodes {
        id
        nodeName
        parentId
        childNodes {
          id
          nodeName
          parentId
          childNodes {
            id
            nodeName
            parentId
            childNodes {
              id
              nodeName
              parentId
              childNodes {
                id
                nodeName
                parentId
                childNodes {
                  id
                  nodeName
                  parentId
                }
              }
            }
          }
        }
      }
    }
  }
}`;


export const LOAD_PROJECT_LOCATION_NODES=gql`query fetchProjectLocationTree {
  projectLocationTree{
    nodeName
    parentId
    id
  }
}`

export const CHECK_NODE_NAME_DUPLICATE= gql`query checkNodeNameDuplicate($parentId:uuid!,$nodeName: String){
    projectLocationTree(where: {parentId: {_eq: $parentId}, nodeName: {_ilike: $nodeName}}) {
      nodeName
      parentId
      id
  }
}`

export const CREATE_LOCATION_TREE= gql`mutation createLocation($id: uuid!, $nodeName: String!, $parentId: uuid! ) {
    insert_projectLocationTree(objects: {id: $id, nodeName: $nodeName, parentId: $parentId}) {
      affected_rows
    }
  }`;

  export const UPDATE_LOCATION_NODE_NAME= gql`mutation updateLocationTreeName($id: uuid!, $name: String!) {
    update_projectLocationTree(where: {id: {_eq: $id}}, _set: {nodeName: $name}) {
      affected_rows
    }
  }`;

  export const DELETE_LOCATION_TREE=gql`mutation deleteLocationTree($id: uuid!) {
    update_projectLocationTree(where: {id: {_eq: $id}}) {
      affected_rows
    }
  }`;