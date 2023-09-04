import { gql } from "@apollo/client";

export const BIM_DISTNT_FEILD_VALUES = (tableName: string, attributeName: string, elementTableName: string ) => {
  const whereCond = (tableName === elementTableName) ? `{modelId: {_in: $_in}}`: `{${elementTableName}: {modelId: {_in: $_in}}}`; 
  return gql` 
    query fetchDistinctAttrVaules($_in: [uuid!] = "") {
        ${tableName}(where: ${whereCond}, distinct_on: ${attributeName}) {
            ${attributeName}
        }
    }`
};

export const BIM_FETCH_QUERY_RESULT = (whereCond: string, variable: any) => {
    const variableList = variable.reduce((result: string, item: string) => result + ', $' + item + ': jsonb = ""', '')
    return gql` 
    query fetchBimQueryResult($_in: [uuid!] = "" ${variableList}) {
        bimElementProperties(${whereCond})  {
            sourceId
        }
    }`
};

export const INSERT_BIM_VIEW = gql` 
mutation INSERT_BIM_VIEW($viewName: String = "", $modelId: uuid = "", $ghostExcluded: Boolean = false, $isSystemView: Boolean = false) {
    insert_bimView(objects: {viewName: $viewName, modelId: $modelId, ghostExcluded: $ghostExcluded, isSystemView: $isSystemView }) {
      returning {
        id
      }
    }
}`;

export const UPDATE_BIM_VIEW = gql` 
mutation UPDATE_BIM_VIEW($id: uuid = "", $fields: bimView_set_input = {}) {
    update_bimView(where: {id: {_eq: $id}}, _set: $fields) {
      affected_rows
    }
}`;

export const INSERT_BIM_FILTER = gql` 
mutation INSERT_BIM_FILTER($viewId: uuid! = "", $modelId: uuid! = "", $queryType: String! = "", $queryName: String = "", $queryParams: jsonb = "", $queryResult: [Int]! = [], $filterName: String! = "", $colours: [Int] = 10, $taskId: String! = "") {
  insertBimFilterQuery_mutation(
    filterName: $filterName
    modelId: $modelId
    queryResult: $queryResult
    queryType: $queryType
    viewId: $viewId
    queryParams: $queryParams
    queryName: $queryName
    colours: $colours
    taskId: $taskId
  ) {
    filterId
    queryId
    __typename
  }
}
`;

export const INSERT_BIM_FILTER_USING_QUERY_ID = gql` 
mutation INSERT_BIM_FILTER_USING_QUERY_ID($viewId: uuid! = "", $modelId: uuid! = "", $queryType: String! = "", $queryId: uuid! = "", $queryResult: [Int]! = [], $filterName: String! = "", $colours: [Int] = 10, $taskId: String! = "") {
  insertBimFilterQuery_mutation(
    filterName: $filterName
    modelId: $modelId
    queryResult: $queryResult
    viewId: $viewId
    queryId: $queryId
    colours: $colours
    taskId: $taskId
  ) {
    filterId
    queryId
    __typename
  }
}
`;

export const UPDATE_BIM_FILTER = gql` 
mutation UPDATE_BIM_FILTER($colours: [Int!]! = 10, $delete: String! = "", $filterId: uuid! = "", $filterName: String! = "", $viewId: uuid! = "", $modelId: uuid = "") {
  updateBimFilter_mutation(
    colours: $colours, 
    delete: $delete, 
    filterId: $filterId, 
    filterName: $filterName, 
    viewId: $viewId,
    modelId: $modelId
  ) {
    message
  }
}
`;

export const UPDATE_BIM_QUERY = gql` 
mutation UPDATE_BIM_QUERY($filterId: uuid! = "", $queryName: String! = "", $queryParams: jsonb! = "", $queryResult: [Int]! = 10, $queryType: String! = "", $viewId: uuid! = "", $modelId: uuid = "") {
  updateBimQuery_mutation(
    filterId: $filterId, 
    queryName: $queryName, 
    queryParams: $queryParams, 
    queryResult: $queryResult, 
    queryType: $queryType, 
    viewId: $viewId,
    modelId: $modelId) {
    message,
    queryId
  }
}
`;

export const FETCH_BIM_VIEW_BY_MODEL = gql` 
query FETCH_BIM_VIEW_BY_MODEL($modelId: uuid = "") {
    bimView(where: {modelId: {_eq: $modelId}}, order_by: {createdAt: desc}) {
      ghostExcluded
      id
      viewName
      viewThumbnail,
      isSystemView,
      isImport,
      viewType
    }
}`;

export const FETCH_BIM_VIEW_BY_VIEW = gql` 
query FETCH_BIM_VIEW_BY_VIEW($id: uuid = "") {
    bimView(where: {id: {_eq: $id}}) {
      ghostExcluded
      id
      viewName
      isImport
      bimViewFilterAssociations {
        queryResult
        filterId
        isMaterialUpdated
        bimFilter {
          colorStyleB
          colorStyleG
          colorStyleR
          filterName
          id
          querId
          bimQuery {
            queryParams
            queryType
            queryname
            id
          }
        }
      }
    }
}`;

export const FETCH_BIM_QUERY_BY_MODEL = gql` 
query FETCH_BIM_QUERY_BY_MODEL($modelId: uuid = "") {
  bimQuery(where: {bimFilters: {bimViewFilterAssociations: {bimView: {modelId: {_eq: $modelId}}}}}) {
    id
    queryParams
    queryType
    queryname
  }
}`;

export const FETCH_SPATIAL_RESULT = gql` 
query MyQuery($max : [Float!]! = [], $min: [Float!]! = [], $modelIds: [uuid!] = "") {
  bimSpatialElement_query(maxBoundingBox: $max, minBoundingBox: $min, modelIds: $modelIds) {
    handleIds
  }
}`;

export const CHECK_VIEW_NAME_DUPLICATE = gql`
query MyQuery($name: String = "",$modelId: uuid = "", $viewId: uuid = null){
  bimView(limit: 1, where: {id: {_neq: $viewId},viewName: {_eq: $name}, modelId: {_eq: $modelId}}) {
    viewName
  }
}
`

export const DELETE_BIM_VIEW = gql` 
mutation DELETE_BIM_VIEW($viewId: uuid! = "") {
  deleteBimView_mutation(viewId: $viewId) {
    message
  }
}`;

export const FETCH_ATTR_LIST = gql` 
query FETCH_ATTR_LIST($modelIds: [uuid!] = "") {
  getFilteredBimQueryAttributes_query(modelIds: $modelIds) {
    attribute
  }
}
`;

export const FETCH_NON_PRIOR_ATTR_LIST = gql` 
query FETCH_NON_PRIOR_ATTR_LIST($modelIds: [uuid!] = "") {
  getNonPriorityBimAttributes_query(modelIds: $modelIds) {
    attributes
  }
}
`;

export const FETCH_NON_PRIOR_ATTR_VALUE = gql` 
query FETCH_NON_PRIOR_ATTR_VALUE($attribute: String! = "", $modelIds: [uuid!] = "") {
  getValueOfNonPriorityBimAttribute_query(attribute: $attribute, modelIds: $modelIds) {
    attributeValue
  }
}
`;

export const FETCH_NON_PRIOR_ATTR_RESULT = gql` 
query FETCH_NON_PRIOR_ATTR_RESULT($key: String! = "", $modelIds: [uuid!] = "", $operator: String! = "", $value: [String!] = "") {
  getElementsByNonPriorityBimAttribute_query(key: $key, modelIds: $modelIds, operator: $operator, value: $value) {
    data
  }
}
`;

export const FETCH_ELEM_PROP_BY_VIEW = gql` 
query FETCH_ELEM_PROP_BY_VIEW($viewId: uuid = "") {
  getElementPropertiesByView_query(viewId: $viewId) {
    data
  }
}
`;

export const FETCH_ELEM_PROP_BY_VIEW_OFFSET = gql` 
query FETCH_ELEM_PROP_BY_VIEW($offset: Int = 0, $limit: Int = 1, $viewId: uuid = "") {
  getElementPropertiesByView_query(viewId: $viewId, offset: $offset, limit: $limit) {
    data
  }
}
`;

export const FETCH_BIM_ELEMENT_NAME_BY_MODEL = gql` 
query FETCH_BIM_QUERY_BY_MODEL($modelIds: [uuid!] = "", $sourceIds: [Int!] = []) {
  bimElementProperties(where: {sourceId: {_in: $sourceIds}, modelId: {_in: $modelIds}}) {
    sourceId
    bimFamilyProperty {
      familyName
      type
    }
  }
}`;

export const FETCH_BIM_ELEMENT_NAME = gql` 
query FETCH_BIM_ELEMENT_NAME($modelIds: [uuid!] = "") {
  bimElementProperties(where: {modelId: {_in: $modelIds}}) {
    sourceId
    bimFamilyProperty {
      familyName
      type
    }
  }
}`;

export const FETCH_ELEMENT_PROPS_BY_ID = gql` 
query FETCH_ELEMENT_PROPS_BY_ID($_sourceId: Int, $modelId: uuid = "") {
  bimElementProperties(where: {sourceId: {_eq: $_sourceId}, modelId: {_eq: $modelId}}) {
    sourceProperties
  }
}`;


export const FETCH_ELEMENT_PROPS_BY_ID_LIST = gql` 
query FETCH_ELEMENT_PROPS_BY_LIST($_sourceIdList: [Int!]) {
  bimElementProperties(where: {sourceId: {_in: $_sourceIdList}}) {
    assemblyMarkNumber
    familyandType
    sourceId
  }
}`;

export const FETCH_SPATIAL_PROPS_BY_ID_LIST = gql` 
query FETCH_SPATIAL_PROPS_BY_ID_LIST($_in: [Int!]) {
  bimSpatialProperties(where: {bimElementProperty: {sourceId: {_in: $_in}}, objectId: {}}) {
    id
    maxBoundingBox
    minBoundingBox
  }
}`;

export const FETCH_SPATIAL_PROPS_ELEMENT_PROPS_BY_ID_LIST_MODEL_ID = gql` 
query FETCH_SPATIAL_PROPS_ELEMENT_PROPS_BY_ID_LIST_MODEL_ID($_in: [Int!], $modelId: uuid! = "") {
  bimElementProperties(where: {sourceId: {_in: $_in}, modelId: {_eq: $modelId}}) {
    id
    sourceProperties
    bimSpatialProperties {
      maxBoundingBox
      minBoundingBox
    }
    sourceId
  }
}`;

