import { gql } from "@apollo/client";
import { Schedule } from "../models/schedule";

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

export const LOAD_IMPACTED_INSIGHT_LIST = gql`query LoadImpactedInsightList($searchKeyword: String) {
  projectInsights(
    limit: 1, 
    where: {
      component: {
        _eq: "ScheduleImpact"
      }
    },
    order_by: {
      createdAt: desc
    }) {
      ${Schedule.selector.id}
      ${Schedule.selector.msg}
      ${Schedule.selector.title}
      ${Schedule.selector.component}
      ${Schedule.selector.tasks}
  }
}`;

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

export const INSIGHTS_LIST_BY_METRIC = gql`
  query insightsListByMetric($metric: [String!], $userId: uuid!) {
    projectInsightsDrilldown(
      where: { metric: { _in: $metric }, isDeleted: { _eq: false } }
    ) {
      id
      messagesShortWeb
      messagesLongWeb
      taskId
      projectTask {
        taskName
      }
      recommendation
      projectInsightsDatasources {
        datasource {
          datasourceName
          projectInsightsRatings_aggregate(
            where: {
              persona: { projectAssociations: { userId: { _eq: $userId } } }
              projectPhase: { projectPhaseDetails: { deleted: { _eq: false } } }
            }
          ) {
            aggregate {
              max {
                rating
              }
            }
          }
        }
      }
    }
  }
`;

export const GET_INSIGHTS_INFO = gql`
  query projectSchedImpactDetails($tenantId: Int!, $projectId: Int!) {
    projectInsightsDrilldown(
      where: {
        tenantId: { _eq: $tenantId }
        projectId: { _eq: $projectId }
        taskId: { _is_null: false }
        isDeleted: { _eq: false }
        projectTask: { taskType: { _in: ["task", "milestone", "project"] } }
      }
      order_by: { projectTask: { plannedStartDate: asc } }
    ) {
      taskId
      projectTask {
        taskName
        taskType
        plannedStartDate
        plannedEndDate
        projectInsightsTaskDelays {
          forecastedStartDate
          forecastedEndDate
          forecastedDelay
          taskType
          impactDetails
        }
      }
    }
  }
`;

export const LOAD_TASK_IMPACT_INSIGHT = gql`
  query loadTaskImpactInsight($taskId: uuid) {
    projectScheduleImpactInsight(where: { isDeleted: { _eq: false } }) {
      id
      isDeleted
      messages_web
      type
      taskId
      priority
    }
  }
`;

export const FETCH_PROJECT_ASSOCIATED_USERS = gql`
  query fetchProjectAssociatedUsers ($projectId: Int) {
    projectAssociation (where: {projectId: {_eq: $projectId}}){
      user {
        email
        firstName
        id
        lastName
      }
      status
      role
    }
  }
`;

export const IS_PROJECT_INSIGHT = gql`
  query isProjectInsight($id: Int!) {
    projectInsightsDrilldown(
      where: { id: { _eq: $id }, isDeleted: { _eq: false } }
    ) {
      id
    }
  }
`;
