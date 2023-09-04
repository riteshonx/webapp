import { gql } from "@apollo/client";
import { Schedule } from "../models/schedule";

export const LOAD_DETAIL_SCHEDULE = gql`query getScheduleList($id: uuid!) {
  ${Schedule.modelName} (where: {id: {_eq: $id}}) {
      ${Schedule.selector.id}
      ${Schedule.selector.msg}
      ${Schedule.selector.title}
      ${Schedule.selector.tasks}
      ${Schedule.selector.ruleName}
      ${Schedule.selector.component}
    }
}
`;

export const LOAD_LATEST_SCHEDULE_TIMESTAMP = gql`
  query FetchProjectInsights {
    projectInsights(
      order_by: { createdAt: desc }
      limit: 1
      where: { component: { _eq: "SchedulerComponent" } }
    ) {
      createdAt
    }
  }
`;


export const LOAD_SCHEDULE_LIST = gql`query FetchProjectInsights($gt: timestamptz, $searchKeyword: String) {
  ${Schedule.modelName}(order_by: {title: asc}, where: {createdAt: {_gt: $gt},
    component: {_eq: "SchedulerComponent"}
    title: {_ilike: $searchKeyword}}) {
      ${Schedule.selector.id}
      ${Schedule.selector.msg}
      ${Schedule.selector.title}
      ${Schedule.selector.component}
    }
}
`;
