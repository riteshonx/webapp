import { gql } from '@apollo/client';

export const LOAD_CONFIGURATION_LIST=gql`query getAllCustomList {
    configurationLists {
        name
        id
        deleted
      }
  }
`;

export const LOAD_CONFIGURATION_LIST_BY_NAME=gql`query getCustomListDetailByName($name: String) {
  configurationLists(where: {name: {_eq: $name}}) {
    name
    id
  }
}
`;

export const LOAD_CONFIGURATION_LIST_DATA = gql`query getAllCustomListData {
  configurationLists {
    id
    name
    configurationValues {
      id
      configListId
      nodeName
      parentId
      deleted
    }
  }
}  
`;

export const FETCH_COMPABY_TYPE = gql`query getCompanyType($listType: String) {
  configurationLists(where: {name: {_eq: $listType}}) {
    id
    name
    configurationValues {
      id
      configListId
      nodeName
      parentId
      deleted
    }
  }
}  
`;
