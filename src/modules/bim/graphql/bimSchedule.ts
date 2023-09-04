import { gql } from "@apollo/client";

export const FETCH_PROJECT_SCHEDULE_TREE = gql` 
query FETCH_PROJECT_SCHEDULE_TREE {
  getProjectScheduleTree_query {
    data
  }
}
`;

export const SEARCH_PROJECT_SCHEDULE_TREE = gql` 
query SEARCH_PROJECT_SCHEDULE_TREE ($searchText: String = "") {
  getProjectScheduleTree_query(searchText: $searchText) {
    data
  }
}
`;


export const FETCH_TASK_FILTER_LINK_DATA = gql` 
query FETCH_TASK_FILTER_LINK_DATA($viewId: uuid! = "") {
  getBimFilterScheduleLink_query(viewId: $viewId) {
    data
  }
}
`;

export const DELETE_BIM_FILTER_SCHEDULE_LINK = gql`
mutation DELETE_BIM_FILTER_SCHEDULE_LINK($bimFilterIds: [uuid!]! = "", $taskId: uuid! = "", $modelId: uuid = "") {
  deleteBimFilterScheduleLink_mutation(bimFilterIds: $bimFilterIds, taskId: $taskId, modelId: $modelId) {
    message
  }
}
`;

export const FETCH_TASK_LINKED_ELEMENTS = gql`
query FETCH_TASK_LINKED_ELEMENTS($endDate: String! = "", $startDate: String! = "") {
  bimScheduleElement_query(endDate: $endDate, startDate: $startDate) {
    data
  }
}
`;

export const BIM_SCHEDULE_VIEW = gql`
query BIM_SCHEDULE_VIEW($modelId: uuid = ""){
  bimscheduleView(where: {modelId: {_eq: $modelId}}) {
    bimElements
    plannedEndDate
    plannedStartDate
    projectTaskId
    status
    viewId
    modelId
  }
}
`;