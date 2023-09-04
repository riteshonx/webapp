import { gql } from '@apollo/client';

// export const LOAD_CONFIGURATION_LIST_VALUES=gql`query fetchCustomList($name: String!) {
//   configurationLists(where: {_and: [{name: {_eq: $name}}, {deleted: {_eq: false}}]}) {
//     id
//     name
//     createdAt
//     updatedAt
//     systemGenerated
//     configurationValues(where: {deleted: {_eq: false}}, order_by: {nodeName: asc}) {
//       parentId
//       id
//       nodeName
//     }
//   }
// }
// `;

export const LOAD_CONFIGURATION_LIST_VALUES=gql`query fetchCustomList($name: String!) {
  configurationLists(where: {_and: [{name: {_eq: $name}}]}) {
    id
    name
    createdAt
    updatedAt
    systemGenerated
    projectConfigAssociations {
      configValueId
    }
    configurationValues(order_by: {nodeName: asc}) {
      id
      nodeName
      parentId
    }
  }
}
`;
