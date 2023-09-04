import { gql } from "@apollo/client";

export const GET_ALL_INSIGHTS_FOR_METRIC = gql`query getAllInsightsForMetric($metric: String) {
  projectInsightsMaster(where: {metric: {_eq: $metric}}) {
    projectInsightsDrilldowns {
      messagesShortWeb
      id
    }
  }
}
`

export const GET_INSIGHTS_DETAIL_BY_ID = gql`query getInsightsDetailById($id: Int!) {
  projectInsightsDrilldown_by_pk(id: $id) {
    id
    messagesLongWeb
  }
}
`